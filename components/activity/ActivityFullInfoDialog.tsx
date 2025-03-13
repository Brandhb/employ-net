// components/ActivityFullInfoDialog.tsx

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

interface ActivityFullInfoDialogProps {
  open: boolean;
  onClose: () => void;
  activityTitle: string;
  activityDescription: string;
  instructions: string[];
}

export const ActivityFullInfoDialog = ({
  open,
  onClose,
  activityTitle,
  activityDescription,
  instructions,
}: ActivityFullInfoDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{activityTitle}</DialogTitle>
          <DialogDescription>{activityDescription}</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          {instructions.length > 0 ? (
            instructions.map((instruction, index) => (
              <p key={index}>
                <strong>Step {index + 1}:</strong> {instruction}
              </p>
            ))
          ) : (
            <p>No instructions available.</p>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
