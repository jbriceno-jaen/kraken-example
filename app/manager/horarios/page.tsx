"use client";

import { SlotsManagement } from "@/components/manager/slots-management";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

export default function HorariosPage() {
  return (
    <Card className="border border-red-500/20 bg-gradient-to-br from-black via-slate-950 to-black p-4 sm:p-6 lg:p-8 shadow-2xl">
      <div className="mb-6">
        <Badge variant="secondary" className="bg-red-500/20 border border-red-500/30 text-white backdrop-blur-sm font-[family-name:var(--font-orbitron)] shadow-lg shadow-red-500/20">
          Horarios
        </Badge>
        <h2 className="mt-4 text-2xl sm:text-3xl font-bold font-[family-name:var(--font-orbitron)] text-white">
          Configuración de Horarios
        </h2>
        <p className="text-sm text-zinc-300 mt-2">
          Configura horarios por día de la semana.
        </p>
      </div>
      <SlotsManagement />
    </Card>
  );
}

