"use client";

import { useState } from "react";
import { SlotsManagement } from "@/components/manager/slots-management";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default function SchedulesPage() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative w-full overflow-x-hidden">
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
          <div className="relative size-16">
            <div className="size-full animate-spin rounded-full border-4 border-red-500/20 border-t-red-500" />
            <Clock className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-red-400 animate-pulse" />
          </div>
          <p className="mt-4 text-sm font-semibold text-zinc-400 font-[family-name:var(--font-orbitron)]">
            Loading schedules...
          </p>
        </div>
      )}
      <Card className="bg-black p-4 sm:p-6 lg:p-8 shadow-2xl border border-red-500/50 w-full max-w-[1069px] mx-auto overflow-x-hidden">
        <SlotsManagement onLoadingChange={setLoading} />
      </Card>
    </div>
  );
}
