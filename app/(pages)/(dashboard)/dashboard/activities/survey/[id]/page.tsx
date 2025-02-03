import { getActivityById } from "@/app/actions/activities";
import { getDbUser } from "@/app/actions/user-actions";
import { SurveyEmbed } from "@/components/survey-embed";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface ActivityMetadata {
  formId?: string;
  [key: string]: any;
}

export default async function SurveyPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getDbUser(userId)



  if (!user) {
    redirect("/sign-in");
  }

  const activity = await getActivityById(params.id)


  if (!activity) {
    return <div>Survey not found</div>;
  }
  const metadata = activity.metadata as ActivityMetadata;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <SurveyEmbed
        formId={metadata?.formId || ""}
        title={activity.title}
        points={activity.points}
        activityId={activity.id}
      />
    </div>
  );
}