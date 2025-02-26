import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface VerificationDialogsProps {
  selectedTask: any;
  confirmTask: any;
  onStartVerification: () => void;
  onConfirmVerification: () => void;
  setSelectedTask: (task: any | null) => void;
  setConfirmTask: (task: any | null) => void;
}

export function VerificationDialogs({
  selectedTask,
  confirmTask,
  onStartVerification,
  onConfirmVerification,
  setSelectedTask,
  setConfirmTask,
}: VerificationDialogsProps) {
  return (
    <>
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Important Notice</DialogTitle></DialogHeader>
          <p>You have only 60 minutes to complete this task. Ensure you&apos;re available before proceeding.</p>
          <Button onClick={onStartVerification}>Approve & Continue</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmTask} onOpenChange={() => setConfirmTask(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ready to Start?</DialogTitle></DialogHeader>
          <p>Your verification task is ready. Click confirm to begin.</p>
          <Button onClick={onConfirmVerification}>Confirm & Start</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
