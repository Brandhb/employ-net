import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, AlertCircle } from "lucide-react";

export default function VerificationPage() {
  return (
    <div className="flex-1 space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Verification</h2>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Account Verification Status</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Complete verification to unlock all features
            </p>
          </div>
          <ShieldCheck className="h-6 w-6 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Verification Progress</span>
                <span>2/3 Steps Complete</span>
              </div>
              <Progress value={66} className="h-2" />
            </div>

            <div className="space-y-4">
              {[
                {
                  step: "Email Verification",
                  status: "Completed",
                  icon: ShieldCheck,
                  buttonText: "Verified",
                  completed: true,
                },
                {
                  step: "Identity Verification",
                  status: "Completed",
                  icon: ShieldCheck,
                  buttonText: "Verified",
                  completed: true,
                },
                {
                  step: "Document Verification",
                  status: "Pending",
                  icon: AlertCircle,
                  buttonText: "Start Verification",
                  completed: false,
                },
              ].map((step, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <step.icon
                      className={`h-5 w-5 ${
                        step.completed
                          ? "text-green-500"
                          : "text-muted-foreground"
                      }`}
                    />
                    <div>
                      <p className="font-medium">{step.step}</p>
                      <p className="text-sm text-muted-foreground">
                        {step.status}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={step.completed ? "secondary" : "default"}
                    disabled={step.completed}
                  >
                    {step.buttonText}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}