import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QueryResultsProps {
  results: any[];
}

const QueryResults = ({ results }: QueryResultsProps) => {
  const [rowsPerPage, setRowsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Handle no results case
  if (!results || results.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader className="border-b border-[#e8eaed]">
          <CardTitle>Query Results</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-[#5f6368]">No results found</p>
        </CardContent>
      </Card>
    );
  }
  
  // Get column headers from first result
  const columns = Object.keys(results[0]);
  
  // Pagination
  const rowsPerPageInt = parseInt(rowsPerPage);
  const totalPages = Math.ceil(results.length / rowsPerPageInt);
  const startIdx = (currentPage - 1) * rowsPerPageInt;
  const endIdx = Math.min(startIdx + rowsPerPageInt, results.length);
  const currentRows = results.slice(startIdx, endIdx);
  
  // Handle CSV export
  const handleExport = () => {
    // Convert results to CSV
    const headers = columns.join(',');
    const rows = results.map(row => 
      columns.map(col => {
        const value = row[col];
        // Handle values with commas by wrapping in quotes
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"`
          : value;
      }).join(',')
    ).join('\n');
    
    const csv = `${headers}\n${rows}`;
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'query_results.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-[#e8eaed] flex-row justify-between items-center">
        <CardTitle>Query Results</CardTitle>
        <div className="flex items-center">
          <span className="text-sm text-[#5f6368] mr-2">{results.length} rows</span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleExport}
            className="text-[#1a73e8]"
          >
            <Download className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#e8eaed]">
            <thead className="bg-[#f8f9fa]">
              <tr>
                {columns.map(column => (
                  <th 
                    key={column}
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-[#5f6368] uppercase tracking-wider"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#e8eaed]">
              {currentRows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map(column => (
                    <td 
                      key={`${rowIndex}-${column}`} 
                      className="px-6 py-4 whitespace-nowrap text-sm text-[#202124]"
                    >
                      {row[column] !== null && row[column] !== undefined 
                        ? String(row[column]) 
                        : <span className="text-[#5f6368]">NULL</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-[#f8f9fa] border-t border-[#e8eaed] flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm text-[#5f6368]">Rows per page: </span>
            <Select
              value={rowsPerPage}
              onValueChange={setRowsPerPage}
            >
              <SelectTrigger className="ml-2 border-none bg-transparent text-sm text-[#5f6368] w-16 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="text-[#5f6368]"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="mx-2 text-sm text-[#5f6368]">
              {startIdx + 1}-{endIdx} of {results.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="text-[#5f6368]"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QueryResults;
