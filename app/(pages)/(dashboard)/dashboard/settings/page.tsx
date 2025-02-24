// app/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Bell, CreditCard, Shield, User } from "lucide-react";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { ChangePasswordForm } from "@/components/dashboard/change-password-form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BankAccountDialog } from "@/components/bank-account-dialog";
import { getBankAccount } from "@/app/actions/bank-account";
import { BankAccountFormData } from "@/app/lib/zod-schemas/bank-account-schema";

export default function SettingsPage() {
  const { userId } = useAuth();
  const [bankAccount, setBankAccount] = useState<BankAccountFormData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const fetchBankAccount = async () => {
    if (!userId) return;
    try {
      const result = await getBankAccount(userId);
      if (result.success && result.data) {
        setBankAccount(result.data);
      }
    } catch (error) {
      console.error("Error fetching bank account:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBankAccount();
  }, [userId]);

  return (
    <div className="flex-1 space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Settings</h2>

      <div className="grid gap-4">
        {/* Profile Settings */}
        <ProfileForm />

        {/* Notification Settings - disabled foe now
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notification Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                title: "Email Notifications",
                description: "Receive activity updates via email",
              },
              {
                title: "Push Notifications",
                description: "Get notified about new rewards",
              },
              {
                title: "Marketing Communications",
                description: "Receive updates about new features",
              },
            ].map((setting, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{setting.title}</Label>
                  <p className="text-sm text-muted-foreground">
                    {setting.description}
                  </p>
                </div>
                <Switch />
              </div>
            ))}
          </CardContent>
        </Card>
*/}
        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle>Payment Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Bank Account</Label>
              <div className="flex items-center space-x-4 border p-4 rounded-lg">
                <div className="flex-1">
                  {isLoading ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-4 bg-muted rounded w-1/3" />
                    </div>
                  ) : bankAccount ? (
                    <>
                      <p className="font-medium">{bankAccount.bankName}</p>
                      <p className="text-sm text-muted-foreground">
                        Account ending in ****
                        {bankAccount.accountNumber.slice(-4)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No bank account connected
                    </p>
                  )}
                </div>
                <BankAccountDialog
                  existingAccount={bankAccount}
                  onSuccess={fetchBankAccount}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <ChangePasswordForm />
      </div>
    </div>
  );
}
