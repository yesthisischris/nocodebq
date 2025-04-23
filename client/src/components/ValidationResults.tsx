import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, CheckCircle, Play } from "lucide-react";

interface ValidationResultsProps {
  validationResult: {
    valid: boolean;
    processingGB: string;
    message: string;
    fixed?: boolean;
  };
  onGenerateSummary: () => void;
  isGeneratingSummary: boolean;
}

const ValidationResults = ({ 
  validationResult, 
  onGenerateSummary, 
  isGeneratingSummary 
}: ValidationResultsProps) => {
  const { valid, processingGB, message, fixed } = validationResult;

  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-[#e8eaed] flex-row justify-between items-center">
        <CardTitle>Validation Results</CardTitle>
        {valid && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Valid Query
          </span>
        )}
        {!valid && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Invalid Query
          </span>
        )}
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#f8f9fa] rounded-md p-4">
            <div className="text-sm text-[#5f6368] mb-1">Estimated Processing</div>
            <div className="flex items-center">
              <span className="text-lg font-medium">
                {processingGB} GB
              </span>
              <Info 
                className="h-4 w-4 ml-1 text-[#fbbc04]" 
                title={`This query will process ${processingGB} GB of data`} 
              />
            </div>
          </div>
          
          <div className="bg-[#f8f9fa] rounded-md p-4">
            <div className="text-sm text-[#5f6368] mb-1">Status</div>
            <div className="flex items-center">
              {valid ? (
                <span className="inline-flex items-center text-[#34a853]">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>Ready for Summary</span>
                </span>
              ) : (
                <span className="text-red-600">
                  {message}
                </span>
              )}
            </div>
            {fixed && (
              <div className="text-sm text-[#1a73e8] mt-1">
                The query was automatically fixed
              </div>
            )}
          </div>
          
          <div className="bg-[#f8f9fa] rounded-md p-4">
            <div className="text-sm text-[#5f6368] mb-1">Next Step</div>
            <div className="flex items-center">
              <span className="text-[#202124]">
                {valid ? "Generate Summary" : "Fix Issues"}
              </span>
            </div>
          </div>
        </div>
        
        {valid && (
          <div className="mt-4">
            <Button
              onClick={onGenerateSummary}
              disabled={isGeneratingSummary}
              className="bg-[#34a853] hover:bg-green-700"
            >
              <Play className="h-4 w-4 mr-1" />
              Generate Summary
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ValidationResults;
