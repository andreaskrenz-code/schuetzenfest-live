"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { companies } from "@/lib/companies";

type LiveState = {
  id: number;
  competition: "prince" | "king";
  company_key: string | null;
  participant_name: string | null;
  message_type: "normal" | "insignia";
  insignia: "krone" | "zepter" | "apfel" | "vogel" | null;
  updated_at: string;
};

const insigniaLabels = {
  krone: "👑 KRONE GEFALLEN",
  zepter: "⚜️ ZEPTER GEFALLEN",
  apfel: "🍎 APFEL GEFALLEN",
  vogel: "🦅 DER VOGEL IST GEFALLEN",
};

export default function DisplayPage() {
  const [liveState, setLiveState] = useState<LiveState | null>(null);

  useEffect(() => {
    loadLiveState();

    const channel = supabase
      .channel("sf_live_state_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sf_live_state",
          filter: "id=eq.1",
        },
        (payload) => {
          setLiveState(payload.new as LiveState);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadLiveState() {
    const { data, error } = await supabase
      .from("sf_live_state")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setLiveState(data);
  }

  const company = companies.find((c) => c.id === liveState?.company_key);

  const isPrince = liveState?.competition === "prince";
  const title = isPrince ? "PRINZENSCHIESSEN" : "KÖNIGSSCHIESSEN";
  const day = isPrince ? "SONNTAG" : "MONTAG";

  const showInsignia =
    liveState?.message_type === "insignia" && liveState.insignia;

  return (
    <main className="min-h-screen bg-green-950 text-white flex flex-col relative">
      <div className="absolute top-4 left-4">
        <Link href="/" className="text-sm opacity-60">
          Start
        </Link>
      </div>

      <section className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="text-4xl font-bold tracking-wide mb-2">{title}</div>
        <div className="text-xl text-green-200 mb-10">{day}</div>

        {showInsignia ? (
          <div className="bg-white text-green-950 rounded-3xl px-10 py-10 shadow-2xl w-full max-w-5xl">
            <div className="text-7xl font-black mb-8">
                {liveState.insignia ? insigniaLabels[liveState.insignia] : ""}
            </div>

            {company && (
              <div className="flex flex-col items-center gap-5">
                <Image
                  src={company.logo}
                  alt={company.name}
                  width={160}
                  height={160}
                  className="object-contain"
                />
                <div className="text-4xl font-bold">{company.name}</div>
              </div>
            )}

            <div className="mt-8 text-5xl font-black uppercase">
              {liveState.participant_name || "Schütze nicht bekannt"}
            </div>
          </div>
        ) : (
          <>
            {company ? (
              <>
                <div className="bg-white rounded-3xl p-6 mb-8 shadow-2xl">
                  <Image
                    src={company.logo}
                    alt={company.name}
                    width={220}
                    height={220}
                    className="object-contain"
                  />
                </div>

                <div className="text-4xl font-bold mb-8">{company.name}</div>
              </>
            ) : (
              <div className="text-4xl font-bold mb-8 text-green-200">
                Bitte Kompanie auswählen
              </div>
            )}

            <div className="bg-white text-green-950 rounded-3xl px-10 py-8 shadow-2xl w-full max-w-4xl">
              <div className="text-2xl mb-4">Aktuell am Schießstand</div>
              <div className="text-6xl font-black uppercase">
                {liveState?.participant_name || "Schütze wird ermittelt"}
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}