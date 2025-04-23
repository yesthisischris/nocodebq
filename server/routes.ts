import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { promptSchema, validationSchema, executionSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import OpenAI from "openai";
import { bigQueryClient } from "./bigquery";

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

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

  // BigQuery metadata endpoints
  app.get("/api/bigquery/projects", async (_req: Request, res: Response) => {
    try {
      const bigquery = bigQueryClient.getBigQueryInstance();
      const [projects] = await bigquery.getProjects();
      const projectIds = projects.map((project: any) => project.id);
      
      return res.status(200).json({
        projects: projectIds,
      });
    } catch (error) {
      console.error("Error fetching BigQuery projects:", error);
      return res.status(500).json({ message: "Failed to fetch BigQuery projects" });
    }
  });

  app.get("/api/bigquery/datasets", async (req: Request, res: Response) => {
    try {
      const { projectId } = req.query;
      
      if (!projectId || typeof projectId !== 'string') {
        return res.status(400).json({ message: "Project ID is required" });
      }
      
      const bigquery = bigQueryClient.getBigQueryInstance();
      const [datasets] = await bigquery.getDatasets({ projectId });
      const datasetIds = datasets.map((dataset: any) => dataset.id);
      
      return res.status(200).json({
        datasets: datasetIds,
      });
    } catch (error) {
      console.error("Error fetching BigQuery datasets:", error);
      return res.status(500).json({ message: "Failed to fetch BigQuery datasets" });
    }
  });

  app.get("/api/bigquery/tables", async (req: Request, res: Response) => {
    try {
      const { projectId, datasetId } = req.query;
      
      if (!projectId || typeof projectId !== 'string') {
        return res.status(400).json({ message: "Project ID is required" });
      }
      
      if (!datasetId || typeof datasetId !== 'string') {
        return res.status(400).json({ message: "Dataset ID is required" });
      }
      
      const bigquery = bigQueryClient.getBigQueryInstance();
      const dataset = bigquery.dataset(datasetId, { projectId });
      const [tables] = await dataset.getTables();
      const tableIds = tables.map((table: any) => table.id);
      
      return res.status(200).json({
        tables: tableIds,
      });
    } catch (error) {
      console.error("Error fetching BigQuery tables:", error);
      return res.status(500).json({ message: "Failed to fetch BigQuery tables" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
