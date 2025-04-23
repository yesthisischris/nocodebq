import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Edit } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface QuerySummaryProps {
  summary: string;
  onApprove: () => void;
  onModify: () => void;
  isExecuting: boolean;
}

const QuerySummary = ({ 
  summary, 
  onApprove, 
  onModify, 
  isExecuting 
}: QuerySummaryProps) => {
  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-[#e8eaed]">
        <CardTitle>Independent Query Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="bg-[#f8f9fa] rounded-md p-4 mb-4">
          <ReactMarkdown className="prose max-w-none text-[#202124]">
            {summary}
          </ReactMarkdown>
        </div>
        
        <div className="flex space-x-4">
          <Button 
            onClick={onApprove} 
            disabled={isExecuting}
            className="bg-[#1a73e8] hover:bg-blue-700"
          >
            <Check className="h-4 w-4 mr-1" />
            Approve and Execute
          </Button>
          
          <Button 
            onClick={onModify} 
            variant="outline" 
            className="border-[#dadce0] text-[#5f6368]"
          >
            <Edit className="h-4 w-4 mr-1" />
            Modify Query
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuerySummary;
