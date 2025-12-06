"use client";

import { ClassesView } from "@/components/manager/classes-view";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

export default function ClasesPage() {
  return (
    <Card className="border border-red-500/20 bg-gradient-to-br from-black via-slate-950 to-black p-4 sm:p-6 lg:p-8 shadow-2xl">
      <ClassesView />
    </Card>
  );
}

