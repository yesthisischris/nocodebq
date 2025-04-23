import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";

interface PromptPanelProps {
  projectId: string;
  setProjectId: (value: string) => void;
  dataset: string;
  setDataset: (value: string) => void;
  prompt: string;
  setPrompt: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  allowEdit: boolean;
}

const PromptPanel = ({
  projectId,
  setProjectId,
  dataset,
  setDataset,
  prompt,
  setPrompt,
  onSubmit,
  disabled,
  allowEdit,
}: PromptPanelProps) => {
  // Sample project and dataset options - in a real app, these would come from an API
  const projectOptions = [
    { value: "my-analytics-project", label: "my-analytics-project" },
    { value: "marketing-data-2023", label: "marketing-data-2023" },
    { value: "finance-reporting", label: "finance-reporting" },
  ];
  
  const datasetOptions = [
    { value: "ecommerce_analytics", label: "ecommerce_analytics" },
    { value: "user_behavior", label: "user_behavior" },
    { value: "product_catalog", label: "product_catalog" },
  ];
  
  // Extract keywords from prompt for badges
  const getKeywords = () => {
    if (!prompt) return [];
    
    const keywords = prompt.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !["from", "where", "select", "with", "this", "that", "what", "when", "show", "give", "list"].includes(word))
      .slice(0, 5);
    
    return [...new Set(keywords)];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Context</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="project-id" className="block text-sm font-medium mb-1">Project ID</Label>
            <Select
              value={projectId}
              onValueChange={setProjectId}
              disabled={disabled}
            >
              <SelectTrigger id="project-id" className="w-full">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projectOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="dataset" className="block text-sm font-medium mb-1">Dataset</Label>
            <Select
              value={dataset}
              onValueChange={setDataset}
              disabled={disabled}
            >
              <SelectTrigger id="dataset" className="w-full">
                <SelectValue placeholder="Select a dataset" />
              </SelectTrigger>
              <SelectContent>
                {datasetOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Prompt</CardTitle>
          {allowEdit && (
            <Button 
              variant="ghost" 
              className="text-[#1a73e8] hover:text-blue-700 p-0 h-auto"
              onClick={() => {}}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {allowEdit ? (
            <div className="bg-[#f8f9fa] rounded-md p-4 mb-4">
              <p className="text-[#202124] text-sm">{prompt}</p>
            </div>
          ) : (
            <div className="mb-4">
              <Textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what SQL query you need in plain language..."
                className="min-h-[100px]"
                disabled={disabled}
              />
            </div>
          )}
          
          {prompt && (
            <div className="flex flex-wrap gap-2">
              {getKeywords().map((keyword, index) => {
                const colors = ["blue", "purple", "green", "amber", "red"];
                const colorClass = colors[index % colors.length];
                
                return (
                  <Badge 
                    key={keyword}
                    variant="outline" 
                    className={`bg-${colorClass}-100 text-${colorClass}-800 hover:bg-${colorClass}-100 border-${colorClass}-200`}
                  >
                    {keyword}
                  </Badge>
                );
              })}
            </div>
          )}
          
          {!allowEdit && (
            <div className="mt-4">
              <Button 
                onClick={onSubmit} 
                className="w-full bg-[#1a73e8] hover:bg-blue-700"
                disabled={!prompt || !projectId || !dataset || disabled}
              >
                Generate SQL
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PromptPanel;
