"use client";

import { SlotsManagement } from "@/components/manager/slots-management";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

export default function HorariosPage() {
  return (
    <Card className="border border-red-500/20 bg-gradient-to-br from-black via-slate-950 to-black p-4 sm:p-6 lg:p-8 shadow-2xl">
      <SlotsManagement />
    </Card>
  );
}

