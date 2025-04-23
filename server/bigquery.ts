import { BigQuery } from '@google-cloud/bigquery';

let credentials;

try {
  // Parse the JSON credentials from the environment variable
  credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}');
} catch (error) {
  console.error('Error parsing Google Cloud credentials:', error);
  credentials = {};
}

// Initialize the BigQuery client
const bigquery = new BigQuery({
  credentials,
  // You can also set projectId here if you want to default to a specific project
});

export const bigQueryClient = {
  /**
   * Gets the BigQuery instance for advanced operations
   * @returns The BigQuery instance
   */
  getBigQueryInstance: () => {
    return bigquery;
  },

  /**
   * Validates a SQL query by performing a dry run
   * @param sql The SQL query to validate
   * @param projectId The Google Cloud project ID
   * @param dataset The BigQuery dataset (not directly used in validation)
   * @returns Validation result with estimated processing size
   */
  validateQuery: async (sql: string, projectId: string, dataset: string) => {
    try {
      if (!sql || !sql.trim()) {
        throw new Error('Empty SQL query');
      }

      // Create a query job with dry run option
      const [job] = await bigquery.createQueryJob({
        query: sql,
        dryRun: true,
        useLegacySql: false,
        projectId: projectId
      });

      // Get the statistics from the query job
      const processingGB = (job.metadata.statistics.totalBytesProcessed / 1e9).toFixed(2);

      return {
        valid: true,
        processingGB,
        message: 'Query is valid',
      };
    } catch (error: any) {
      console.error('BigQuery validation error:', error);
      return {
        valid: false,
        processingGB: '0',
        message: error.message || 'Invalid query',
      };
    }
  },

  /**
   * Determines the type of SQL operation being performed
   * @param sql The SQL query to analyze
   * @returns The operation type
   */
  getQueryType: (sql: string): 'READ' | 'WRITE' | 'DDL' | 'UNKNOWN' => {
    const sqlUpper = sql.toUpperCase().trimStart();
    
    if (sqlUpper.startsWith('SELECT') || sqlUpper.startsWith('WITH')) {
      return 'READ';
    } 
    else if (sqlUpper.startsWith('INSERT') || 
             sqlUpper.startsWith('UPDATE') || 
             sqlUpper.startsWith('DELETE') || 
             sqlUpper.startsWith('MERGE')) {
      return 'WRITE';
    }
    else if (sqlUpper.startsWith('CREATE') || 
             sqlUpper.startsWith('DROP') || 
             sqlUpper.startsWith('ALTER') || 
             sqlUpper.startsWith('TRUNCATE')) {
      return 'DDL';
    }
    
    return 'UNKNOWN';
  },

  /**
   * Executes a SQL query in BigQuery, handling both read and write operations
   * @param sql The SQL query to execute
   * @param projectId The Google Cloud project ID
   * @param dataset The BigQuery dataset (not directly used in execution)
   * @returns Query execution results
   */
  executeQuery: async (sql: string, projectId: string, dataset: string) => {
    try {
      // Set query options
      const options = {
        query: sql,
        location: 'US', // Specify the location of the dataset
        projectId: projectId
      };

      // Get the query type to determine execution method
      const queryType = bigQueryClient.getQueryType(sql);

      if (queryType === 'READ') {
        // For SELECT queries, use the query method which returns rows
        const [rows] = await bigquery.query(options);
        
        return {
          success: true,
          rows,
          affectedRows: 0,
          operation: 'READ'
        };
      } 
      else if (queryType === 'WRITE' || queryType === 'DDL') {
        // For data modification, use createQueryJob and wait for completion
        const [job] = await bigquery.createQueryJob(options);
        await job.getQueryResults();
        
        // Get statistics about the job
        const metadata = job.metadata || {};
        const statistics = metadata.statistics || {};
        const numDmlAffectedRows = statistics.numDmlAffectedRows || 0;
        
        return {
          success: true,
          rows: [],
          affectedRows: Number(numDmlAffectedRows),
          operation: queryType
        };
      }
      else {
        // Unknown operation type
        throw new Error('Unknown query type. Please use SELECT, INSERT, UPDATE, DELETE, or CREATE/ALTER/DROP statements.');
      }
    } catch (error: any) {
      console.error('BigQuery execution error:', error);
      return {
        success: false,
        error: error.message || 'Failed to execute query',
        operation: 'UNKNOWN'
      };
    }
  },
};