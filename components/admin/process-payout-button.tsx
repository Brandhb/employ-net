"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { processPayoutRequest } from "@/app/actions/admin";

interface ProcessPayoutButtonProps {
  payout: {
    id: string;
    amount: number;
    user: {
      email: string;
      bankAccounts: Array<{
        bankName: string;
        accountNumber: string;
        accountHolderName: string;
      }>;
    };
  };
}

export function ProcessPayoutButton({ payout }: ProcessPayoutButtonProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to extract error messages
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    return "An unexpected error occurred";
  };

  const handleProcess = async (action: "process" | "complete" | "reject") => {
    setIsLoading(true);
    try {
      await processPayoutRequest(payout.id, action, notes);
      toast({
        title: "Success",
        description: `Payout ${
          action === "process"
            ? "marked as processing"
            : action === "complete"
            ? "completed"
            : "rejected"
        } successfully`,
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const bankAccount = payout.user.bankAccounts[0];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Process Payout</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Process Payout Request</DialogTitle>
          <DialogDescription>
            Amount: ${payout.amount.toFixed(2)}
            <br />
            {bankAccount ? (
              <>
                Bank: {bankAccount.bankName}
                <br />
                Account: ****{bankAccount.accountNumber.slice(-4)}
                <br />
                Name: {bankAccount.accountHolderName}
              </>
            ) : (
              <span>No bank account details available.</span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Add notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isLoading}
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="destructive"
              onClick={() => handleProcess("reject")}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Reject"}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleProcess("process")}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Mark as Processing"}
            </Button>
            <Button
              onClick={() => handleProcess("complete")}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Complete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
