"use client";

import { useEffect, useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { addBankAccount, updateBankAccount } from "@/app/actions/bank-account";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { bankAccountSchema, BankAccountFormData } from "@/app/lib/zod-schemas/bank-account-schema";

interface Bank {
  id: string;
  name: string;
  country: string;
}

interface BankAccountFormProps {
  existingAccount?: BankAccountFormData;
  onSuccess?: () => void;
}

export function BankAccountForm({ existingAccount, onSuccess }: BankAccountFormProps) {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [bankList, setBankList] = useState<Bank[]>([]);
  const [isBanksLoading, setIsBanksLoading] = useState(true);
  
  const BANK_API_URL = "https://api.openbankproject.com/v2.0.0/banks"; // Example API

  const form = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: existingAccount || {
      accountNumber: "",
      bsb: "",
      accountType: "checking",
      accountHolderName: "",
    },
  });

  // ✅ Fetch banks from API
 {/* useEffect(() => {
    const fetchBanks = async () => {
      setIsBanksLoading(true);
      try {
        const response = await fetch("/api/banks");
        if (!response.ok) throw new Error(`API error: ${response.status}`);
  
        const data = await response.json();
        if (data?.banks && Array.isArray(data.banks)) {
          setBankList(data.banks);
        } else {
          throw new Error("Invalid bank data format.");
        }
      } catch (error) {
        console.error("❌ Bank API Fetch Error:", error);
        toast({ title: "Error", description: "Failed to load bank list.", variant: "destructive" });
      } finally {
        setIsBanksLoading(false);
      }
    };
  
    fetchBanks();
  }, []);
*/}
  

  async function onSubmit(values: BankAccountFormData) {
    //debugger;
    if (!userId) return;

    setIsLoading(true);
    try {
      const bankData = {
        accountNumber: values.accountNumber,
        bsb: values.bsb,
        accountType: values.accountType as "checking" | "savings",
        accountHolderName: values.accountHolderName,
      };

      const result = existingAccount
        ? await updateBankAccount(userId, bankData)
        : await addBankAccount(userId, bankData);

      if (result.success) {
        form.reset();
        toast({
          title: "Success",
          description: `Your bank account has been ${existingAccount ? "updated" : "added"} successfully!`,
        });
        onSuccess?.();
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
      <form onSubmit={form.handleSubmit(
    onSubmit,
    (errors) => {
      console.log("Form validation errors:", errors); // Check if there are any errors
    }
  )} className="space-y-4">
        {/* ✅ Bank Name Dropdown (Fix for empty value) 
        <FormField
          control={form.control}
          name="bankName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || undefined} // Prevents empty string error
                disabled={isBanksLoading || isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isBanksLoading ? "Loading banks..." : "Select a bank"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {bankList.length > 0 ? (
                    bankList.map((bank) => (
                      <SelectItem key={bank.id} value={bank.name}>
                        {bank.name} {bank.country !== "Australia" ? `(${bank.country})` : ""}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem key="no-banks" value="no-banks" disabled>
                      No banks available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
*/}
        {/* ✅ BSB Number (6 digits) */}
        <FormField
          control={form.control}
          name="bsb"
          render={({ field }) => (
            <FormItem>
              <FormLabel>BSB</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="000000"
                  maxLength={6}
                  onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                />
              </FormControl>
              <FormDescription>Enter your 6-digit BSB number.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ✅ Account Number (6-9 digits) */}
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
                  onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ✅ Account Holder Name */}
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

        {/* ✅ Account Type */}
        <FormField
          control={form.control}
          name="accountType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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

        {/* ✅ Submit Button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? "Saving..." : existingAccount ? "Update Bank Account" : "Add Bank Account"}
        </Button>
      </form>
    </Form>
  );
}
