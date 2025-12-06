"use client";

import { ClassesView } from "@/components/manager/classes-view";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

export default function ClasesPage() {
  return (
    <Card className="border border-red-500/20 bg-gradient-to-br from-black via-slate-950 to-black p-4 sm:p-6 lg:p-8 shadow-2xl">
      <div className="mb-6">
        <Badge variant="secondary" className="bg-red-500/20 border border-red-500/30 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] shadow-lg shadow-red-500/20">
          Clases
        </Badge>
        <h2 className="mt-4 text-2xl sm:text-3xl font-bold font-[family-name:var(--font-orbitron)] text-white">
          Gestión de Clases
        </h2>
        <p className="text-sm text-zinc-300 mt-2">
          Gestiona horarios y asistentes.
        </p>
      </div>
      <ClassesView />
    </Card>
  );
}

