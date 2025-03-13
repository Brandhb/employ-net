// components/ActivityVerificationDialog.tsx

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";

interface ActivityVerificationDialogProps {
  open: boolean;
  onClose: () => void;
  verificationUrl: string | undefined;
  onRequestVerification: () => void;
  isLoading: boolean;
}

export const ActivityVerificationDialog = ({
  open,
  onClose,
  verificationUrl,
  onRequestVerification,
  isLoading,
}: ActivityVerificationDialogProps) => {
  
  // Handle opening verification URL in new tab
  const handleOpenVerificationUrl = (e: React.MouseEvent) => {
    debugger;
    e.stopPropagation();
    if (verificationUrl) {
      // Ensure URL has proper protocol
      let url = verificationUrl;
      if (!/^https?:\/\//.test(url)) {
        url = "https://" + url;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verification Required</DialogTitle>
          <DialogDescription>
            This action requires you to verify your identity.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          {verificationUrl && (
            <Button
              variant="outline"
              onClick={handleOpenVerificationUrl}
              className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Continue Task
            </Button>
          )}
          <Button
            onClick={onRequestVerification}
            className="w-full bg-green-500 hover:bg-green-600"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Request Verification"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
