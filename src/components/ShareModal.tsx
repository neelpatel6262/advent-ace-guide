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

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Check out my ${destination} itinerary created with TripCraft AI! ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`${destination} Itinerary`);
    const body = encodeURIComponent(`Check out my ${destination} itinerary created with TripCraft AI!\n\n${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
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

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input value={shareUrl} readOnly className="flex-1" />
            <Button size="icon" variant="outline" onClick={handleCopyLink}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button onClick={handleWhatsAppShare} variant="outline" className="w-full">
              WhatsApp
            </Button>
            <Button onClick={handleEmailShare} variant="outline" className="w-full">
              Email
            </Button>
            <Button onClick={handleFacebookShare} variant="outline" className="w-full">
              Facebook
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
