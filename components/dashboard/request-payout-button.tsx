"use client";

import { useState, useEffect } from "react";
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
import { getBankAccount } from "@/app/actions/bank-account";
import { BankAccountForm } from "@/components/bank-account-form";
import { getMinAmountOfPayout } from "@/app/actions/payouts";
import { Skeleton } from "../ui/skeleton";

interface RequestPayoutButtonProps {
  availableBalance: number;
  className?: string;
}

export function RequestPayoutButton({
  availableBalance,
  className,
}: RequestPayoutButtonProps) {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [minAmountOfPayout, setMinAmountOfPayout] = useState<number>(0);
  const [minAmountLoading, setMinAmountLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bankAccount, setBankAccount] = useState<any | null>(null);
  const [showBankForm, setShowBankForm] = useState(false);

  // ✅ Fetch min payout once on mount
  useEffect(() => {
    const fetchMin = async () => {
      const min = await getMinAmountOfPayout();
      setMinAmountOfPayout(min);
      setMinAmountLoading(false);
    };
    fetchMin();
  }, []);

  // ✅ Fetch bank account when dialog opens
  useEffect(() => {
    if (userId && isOpen) {
      fetchBankAccount();
    }
  }, [userId, isOpen]);

  const fetchBankAccount = async () => {
    if (!userId) return;
    const account = await getBankAccount(userId);
    if (account?.success && account.data) {
      setBankAccount(account.data);
      setShowBankForm(false);
    } else {
      setBankAccount(null);
      setShowBankForm(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (!bankAccount) {
      toast({
        title: "Bank Account Missing",
        description: "Please add a bank account before requesting a payout.",
        variant: "destructive",
      });
      setShowBankForm(true);
      return;
    }

    const payoutAmount = parseFloat(amount);
    if (
      isNaN(payoutAmount) ||
      payoutAmount < minAmountOfPayout ||
      payoutAmount > availableBalance
    ) {
      toast({
        title: "Invalid Amount",
        description: `Enter a valid amount between $${minAmountOfPayout} and your available balance.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await requestPayout(userId, payoutAmount);
      toast({
        title: "Payout Requested",
        description: "Your payout request has been submitted successfully.",
      });
      setIsOpen(false);
    } catch (error: unknown) {
      let errorMessage = "Failed to request payout";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {minAmountLoading ? (
          <Skeleton className={`h-10 w-full ${className}`} />
        ) : (
          <Button
            className={className}
            disabled={availableBalance < minAmountOfPayout}
            onClick={() => setIsOpen(true)}
          >
            Request Payout
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Payout</DialogTitle>
          <DialogDescription>
            {showBankForm
              ? "Please add your bank account details before requesting a payout."
              : `Enter the amount you want to withdraw. Minimum $${minAmountOfPayout.toFixed(
                  2
                )}.`}
          </DialogDescription>
        </DialogHeader>

        {showBankForm ? (
          <BankAccountForm
            existingAccount={bankAccount}
            onSuccess={() => {
              setShowBankForm(false);
              fetchBankAccount();
            }}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                max={availableBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Min $${minAmountOfPayout.toFixed(2)}`}
              />
              <p className="text-sm text-muted-foreground">
                Available balance: ${availableBalance.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Bank Account</Label>
              <div className="rounded-lg border p-3 space-y-1">
                <p className="font-medium">{bankAccount?.bankName}</p>
                <p className="text-sm text-muted-foreground">
                  Account ending in ****{bankAccount?.accountNumber?.slice(-4)}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowBankForm(true)}
              >
                Change Bank Account
              </Button>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Processing..." : "Submit Request"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
