import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface VerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function VerificationConfirmationDialog({ isOpen, onClose, onConfirm }: VerificationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const totalSteps = 3;

  // ✅ Handle user confirmation
  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      toast({
        title: "Request Sent",
        description: "Admin will review and send you the verification link.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not send verification request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center">
            Verification Task Confirmation
          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <Progress value={(step / totalSteps) * 100} className="h-2 mb-4" />

        {/* Step-Based Form */}
        {step === 1 && (
          <div className="space-y-4 text-center">
            <p className="text-md font-medium">
              Are you available in the next <strong>12 hours</strong> to receive the verification link?
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={onClose}>No</Button>
              <Button onClick={() => setStep(2)}>Yes</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 text-center">
            <p className="text-md font-medium">
              The verification link will expire <strong>60 minutes</strong> after you receive it.
            </p>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)}>Next</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center">
            <p className="text-md font-medium">
              You must check your <strong>email</strong> to complete the process and earn your points.
            </p>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={handleConfirm} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Yes, I Understand"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
