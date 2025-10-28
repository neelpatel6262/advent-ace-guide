import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Alert variant="destructive" className="border-2 shadow-lg">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="text-lg font-semibold">Generation Failed</AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p>{message}</p>
          {onRetry && (
            <Button 
              onClick={onRetry} 
              variant="outline" 
              className="mt-3 border-destructive/50 hover:bg-destructive/10"
            >
              Try Again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};