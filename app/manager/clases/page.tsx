"use client";

import { ClassesView } from "@/components/manager/classes-view";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

export default function ClasesPage() {
  return (
    <Card className="bg-black p-4 sm:p-6 lg:p-8 xl:p-10 shadow-2xl">
      <ClassesView />
    </Card>
  );
}

