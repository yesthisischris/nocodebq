import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Edit, RefreshCw } from "lucide-react";
import SQLEditor from "./SQLEditor";

interface MainPanelProps {
  sql: string;
  setSql: (sql: string) => void;
  onValidate: () => void;
  onEdit: () => void;
  onRegenerate: () => void;
  isValidating: boolean;
}

const MainPanel = ({ 
  sql, 
  setSql, 
  onValidate, 
  onEdit, 
  onRegenerate, 
  isValidating 
}: MainPanelProps) => {
  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-[#e8eaed]">
        <CardTitle>Generated SQL</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-4">
          <SQLEditor 
            value={sql} 
            onChange={setSql} 
          />
        </div>
        
        <div className="flex flex-wrap gap-3 mb-4">
          <Button 
            onClick={onValidate} 
            disabled={!sql || isValidating}
            className="bg-[#1a73e8] hover:bg-blue-700"
          >
            <Check className="h-4 w-4 mr-1" />
            Validate Query
          </Button>
          
          <Button 
            onClick={onEdit} 
            variant="outline" 
            className="border-[#dadce0] text-[#5f6368]"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          
          <Button 
            onClick={onRegenerate} 
            variant="outline" 
            className="border-[#dadce0] text-[#5f6368]"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Regenerate
          </Button>
        </div>
        
        <div className="text-sm text-[#5f6368]">
          <p>This query was generated based on your prompt. You can edit it if needed.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MainPanel;
