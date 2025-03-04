import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Activity } from "@/types";
import { listenForTableChanges } from "@/app/actions/supabase/supabase-realtime";

interface Props {
  setActiveActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  setCompletedActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
}

export function ActivityRealtime({ setActiveActivities, setCompletedActivities }: Props) {
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    async function subscribe() {
      unsubscribe = await listenForTableChanges("activities", "userId", "currentUserId", (payload: { event: string; new: any; old: { id: any; }; }) => {
        console.log("🔄 Activity update:", payload);
        toast({ title: "Activity Updated", description: `An activity was ${payload.event}` });

        const updatedActivity = payload.new as Activity;
        if (payload.event === "INSERT") {
          setActiveActivities((prev) => [...prev, updatedActivity]);
        } else if (payload.event === "UPDATE") {
          setActiveActivities((prev) => prev.map(activity => activity.id === updatedActivity.id ? updatedActivity : activity));
        } else if (payload.event === "DELETE") {
          setActiveActivities((prev) => prev.filter(activity => activity.id !== payload.old.id));
        }
      });
    }

    subscribe();
    return () => unsubscribe?.();
  }, []);

  return null;
}
