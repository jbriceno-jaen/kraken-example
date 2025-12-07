"use client";

import { SlotsManagement } from "@/components/manager/slots-management";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

export default function HorariosPage() {
  return (
    <Card className="bg-black p-4 sm:p-6 lg:p-8 xl:p-10 shadow-2xl">
      <SlotsManagement />
    </Card>
  );
}

