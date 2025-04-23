import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { promptSchema, validationSchema, executionSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

// Placeholder for the BigQuery client - in a real app, you would use the actual Google Cloud client
const bigQueryClient = {
  validateQuery: async (sql: string, projectId: string, dataset: string) => {
    try {
      // This is a simplified validation - in a real app, you'd use the Google Cloud BigQuery client
      if (!sql || !sql.trim()) {
        throw new Error("Empty SQL query");
      }
      
      // Basic SQL syntax check - just an example
      const sqlLower = sql.toLowerCase();
      if (!sqlLower.includes("select")) {
        throw new Error("Query must contain a SELECT statement");
      }
      
      // Simulated estimated processing
      // In a real app, you'd use bigQuery.createQueryJob with dryRun: true
      const processingGB = (sql.length / 1000 * 0.5).toFixed(2);
      
      return {
        valid: true,
        processingGB,
        message: "Query is valid",
      };
    } catch (error: any) {
      return {
        valid: false,
        processingGB: "0",
        message: error.message || "Invalid query",
      };
    }
  },
  
  executeQuery: async (sql: string, projectId: string, dataset: string) => {
    try {
      // Simplified execution - in a real app, you'd use the Google Cloud BigQuery client
      // This is a placeholder that returns mock results
      return {
        success: true,
        rows: [
          { field1: "value1", field2: "value2" },
          { field1: "value3", field2: "value4" },
        ],
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to execute query",
      };
    }
  },
};

// Helper function to handle validation errors
function handleValidationError(error: unknown, res: Response) {
  if (error instanceof ZodError) {
    const validationError = fromZodError(error);
    return res.status(400).json({ message: validationError.message });
  }
  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate SQL from prompt
  app.post("/api/generate-sql", async (req: Request, res: Response) => {
    try {
      const { prompt, projectId, dataset } = promptSchema.parse(req.body);
      
      // Call OpenAI API to generate SQL
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an expert SQL assistant for Google BigQuery. Generate SQL based on the user's request. 
                     The SQL should be valid BigQuery SQL and optimized for performance. 
                     Return just the SQL code with no additional explanation.`
          },
          {
            role: "user",
            content: `Generate BigQuery SQL for: ${prompt} 
                     The project is "${projectId}" and the dataset is "${dataset}".`
          }
        ],
      });
      
      const sql = response.choices[0].message.content?.trim() || "";
      
      // Store the query in the database
      const query = await storage.createQuery({
        prompt,
        sql,
        projectId,
        dataset,
        processingGb: null,
        summary: null,
        results: null,
      });
      
      return res.status(200).json({
        id: query.id,
        sql: query.sql,
      });
    } catch (error) {
      return handleValidationError(error, res);
    }
  });
  
  // Validate SQL
  app.post("/api/validate-sql", async (req: Request, res: Response) => {
    try {
      const { sql, projectId, dataset } = validationSchema.parse(req.body);
      
      // Validate the query using BigQuery API
      const validationResult = await bigQueryClient.validateQuery(sql, projectId, dataset);
      
      if (!validationResult.valid) {
        // If not valid, try to fix it with OpenAI
        const fixResponse = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: "system",
              content: "You are an expert SQL assistant for Google BigQuery. Fix the following SQL query that has errors."
            },
            {
              role: "user",
              content: `The following SQL query has this error: ${validationResult.message}
                        Please fix it: ${sql}`
            }
          ],
        });
        
        const fixedSql = fixResponse.choices[0].message.content?.trim() || "";
        
        // Validate the fixed query
        const fixedValidationResult = await bigQueryClient.validateQuery(
          fixedSql, 
          projectId, 
          dataset
        );
        
        return res.status(200).json({
          valid: fixedValidationResult.valid,
          processingGB: fixedValidationResult.processingGB,
          message: fixedValidationResult.message,
          sql: fixedSql,
          fixed: true,
        });
      }
      
      return res.status(200).json({
        valid: validationResult.valid,
        processingGB: validationResult.processingGB,
        message: validationResult.message,
        fixed: false,
      });
    } catch (error) {
      return handleValidationError(error, res);
    }
  });
  
  // Generate summary
  app.post("/api/generate-summary", async (req: Request, res: Response) => {
    try {
      const { sql, projectId, dataset } = validationSchema.parse(req.body);
      
      // Call OpenAI API to summarize the SQL
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an independent SQL reviewer. Analyze the SQL query provided and explain in simple terms what it does.
                     Your explanation should be clear, concise, and understandable by non-technical users.
                     Include what tables are being queried, what data is being retrieved, and any filters or calculations being applied.
                     Format your response in markdown with bullet points for clarity.`
          },
          {
            role: "user",
            content: `Analyze this BigQuery SQL: ${sql}
                     Project: ${projectId}, Dataset: ${dataset}`
          }
        ],
      });
      
      const summary = response.choices[0].message.content?.trim() || "";
      
      return res.status(200).json({
        summary,
      });
    } catch (error) {
      return handleValidationError(error, res);
    }
  });
  
  // Execute SQL
  app.post("/api/execute-sql", async (req: Request, res: Response) => {
    try {
      const { sql, projectId, dataset } = executionSchema.parse(req.body);
      
      // Execute the query using BigQuery API
      const executionResult = await bigQueryClient.executeQuery(sql, projectId, dataset);
      
      if (!executionResult.success) {
        return res.status(400).json({
          message: executionResult.error,
        });
      }
      
      return res.status(200).json({
        results: executionResult.rows,
      });
    } catch (error) {
      return handleValidationError(error, res);
    }
  });
  
  // Get query history
  app.get("/api/query-history", async (_req: Request, res: Response) => {
    try {
      const queries = await storage.getQueries();
      
      return res.status(200).json({
        queries,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
