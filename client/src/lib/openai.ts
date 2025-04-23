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
  results: any[];
}

// Function to generate SQL from prompt
export async function generateSQL(
  prompt: string, 
  projectId: string, 
  dataset: string
): Promise<GenerateSQLResponse> {
  const response = await apiRequest('POST', '/api/generate-sql', {
    prompt,
    projectId,
    dataset
  });
  
  return await response.json();
}

// Function to validate SQL
export async function validateSQL(
  sql: string, 
  projectId: string, 
  dataset: string
): Promise<ValidateSQLResponse> {
  const response = await apiRequest('POST', '/api/validate-sql', {
    sql,
    projectId,
    dataset
  });
  
  return await response.json();
}

// Function to generate summary
export async function generateSummary(
  sql: string, 
  projectId: string, 
  dataset: string
): Promise<GenerateSummaryResponse> {
  const response = await apiRequest('POST', '/api/generate-summary', {
    sql,
    projectId,
    dataset
  });
  
  return await response.json();
}

// Function to execute SQL
export async function executeSQL(
  sql: string, 
  projectId: string, 
  dataset: string
): Promise<ExecuteSQLResponse> {
  const response = await apiRequest('POST', '/api/execute-sql', {
    sql,
    projectId,
    dataset
  });
  
  return await response.json();
}
