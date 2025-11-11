import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itineraryId: string;
  destination: string;
}

export const ShareModal = ({ open, onOpenChange, itineraryId, destination }: ShareModalProps) => {
  const { toast } = useToast();
  const shareUrl = `${window.location.origin}/itinerary/${itineraryId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "🔗 Link copied!",
        description: "Share link copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Your Itinerary
          </DialogTitle>
          <DialogDescription>
            Share your {destination} adventure with friends and family
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Input value={shareUrl} readOnly className="flex-1" />
          <Button size="icon" variant="outline" onClick={handleCopyLink}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
