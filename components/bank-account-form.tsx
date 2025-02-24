"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addBankAccount, updateBankAccount } from "@/app/actions/bank-account";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { bankAccountSchema, BankAccountFormData } from "@/app/lib/zod-schemas/bank-account-schema";

interface BankAccountFormProps {
  existingAccount?: BankAccountFormData;
  onSuccess?: () => void;
}

export function BankAccountForm({ existingAccount, onSuccess }: BankAccountFormProps) {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: existingAccount || {
      bankName: "",
      accountNumber: "",
      bsb: "",
      accountType: "checking",
      accountHolderName: "",
    },
  });

  async function onSubmit(values: BankAccountFormData) {
    if (!userId) return;

    setIsLoading(true);
    try {
    //  debugger
      // ✅ Ensure proper field mapping for Australian bank format
      const bankData = {
        bankName: values.bankName,
        accountNumber: values.accountNumber,
        bsb: values.bsb, // ✅ Using BSB instead of Routing Number
        accountType: values.accountType as "checking" | "savings", // ✅ Ensures correct type
        accountHolderName: values.accountHolderName,
      };

      const result = existingAccount
        ? await updateBankAccount(userId, bankData)
        : await addBankAccount(userId, bankData);

      if (result.success) {
        form.reset(); // ✅ Reset form only on success
        toast({
          title: "Success",
          description: `Your bank account has been ${existingAccount ? "updated" : "added"} successfully!`,
        });
        onSuccess?.(); // ✅ Close modal only on success
      } else {
        console.error("Bank Account Error:", result.error);
      }
    } catch (error: unknown) {
      console.error("Bank Account Submission Failed:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Bank Name */}
        <FormField
          control={form.control}
          name="bankName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter bank name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* BSB (Australian Format) */}
        <FormField
          control={form.control}
          name="bsb"
          render={({ field }) => (
            <FormItem>
              <FormLabel>BSB</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="000-000"
                  maxLength={6}
                  onChange={(e) => {
                    // Remove any non-numeric characters
                    const value = e.target.value.replace(/\D/g, '');
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormDescription>Enter your 6-digit BSB number without hyphens.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Account Number */}
        <FormField
          control={form.control}
          name="accountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Number</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="text" 
                  placeholder="Enter account number"
                  maxLength={9}
                  onChange={(e) => {
                    // Remove any non-numeric characters
                    const value = e.target.value.replace(/\D/g, '');
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Account Holder Name */}
        <FormField
          control={form.control}
          name="accountHolderName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Holder Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter account name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Account Type */}
        <FormField
          control={form.control}
          name="accountType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="checking">Checking</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? "Saving..." : existingAccount ? "Update Bank Account" : "Add Bank Account"}
        </Button>
      </form>
    </Form>
  );
}
