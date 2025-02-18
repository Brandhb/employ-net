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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addBankAccount, updateBankAccount } from "@/app/actions/bank-account";
import { Loader2 } from "lucide-react";
import { useAsync } from "@/hooks/use-async";
import { AsyncBoundary } from "@/components/ui/async-boundary";
import { BankAccountFormData, bankAccountSchema } from "@/app/lib/zod-schemas/bank-account-schema";
import { toast } from "@/hooks/use-toast";

interface BankAccountFormProps {
  existingAccount?: BankAccountFormData;
  onSuccess?: () => void;
}

function BankAccountFormContent({ existingAccount, onSuccess }: BankAccountFormProps) {
  const { userId } = useAuth();
  const { execute, isLoading } = useAsync<BankAccountFormData>();

  const form = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: existingAccount || {
      bankName: "",
      accountNumber: "",
      routingNumber: "",
      accountType: "checking",
      accountHolderName: "",
    },
  });

  async function onSubmit(values: BankAccountFormData) {
    if (!userId) return;
    debugger;
    try {
      const result = existingAccount 
        ? await updateBankAccount(userId, values)
        : await addBankAccount(userId, values);
  
      if (result.success) {
        form.reset();  // ✅ Reset form only on success
        toast({
          title: "Success",
          description: "Your Bank account has been updated successfully!",
        });
        onSuccess?.(); // ✅ Close the modal only on success
      } else {
        console.error("Bank Account Error:", result.error);
      }
    } catch (error) {
      console.error("Bank Account Submission Failed:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="bankName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accountHolderName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Holder Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <FormField
          control={form.control}
          name="accountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Number</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  {...field} 
                  disabled={isLoading}
                  autoComplete="off"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="routingNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Routing Number</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  disabled={isLoading}
                  autoComplete="off"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading 
            ? "Saving..." 
            : existingAccount 
              ? "Update Bank Account" 
              : "Add Bank Account"
          }
        </Button>
      </form>
    </Form>
  );
}

export function BankAccountForm(props: BankAccountFormProps) {
  return (
    <AsyncBoundary
      fallback={
        <div className="space-y-4 animate-pulse">
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
        </div>
      }
    >
      <BankAccountFormContent {...props} />
    </AsyncBoundary>
  );
}