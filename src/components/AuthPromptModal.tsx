import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";

interface AuthPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuthPromptModal = ({ open, onOpenChange }: AuthPromptModalProps) => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    onOpenChange(false);
    navigate("/auth");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogIn className="w-5 h-5" />
            Login Required
          </DialogTitle>
          <DialogDescription>
            Please sign in to save your itinerary and access it anytime.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button onClick={handleLoginClick} className="w-full">
            Sign In / Sign Up
          </Button>
          <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
