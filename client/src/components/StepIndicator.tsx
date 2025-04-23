import { Check } from "lucide-react";

interface Step {
  id: string;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  activeStep: string;
}

const StepIndicator = ({ steps, activeStep }: StepIndicatorProps) => {
  const getStepStatus = (stepId: string) => {
    const activeIndex = steps.findIndex(step => step.id === activeStep);
    const currentIndex = steps.findIndex(step => step.id === stepId);
    
    if (currentIndex < activeIndex) {
      return "completed";
    } else if (currentIndex === activeIndex) {
      return "active";
    } else {
      return "upcoming";
    }
  };

  return (
    <div className="mb-8 px-4">
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div 
                className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  getStepStatus(step.id) === "completed"
                    ? "bg-[#34a853] text-white"
                    : getStepStatus(step.id) === "active"
                    ? "bg-[#1a73e8] text-white"
                    : "bg-[#dadce0] text-[#5f6368]"
                }`}
              >
                {getStepStatus(step.id) === "completed" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </div>
              <span 
                className={`text-sm font-medium mt-2 ${
                  getStepStatus(step.id) === "upcoming" 
                    ? "text-[#5f6368]" 
                    : "text-[#202124]"
                }`}
              >
                {step.label}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div 
                className={`h-0.5 w-full flex-grow mx-2 ${
                  getStepStatus(steps[index + 1].id) === "upcoming" 
                    ? "bg-[#dadce0]" 
                    : "bg-[#1a73e8]"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
