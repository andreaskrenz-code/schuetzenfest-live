"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { companies } from "@/lib/companies";

type Participant = {
  id: string;
  name: string;
  company_key: string;
  competition: "prince" | "king";
  sort_order: number;
  ausgeschieden: boolean;
};

export default function ParticipantsPage() {
  const [competition, setCompetition] = useState<"prince" | "king">("prince");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadParticipants();
  }, [competition]);

  async function loadParticipants() {
    const { data, error } = await supabase
      .from("sf_participants")
      .select("*")
      .eq("competition", competition)
      .order("company_key", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) {
      console.error(error);
      setParticipants([]);
      return;
    }

    setParticipants(data ?? []);
  }

  const filteredParticipants = participants.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <main className="min-h-screen bg-neutral-100">
      <header className="bg-green-900 text-white p-5 shadow relative">
        <Link
          href="/"
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 px-3 py-2 rounded-lg font-bold"
        >
          ← Start
        </Link>

        <h1 className="text-2xl font-bold text-center">Teilnehmer</h1>
      </header>

      <section className="max-w-md mx-auto p-4 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setCompetition("prince")}
            className={`rounded-2xl p-4 font-bold shadow ${
              competition === "prince"
                ? "bg-green-900 text-white"
                : "bg-white text-green-900"
            }`}
          >
            Sonntag
            <br />
            Prinzenschießen
          </button>

          <button
            onClick={() => setCompetition("king")}
            className={`rounded-2xl p-4 font-bold shadow ${
              competition === "king"
                ? "bg-green-900 text-white"
                : "bg-white text-green-900"
            }`}
          >
            Montag
            <br />
            Königsschießen
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <label className="block text-lg font-bold text-green-900 mb-2">
            🔎 Namen suchen
          </label>

          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Name eingeben..."
            className="w-full rounded-xl border-2 border-gray-300 bg-white p-4 text-xl text-black placeholder:text-gray-400 focus:border-green-700 focus:outline-none"
          />
        </div>

        {companies.map((company) => {
          const list = filteredParticipants.filter(
            (p) => p.company_key === company.id
          );

          if (list.length === 0) return null;

          return (
            <div key={company.id} className="bg-white rounded-2xl shadow p-4">
              <h2 className="text-xl font-bold text-green-900 mb-3">
                {company.name}
              </h2>

              <div className="space-y-2">
                {list.map((participant) => (
                  <div
                    key={participant.id}
                    className={`rounded-xl p-3 border ${
                      participant.ausgeschieden
                        ? "bg-gray-100 text-gray-500"
                        : "bg-green-50 text-green-950"
                    }`}
                  >
                    <div className="font-bold text-lg">
                      {participant.ausgeschieden ? "⚪ " : "🟢 "}
                      {participant.name}
                    </div>

                    {participant.ausgeschieden && (
                      <div className="text-sm">ausgeschieden</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}