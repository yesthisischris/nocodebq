import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import AppHeader from "@/components/AppHeader";
import StepIndicator from "@/components/StepIndicator";
import PromptPanel from "@/components/PromptPanel";
import MainPanel from "@/components/MainPanel";
import ValidationResults from "@/components/ValidationResults";
import QuerySummary from "@/components/QuerySummary";
import QueryResults from "@/components/QueryResults";
import { useToast } from "@/hooks/use-toast";
import { generateSQL, validateSQL, generateSummary, executeSQL } from "@/lib/openai";

// Types
type Step = "prompt" | "generate" | "validate" | "summary" | "execute";

// Step info
const steps = [
  { id: "prompt", label: "Prompt" },
  { id: "generate", label: "Generate SQL" },
  { id: "validate", label: "Validate" },
  { id: "summary", label: "Summary" },
  { id: "execute", label: "Execute" },
];

const Home = () => {
  const { toast } = useToast();
  
  // State
  const [activeStep, setActiveStep] = useState<Step>("prompt");
  const [projectId, setProjectId] = useState<string>("");
  const [dataset, setDataset] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [sql, setSql] = useState<string>("");
  const [validationResult, setValidationResult] = useState<any>(null);
  const [summary, setSummary] = useState<string>("");
  const [results, setResults] = useState<any[]>([]);
  
  // Mutations
  const sqlMutation = useMutation({
    mutationFn: async () => {
      if (!prompt || !projectId || !dataset) {
        throw new Error("Please provide a prompt, project ID, and dataset");
      }
      return await generateSQL(prompt, projectId, dataset);
    },
    onSuccess: (data) => {
      setSql(data.sql);
      setActiveStep("generate");
      toast({
        title: "SQL Generated",
        description: "SQL query has been generated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate SQL",
        variant: "destructive",
      });
    },
  });
  
  const validateMutation = useMutation({
    mutationFn: async () => {
      if (!sql || !projectId || !dataset) {
        throw new Error("Please provide SQL, project ID, and dataset");
      }
      return await validateSQL(sql, projectId, dataset);
    },
    onSuccess: (data) => {
      setValidationResult(data);
      
      if (data.fixed) {
        setSql(data.sql || "");
        toast({
          title: "SQL Fixed",
          description: "The SQL has been automatically fixed",
        });
      }
      
      if (data.valid) {
        setActiveStep("validate");
        toast({
          title: "SQL Validated",
          description: `Query is valid and will process approximately ${data.processingGB} GB`,
        });
      } else {
        toast({
          title: "Validation Failed",
          description: data.message || "Failed to validate SQL",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to validate SQL",
        variant: "destructive",
      });
    },
  });
  
  const summaryMutation = useMutation({
    mutationFn: async () => {
      if (!sql || !projectId || !dataset) {
        throw new Error("Please provide SQL, project ID, and dataset");
      }
      return await generateSummary(sql, projectId, dataset);
    },
    onSuccess: (data) => {
      setSummary(data.summary);
      setActiveStep("summary");
      toast({
        title: "Summary Generated",
        description: "Query summary has been generated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate summary",
        variant: "destructive",
      });
    },
  });
  
  const executeMutation = useMutation({
    mutationFn: async () => {
      if (!sql || !projectId || !dataset) {
        throw new Error("Please provide SQL, project ID, and dataset");
      }
      return await executeSQL(sql, projectId, dataset);
    },
    onSuccess: (data) => {
      setResults(data.results);
      setActiveStep("execute");
      toast({
        title: "Query Executed",
        description: "SQL query has been executed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to execute SQL",
        variant: "destructive",
      });
    },
  });
  
  // Event handlers
  const handlePromptSubmit = () => {
    sqlMutation.mutate();
  };
  
  const handleValidate = () => {
    validateMutation.mutate();
  };
  
  const handleGenerateSummary = () => {
    summaryMutation.mutate();
  };
  
  const handleExecute = () => {
    executeMutation.mutate();
  };
  
  const handleEdit = () => {
    setActiveStep("generate");
  };
  
  const handleRegenerate = () => {
    sqlMutation.mutate();
  };
  
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StepIndicator 
          steps={steps} 
          activeStep={activeStep}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-1">
            <PromptPanel
              projectId={projectId}
              setProjectId={setProjectId}
              dataset={dataset}
              setDataset={setDataset}
              prompt={prompt}
              setPrompt={setPrompt}
              onSubmit={handlePromptSubmit}
              disabled={sqlMutation.isPending}
              allowEdit={activeStep !== "prompt"}
            />
          </div>
          
          {/* Main Panel */}
          <div className="lg:col-span-2">
            {(activeStep === "generate" || activeStep === "validate" || activeStep === "summary" || activeStep === "execute") && (
              <MainPanel
                sql={sql}
                setSql={setSql}
                onValidate={handleValidate}
                onEdit={handleEdit}
                onRegenerate={handleRegenerate}
                isValidating={validateMutation.isPending}
              />
            )}
            
            {(activeStep === "validate" || activeStep === "summary" || activeStep === "execute") && validationResult && (
              <ValidationResults
                validationResult={validationResult}
                onGenerateSummary={handleGenerateSummary}
                isGeneratingSummary={summaryMutation.isPending}
              />
            )}
            
            {(activeStep === "summary" || activeStep === "execute") && summary && (
              <QuerySummary
                summary={summary}
                onApprove={handleExecute}
                onModify={handleEdit}
                isExecuting={executeMutation.isPending}
              />
            )}
            
            {activeStep === "execute" && results.length > 0 && (
              <QueryResults results={results} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
