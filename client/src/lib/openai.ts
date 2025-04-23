import { apiRequest } from './queryClient';

// Types for API responses
interface GenerateSQLResponse {
  id: number;
  sql: string;
}

interface ValidateSQLResponse {
  valid: boolean;
  processingGB: string;
  message: string;
  sql?: string;
  fixed: boolean;
}

interface GenerateSummaryResponse {
  summary: string;
}

interface ExecuteSQLResponse {
  // For READ operations (SELECT queries)
  results?: any[];
  operation: 'READ' | 'WRITE';
  
  // For WRITE operations (INSERT, UPDATE, DELETE, CREATE, etc.)
  affectedRows?: number;
  message?: string;
}

// Function to generate SQL from prompt
export async function generateSQL(
  prompt: string, 
  projectId: string, 
  dataset: string
): Promise<GenerateSQLResponse> {
  const response = await apiRequest({
    method: 'POST', 
    url: '/api/generate-sql', 
    data: {
      prompt,
      projectId,
      dataset
    }
  });
  
  return response;
}

// Function to validate SQL
export async function validateSQL(
  sql: string, 
  projectId: string, 
  dataset: string
): Promise<ValidateSQLResponse> {
  const response = await apiRequest({
    method: 'POST', 
    url: '/api/validate-sql', 
    data: {
      sql,
      projectId,
      dataset
    }
  });
  
  return response;
}

// Function to generate summary
export async function generateSummary(
  sql: string, 
  projectId: string, 
  dataset: string
): Promise<GenerateSummaryResponse> {
  const response = await apiRequest({
    method: 'POST', 
    url: '/api/generate-summary', 
    data: {
      sql,
      projectId,
      dataset
    }
  });
  
  return response;
}

// Function to execute SQL
export async function executeSQL(
  sql: string, 
  projectId: string, 
  dataset: string
): Promise<ExecuteSQLResponse> {
  const response = await apiRequest({
    method: 'POST', 
    url: '/api/execute-sql', 
    data: {
      sql,
      projectId,
      dataset
    }
  });
  
  return response;
}
