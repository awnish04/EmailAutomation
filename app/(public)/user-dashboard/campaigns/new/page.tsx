import React from "react";
import QuickCampaignWizard from "@/components/campaigns/QuickCampaignWizard";

export const metadata = {
  title: "New Campaign - Quick Setup",
  description: "Quickly launch a new automated email outreach campaign.",
};

export default function NewCampaignPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <QuickCampaignWizard />
    </div>
  );
}
