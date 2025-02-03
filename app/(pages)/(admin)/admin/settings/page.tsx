"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Mail } from "lucide-react";
import { getAdminSettings, updateAdminSettings } from "@/app/actions/admin";
import { useToast } from "@/hooks/use-toast";

interface NotificationPreferences {
  dailySummary: boolean;
  urgentAlerts: boolean;
}

interface AdminNotificationPreferences {
  payoutNotifications: boolean;
  verificationNotifications: boolean;
  systemAlerts: boolean;
}

interface Settings {
  id: string;
  email: string;
  notificationPreferences: NotificationPreferences;
  adminNotificationPreferences: AdminNotificationPreferences;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getAdminSettings();
        if (data) {
          const formattedSettings: Settings = {
            id: data.id || "",
            email: data.email || "",
            notificationPreferences: data.notificationPreferences || {
              dailySummary: true,
              urgentAlerts: true
            },
            adminNotificationPreferences: data.adminNotificationPreferences || {
              payoutNotifications: true,
              verificationNotifications: true,
              systemAlerts: true
            }
          };
          setSettings(formattedSettings);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  const handleUpdateNotificationPreference = (
    key: keyof NotificationPreferences,
    checked: boolean
  ) => {
    if (!settings) return;

    setSettings({
      ...settings,
      notificationPreferences: {
        ...settings.notificationPreferences,
        [key]: checked
      }
    });
  };

  const handleUpdateAdminNotificationPreference = (
    key: keyof AdminNotificationPreferences,
    checked: boolean
  ) => {
    if (!settings) return;

    setSettings({
      ...settings,
      adminNotificationPreferences: {
        ...settings.adminNotificationPreferences,
        [key]: checked
      }
    });
  };

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      await updateAdminSettings({
        notificationPreferences: settings.notificationPreferences,
        adminNotificationPreferences: settings.adminNotificationPreferences
      });
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="h-64 w-full bg-muted rounded" />
    </div>;
  }

  if (!settings) return null;

  return (
    <div className="flex-1 space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Admin Settings</h2>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                title: "Payout Requests",
                description: "Get notified when users request payouts",
                key: "payoutNotifications" as keyof AdminNotificationPreferences
              },
              {
                title: "Verification Requests",
                description: "Get notified when users request verification",
                key: "verificationNotifications" as keyof AdminNotificationPreferences
              },
              {
                title: "System Alerts",
                description: "Get notified about system issues and updates",
                key: "systemAlerts" as keyof AdminNotificationPreferences
              }
            ].map((pref) => (
              <div key={pref.key} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{pref.title}</Label>
                  <p className="text-sm text-muted-foreground">
                    {pref.description}
                  </p>
                </div>
                <Switch
                  checked={settings.adminNotificationPreferences[pref.key]}
                  onCheckedChange={(checked) => {
                    handleUpdateAdminNotificationPreference(pref.key, checked);
                  }}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <CardTitle>Email Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                title: "Daily Summary",
                description: "Receive daily summary of platform activities",
                key: "dailySummary" as keyof NotificationPreferences
              },
              {
                title: "Urgent Alerts",
                description: "Receive immediate alerts for urgent issues",
                key: "urgentAlerts" as keyof NotificationPreferences
              }
            ].map((pref) => (
              <div key={pref.key} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{pref.title}</Label>
                  <p className="text-sm text-muted-foreground">
                    {pref.description}
                  </p>
                </div>
                <Switch
                  checked={settings.notificationPreferences[pref.key]}
                  onCheckedChange={(checked) => {
                    handleUpdateNotificationPreference(pref.key, checked);
                  }}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}