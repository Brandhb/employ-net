import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, ArrowUpRight } from "lucide-react";
import { getPayoutStats, getPayoutHistory } from "@/app/actions/payouts";
import { RequestPayoutButton } from "@/components/dashboard/request-payout-button";
import { Key } from "react";
import { Payout } from "@/types";

export default async function PayoutsPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const stats = await getPayoutStats(userId);
  const payoutHistory = await getPayoutHistory(userId);

  return (
    <div className="flex-1 space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Payouts</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.availableBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Minimum payout: $10.00
            </p>
            <RequestPayoutButton 
              availableBalance={stats.availableBalance}
              className="mt-4 w-full"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarned.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payoutHistory.map((payout: Payout) => (
                <TableRow key={payout.id}>
                  <TableCell>
                    {new Date(payout.createdAt || "").toLocaleDateString()}
                  </TableCell>
                  <TableCell>${payout.amount.toFixed(2)}</TableCell>
                  <TableCell>PayPal</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      payout.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      
                      {payout.status ? 
                      payout.status?.charAt(0).toUpperCase() + payout.status.slice(1) : <></>}
                    </span>
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