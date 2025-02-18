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
import { BankAccountForm } from "@/components/bank-account-form";
import { BankAccountFormData } from "@/app/lib/zod-schemas/bank-account-schema";

interface BankAccountDialogProps {
  existingAccount?: BankAccountFormData | null;
  onSuccess?: () => void;
}

export function BankAccountDialog({ existingAccount, onSuccess }: BankAccountDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {existingAccount ? "Change" : "Add"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {existingAccount ? "Update Bank Account" : "Add Bank Account"}
          </DialogTitle>
          <DialogDescription>
            {existingAccount
              ? "Update your bank account information below."
              : "Enter your bank account details to receive payments."}
          </DialogDescription>
        </DialogHeader>
        <BankAccountForm
          existingAccount={existingAccount || undefined}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}