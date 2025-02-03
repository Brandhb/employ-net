"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPayoutRequests } from "@/app/actions/admin";
import { ProcessPayoutButton } from "@/components/admin/process-payout-button";
import { useToast } from "@/hooks/use-toast";

interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  routingNumber: string;
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

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const data = await getPayoutRequests();

        // Ensure proper structure before setting state
        const formattedData = data.map((payout: any) => ({
          id: payout.id,
          amount: payout.amount,
          createdAt: payout.createdAt || new Date().toISOString(),
          status: payout.status || "pending",
          notes: payout.notes || null,
          user: {
            email: payout.user?.email || "No email",
            fullName: payout.user?.full_name || "Anonymous",
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

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Payout Requests</h2>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-24" />
            </Card>
          ))}
        </div>
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
            <p className="text-muted-foreground text-center py-4">No payout requests found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Bank Account</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{payout.user.fullName}</span>
                        <span className="text-sm text-muted-foreground">
                          {payout.user.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>${payout.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      {payout.user.bankAccounts.length > 0 ? (
                        <>
                          <p>{payout.user.bankAccounts[0].bankName}</p>
                          <p className="text-xs text-muted-foreground">
                            ****{payout.user.bankAccounts[0].accountNumber.slice(-4)}
                          </p>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">No bank details</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(payout.createdAt as string).toLocaleDateString()}
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
