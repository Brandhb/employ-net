"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Gift, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { redeemReward } from "@/app/actions/rewards";
import { getDbUser } from "@/app/actions/user-actions";
import { redirect } from "next/navigation";

interface Reward {
  title: string;
  points: number;
  description: string;
}

const rewards: Reward[] = [
  /*{
    title: "Amazon Gift Card",
    points: 15000,
    description: "Get a $5 Amazon Gift Card",
  },
  {
    title: "PayPal Cash",
    points: 15000,
    description: "Get $10 PayPal Cash",
  },
  {
    title: "Premium Membership",
    points: 2000,
    description: "1 Month Premium Membership",
  },*/
];

export default function RewardsPage() {
  const { userId } = useAuth();

  if (!userId) {
    redirect("/sign-in");
  }
  const { toast } = useToast();
  const [selectedReward, setSelectedReward] = useState(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleRedeem = async (reward: Reward) => {
    const user = await getDbUser(userId);
    if (!user?.email) return;

    setIsRedeeming(true);
    try {
      const result = await redeemReward(
        user.email,
        reward.points,
        reward.title
      );

      if (result.success) {
        setIsModalOpen(false);
        toast({
          title: "Success",
          description: "Reward redeemed successfully!",
        });
        setSelectedReward(null);
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to redeem reward",
        variant: "destructive",
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="flex-1 space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Rewards</h2>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Points
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,250</div>
            <p className="text-xs text-muted-foreground">
              Points ready to redeem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lifetime Points
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5,430</div>
            <p className="text-xs text-muted-foreground">Total points earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rewards Claimed
            </CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Successfully redeemed rewards
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rewards.map((reward, index) => (
          <div key={index}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{reward.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {reward.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Trophy className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-bold">{reward.points} points</span>
                  </div>
                  <Button onClick={(e) => setIsModalOpen(true)}>Redeem</Button>
                </div>
              </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Redemption</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to redeem {reward.title} for{" "}
                    {reward.points} points?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedReward(null);
                      setIsModalOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleRedeem(reward)}
                    disabled={isRedeeming}
                  >
                    {isRedeeming ? "Redeeming..." : "Confirm"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ))}
      </div>
    </div>
  );
}
