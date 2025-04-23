// This file contains client-side utilities for BigQuery operations
// All actual BigQuery operations are handled through our Express backend

import { apiRequest } from './queryClient';

// Define types for responses
interface ProjectsResponse {
  projects: string[];
}

interface DatasetsResponse {
  datasets: string[];
}

interface TablesResponse {
  tables: string[];
}

export const BigQuery = {
  /**
   * Gets the list of available projects
   * @returns Promise with list of project IDs
   */
  async getProjects(): Promise<string[]> {
    try {
      const response = await apiRequest<ProjectsResponse>({
        method: 'GET',
        url: '/api/bigquery/projects'
      });
      
      return response.projects || [];
    } catch (error) {
      console.error('Error fetching BigQuery projects:', error);
      return [];
    }
  },

  /**
   * Gets datasets available in a specific project
   * @param projectId The Google Cloud project ID
   * @returns Promise with list of dataset IDs
   */
  async getDatasets(projectId: string): Promise<string[]> {
    try {
      const response = await apiRequest<DatasetsResponse>({
        method: 'GET',
        url: `/api/bigquery/datasets?projectId=${encodeURIComponent(projectId)}`
      });
      
      return response.datasets || [];
    } catch (error) {
      console.error(`Error fetching BigQuery datasets for project ${projectId}:`, error);
      return [];
    }
  },

  /**
   * Gets tables available in a specific project and dataset
   * @param projectId The Google Cloud project ID
   * @param datasetId The BigQuery dataset ID
   * @returns Promise with list of table IDs
   */
  async getTables(projectId: string, datasetId: string): Promise<string[]> {
    try {
      const response = await apiRequest<TablesResponse>({
        method: 'GET',
        url: `/api/bigquery/tables?projectId=${encodeURIComponent(projectId)}&datasetId=${encodeURIComponent(datasetId)}`
      });
      
      return response.tables || [];
    } catch (error) {
      console.error(`Error fetching BigQuery tables for ${projectId}.${datasetId}:`, error);
      return [];
    }
  }
};
