import { z } from "zod";

// Validation schema with more specific rules
export const bankAccountSchema = z.object({
  bankName: z.string()
    .min(2, "Bank name must be at least 2 characters")
    .max(100, "Bank name must be less than 100 characters")
    .trim(),
  accountNumber: z.string()
    .min(4, "Account number must be at least 4 characters")
    .max(30, "Account number must be less than 30 characters")
    .regex(/^\d+$/, "Account number must contain only digits"),
  routingNumber: z.string()
    .length(9, "Routing number must be exactly 9 digits")
    .regex(/^\d+$/, "Routing number must contain only digits"),
  accountType: z.enum(["checking", "savings"]),  // ✅ Removed manual errorMap
  accountHolderName: z.string()
    .min(2, "Account holder name must be at least 2 characters")
    .max(100, "Account holder name must be less than 100 characters")
    .trim()
    .regex(/^[a-zA-Z\s'-]+$/, "Account holder name can only contain letters, spaces, hyphens, and apostrophes"),
});

export type BankAccountFormData = z.infer<typeof bankAccountSchema>;

// Helper function to map database bank account to form data
export function mapBankAccountToFormData(bankAccount: any): BankAccountFormData {
  return {
    bankName: bankAccount.bankName,
    accountNumber: bankAccount.accountNumber,
    routingNumber: bankAccount.routingNumber,
    accountType: bankAccount.accountType as "checking" | "savings",
    accountHolderName: bankAccount.accountHolderName,
  };
}