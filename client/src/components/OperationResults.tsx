import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface OperationResultsProps {
  message: string;
  affectedRows?: number;
}

const OperationResults = ({ message, affectedRows }: OperationResultsProps) => {
  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-[#e8eaed] flex-row justify-between items-center">
        <CardTitle>Operation Results</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-center flex-col text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-xl font-medium text-[#202124] mb-2">
            Operation Completed Successfully
          </h3>
          <p className="text-[#5f6368] mb-2">{message}</p>
          {affectedRows !== undefined && (
            <div className="mt-2 p-3 bg-[#f8f9fa] rounded-md">
              <span className="font-medium">{affectedRows}</span> rows affected
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OperationResults;