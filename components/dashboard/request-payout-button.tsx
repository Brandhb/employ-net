"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { requestPayout } from "@/app/actions/payouts";

interface RequestPayoutButtonProps {
  availableBalance: number;
  className?: string;
}

export function RequestPayoutButton({ availableBalance, className }: RequestPayoutButtonProps) {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    debugger
    e.preventDefault();
    if (!userId) return;

    const payoutAmount = parseFloat(amount);
    if (isNaN(payoutAmount) || payoutAmount < 10 || payoutAmount > availableBalance) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount between $10 and your available balance.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await requestPayout(userId, payoutAmount);
      toast({
        title: "Payout requested",
        description: "Your payout request has been submitted successfully.",
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: JSON.stringify(error) || "Failed to request payout",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={className} disabled={availableBalance < 10}>
          Request Payout
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Payout</DialogTitle>
          <DialogDescription>
            Enter the amount you want to withdraw. Minimum $10.00
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="10"
              max={availableBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
            <p className="text-sm text-muted-foreground">
              Available balance: ${availableBalance.toFixed(2)}
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : "Submit Request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}