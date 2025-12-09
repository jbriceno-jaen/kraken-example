"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Calendar, Clock, Dumbbell } from "lucide-react";
import { parseDateLocal } from "@/lib/utils";

interface WOD {
  id: number;
  date: string;
  title: string;
  description: string;
}

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function SchedulePage() {
  const { showToast } = useToast();
  const [wods, setWods] = useState<WOD[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWODs = async () => {
    try {
      setLoading(true);
      
      // Fetch WODs for the next 7 days
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const wodsPromises = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        wodsPromises.push(
          fetch(`/api/manager/wod?date=${dateStr}`)
            .then(res => res.ok ? res.json() : null)
            .catch(() => null)
        );
      }
      
      const wodsResults = await Promise.all(wodsPromises);
      const fetchedWods = wodsResults
        .filter(result => result && result.wod)
        .map(result => result.wod);
      setWods(fetchedWods);
    } catch (error) {
      console.error("Error fetching WODs:", error);
      showToast("Error loading schedule", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWODs();
  }, []);

  // Get today's WOD
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayWOD = wods.find((wod) => {
    const wodDate = parseDateLocal(wod.date);
    wodDate.setHours(0, 0, 0, 0);
    return wodDate.getTime() === today.getTime();
  });

  // Get upcoming WODs (excluding today)
  const upcomingWODs = wods
    .filter((wod) => {
      const wodDate = parseDateLocal(wod.date);
      wodDate.setHours(0, 0, 0, 0);
      return wodDate.getTime() > today.getTime();
    })
    .sort((a, b) => {
      const dateA = parseDateLocal(a.date).getTime();
      const dateB = parseDateLocal(b.date).getTime();
      return dateA - dateB;
    });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative size-16">
          <div className="size-full animate-spin rounded-full border-4 border-red-500/20 border-t-red-500" />
          <Calendar className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-red-400 animate-pulse" />
        </div>
        <p className="mt-4 text-sm font-semibold text-zinc-400 font-[family-name:var(--font-orbitron)]">
          Loading schedule...
        </p>
      </div>
    );
  }

  return (
    <Card className="bg-black p-4 sm:p-6 lg:p-8 shadow-2xl border border-red-500/50">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-orbitron)] text-white mb-2">
          Programming
        </h1>
        <p className="text-sm text-zinc-400">View Workout of the Day (WOD) schedule</p>
      </div>

      {todayWOD ? (
        <Card className="border border-red-500/50 bg-black/30 p-5 sm:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Dumbbell className="size-5 text-red-400" />
            <h2 className="text-xl font-bold font-[family-name:var(--font-orbitron)] text-white">
              Today's WOD
            </h2>
            <Badge className="bg-green-500/20 border border-green-500/30 text-green-400 font-[family-name:var(--font-orbitron)] text-xs">
              Today
            </Badge>
          </div>
          <div className="mb-4">
            <p className="text-sm text-zinc-400">
              {(() => {
                const wodDate = parseDateLocal(todayWOD.date);
                const dayName = dayNames[wodDate.getDay()];
                return `${dayName}, ${wodDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}`;
              })()}
            </p>
          </div>
          <h3 className="text-lg font-semibold text-red-400 mb-3 font-[family-name:var(--font-orbitron)]">
            {todayWOD.title}
          </h3>
          <p className="text-zinc-300 whitespace-pre-line">{todayWOD.description}</p>
        </Card>
      ) : (
        <Card className="border border-red-500/30 bg-black/30 p-8 text-center mb-6">
          <Dumbbell className="size-12 mx-auto mb-4 text-zinc-500" />
          <p className="text-zinc-400 text-lg mb-2">No WOD for today</p>
          <p className="text-zinc-500 text-sm">
            Check back later or view upcoming WODs below
          </p>
        </Card>
      )}

      {upcomingWODs.length > 0 && (
        <div>
          <h2 className="text-xl font-bold font-[family-name:var(--font-orbitron)] text-white mb-4">
            Upcoming WODs
          </h2>
          <div className="space-y-4">
            {upcomingWODs.map((wod) => {
              const wodDate = parseDateLocal(wod.date);
              const dayName = dayNames[wodDate.getDay()];
              const isTomorrow = wodDate.getTime() === today.getTime() + 86400000;

              return (
                <Card
                  key={wod.id}
                  className="border border-red-500/50 bg-black/30 p-5 sm:p-6"
                >
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <Dumbbell className="size-5 text-red-400" />
                    <h3 className="text-lg font-semibold text-red-400 font-[family-name:var(--font-orbitron)]">
                      {wod.title}
                    </h3>
                    {isTomorrow && (
                      <Badge className="bg-blue-500/20 border border-blue-500/30 text-blue-400 font-[family-name:var(--font-orbitron)] text-xs">
                        Tomorrow
                      </Badge>
                    )}
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Calendar className="size-4" />
                      <span>
                        {dayName}, {wodDate.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <p className="text-zinc-300 whitespace-pre-line">{wod.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {!todayWOD && upcomingWODs.length === 0 && (
        <Card className="border border-red-500/30 bg-black/30 p-12 text-center">
          <Calendar className="size-12 mx-auto mb-4 text-zinc-500" />
          <p className="text-zinc-400 text-lg mb-2">No WODs scheduled</p>
          <p className="text-zinc-500 text-sm">
            Check back later for upcoming workouts
          </p>
        </Card>
      )}
    </Card>
  );
}
