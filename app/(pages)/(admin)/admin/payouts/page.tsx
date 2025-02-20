"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPayoutRequests } from "@/app/actions/admin";
import { ProcessPayoutButton } from "@/components/admin/process-payout-button";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Shield, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  bsb: string;
}

interface User {
  email: string;
  fullName: string;
  bankAccounts: BankAccount[];
}

interface Payout {
  id: string;
  amount: number;
  createdAt: string | null;
  status: string;
  notes: string | null;
  user: User;
}

export default function PayoutRequestsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [visibleAccount, setVisibleAccount] = useState<{
    [key: string]: { visible: boolean; timestamp: number };
  }>({});

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const data = await getPayoutRequests();
        const formattedData = data.map((payout: any) => ({
          id: payout.id,
          amount: payout.amount,
          createdAt: payout.createdAt || new Date().toISOString(),
          status: payout.status || "pending",
          notes: payout.notes || null,
          user: {
            email: payout.user?.email || "No email",
            fullName: payout.user?.fullName || "Anonymous",
            bankAccounts: payout.user?.bankAccounts || [],
          },
        }));
        setPayouts(formattedData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load payout requests",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayouts();
  }, [toast]);

  const getBankAccount = (bankAccounts: BankAccount[], payoutId: string) => {
    if (bankAccounts.length === 0) {
      return (
        <div className="text-muted-foreground italic">
          No bank account details available.
        </div>
      );
    }

    const bankAccount = bankAccounts[0];
    const isVisible = visibleAccount[payoutId]?.visible || false;

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={isVisible ? "visible" : "hidden"}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-medium">{bankAccount.bankName}</span>
          </div>
          
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Number:</span>
              <span className="font-mono">
                {isVisible
                  ? bankAccount.accountNumber
                  : "••••" + bankAccount.accountNumber.slice(-4)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">BSB:</span>
              <span className="font-mono">
                {isVisible ? bankAccount.bsb : "••••••"}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Name:</span>
              <span>{bankAccount.accountHolderName}</span>
            </div>
          </div>

          {isVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-muted-foreground mt-2"
            >
              <div className="flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3" />
                <span>Details will be hidden automatically in 30 seconds</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  const handleToggleVisibility = (payoutId: string) => {
    setVisibleAccount((prev) => {
      const newState = {
        ...prev,
        [payoutId]: {
          visible: !prev[payoutId]?.visible,
          timestamp: Date.now(),
        },
      };

      // Auto-hide after 30 seconds
      if (newState[payoutId].visible) {
        setTimeout(() => {
          setVisibleAccount((current) => ({
            ...current,
            [payoutId]: { visible: false, timestamp: Date.now() },
          }));
        }, 30000);
      }

      return newState;
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Payout Requests</h2>

        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Bank Account</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="animate-pulse space-y-2">
                        <div className="h-4 w-32 bg-muted rounded" />
                        <div className="h-3 w-24 bg-muted rounded" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-4 w-20 bg-muted rounded" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse space-y-2">
                        <div className="h-4 w-48 bg-muted rounded" />
                        <div className="h-4 w-36 bg-muted rounded" />
                        <div className="h-4 w-40 bg-muted rounded" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-4 w-28 bg-muted rounded" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-9 w-24 bg-muted rounded" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Payout Requests</h2>

      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No payout requests found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Bank Account</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {payout.user.fullName}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {payout.user.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>${payout.amount.toFixed(2)}</TableCell>
                    <TableCell className="space-y-2">
                      {getBankAccount(payout.user.bankAccounts, payout.id)}
                      <Button
                        onClick={() => handleToggleVisibility(payout.id)}
                        variant="outline"
                        size="sm"
                        className={`w-full transition-all duration-200 ${
                          visibleAccount[payout.id]?.visible
                            ? "bg-red-50 hover:bg-red-100 text-red-600"
                            : "bg-blue-50 hover:bg-blue-100 text-blue-600"
                        }`}
                      >
                        {visibleAccount[payout.id]?.visible ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Show Details
                          </>
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {payout.status}
                    </TableCell>
                    <TableCell>
                      {new Date(payout.createdAt!).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <ProcessPayoutButton payout={payout} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
