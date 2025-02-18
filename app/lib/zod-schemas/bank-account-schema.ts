import { z } from "zod";

// Validation schema with Australian format (BSB + Account Number)
export const bankAccountSchema = z.object({
  bankName: z.string()
    .min(2, "Bank name must be at least 2 characters")
    .max(100, "Bank name must be less than 100 characters")
    .trim(),
  accountNumber: z.string()
    .min(6, "Account number must be at least 6 digits")
    .max(9, "Account number must be at most 9 digits")
    .regex(/^\d+$/, "Account number must contain only digits"),
  bsb: z.string()  // ✅ Changed from `routingNumber` to `bsb`
    .length(6, "BSB must be exactly 6 digits")
    .regex(/^\d+$/, "BSB must contain only numbers"),
  accountType: z.enum(["checking", "savings"]),  
  accountHolderName: z.string()
    .min(2, "Account holder name must be at least 2 characters")
    .max(100, "Account holder name must be less than 100 characters")
    .trim()
    .regex(/^[a-zA-Z\s'-]+$/, "Account holder name can only contain letters, spaces, hyphens, and apostrophes"),
});

export type BankAccountFormData = z.infer<typeof bankAccountSchema>;

// ✅ Helper function to map database format (backend) to form format (frontend)
export function mapBankAccountToFormData(bankAccount: any): BankAccountFormData {
  return {
    bankName: bankAccount.bankName,
    accountNumber: bankAccount.accountNumber,
    bsb: bankAccount.bsb || bankAccount.routingNumber, // ✅ Ensure backward compatibility
    accountType: bankAccount.accountType as "checking" | "savings",
    accountHolderName: bankAccount.accountHolderName,
  };
}
