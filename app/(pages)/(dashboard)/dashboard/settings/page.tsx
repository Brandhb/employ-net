"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Shield, CreditCard } from "lucide-react";
import { BankAccountDialog } from "@/components/bank-account-dialog";
import { getBankAccount } from "@/app/actions/bank-account";
import { BankAccountFormData } from "@/app/lib/zod-schemas/bank-account-schema";

export default function SettingsPage() {
  const { userId } = useAuth();
  const [bankAccount, setBankAccount] = useState<BankAccountFormData | null>(null);
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
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <CardTitle>Profile Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" />
              </div>
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

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
                        Account ending in ****{bankAccount.accountNumber.slice(-4)}
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

            {/* PayPal Integration (Commented out for future reference)
            <div className="space-y-2">
              <Label>PayPal</Label>
              <div className="flex items-center space-x-4 border p-4 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">PayPal</p>
                  <p className="text-sm text-muted-foreground">
                    Connected: john@example.com
                  </p>
                </div>
                <Button variant="outline">Change</Button>
              </div>
            </div>
            */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Security Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Button variant="outline">Enable 2FA</Button>
            </div>
            <Separator />
            <div className="space-y-4">
              <div>
                <Label>Change Password</Label>
                <p className="text-sm text-muted-foreground">
                  Update your password regularly
                </p>
              </div>
              <Button variant="outline">Update Password</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}