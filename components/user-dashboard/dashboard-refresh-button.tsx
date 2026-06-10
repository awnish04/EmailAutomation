"use client";

import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

export function DashboardRefreshButton() {
  const router = useRouter();
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = () => {
    setSpinning(true);
    router.refresh();
    setTimeout(() => setSpinning(false), 1000);
  };

  return (
    <button
      onClick={handleRefresh}
      className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
    >
      <RefreshCw className={`size-3.5 transition-transform ${spinning ? "animate-spin" : ""}`} />
      Refresh
    </button>
  );
}
