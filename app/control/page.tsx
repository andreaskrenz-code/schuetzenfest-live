"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { companies } from "@/lib/companies";


type Competition = "prince" | "king";

type Participant = {
  id: string;
  name: string;
  company_key: string;
  competition: Competition;
  sort_order: number;
  ausgeschieden: boolean;
};

type Insignia = "krone" | "zepter" | "apfel" | "vogel";

export default function ControlPage() {
  const [competition, setCompetition] = useState<Competition>("prince");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [insigniaState, setInsigniaState] = useState({
    krone: false,
    zepter: false,
    apfel: false,
  });

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  useEffect(() => {
    loadParticipants();
  }, [competition]);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  function showStatus(message: string) {
    setStatusMessage(message);

    setTimeout(() => {
      setStatusMessage("");
    }, 3000);
  }

  async function loadParticipants() {
    setLoading(true);

    const { data, error } = await supabase
      .from("sf_participants")
      .select("*")
      .eq("competition", competition)
      .eq("ausgeschieden", false)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error(error);
      setParticipants([]);
    } else {
      setParticipants(data ?? []);
    }

    const { data: liveData, error: liveError } = await supabase
      .from("sf_live_state")
      .select("krone_gefallen, zepter_gefallen, apfel_gefallen")
      .eq("id", 1)
      .single();

    if (!liveError && liveData) {
      setInsigniaState({
        krone: Boolean(liveData.krone_gefallen),
        zepter: Boolean(liveData.zepter_gefallen),
        apfel: Boolean(liveData.apfel_gefallen),
      });
    }

    setSelectedCompanyId(null);
    setSelectedParticipant(null);
    setLoading(false);
  }

  async function selectCompany(companyId: string) {
    setSelectedCompanyId(companyId);
    setSelectedParticipant(null);

    const { error } = await supabase
      .from("sf_live_state")
      .update({
        competition,
        company_key: companyId,
        participant_id: null,
        participant_name: null,
        message_type: "normal",
        insignia: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (!error) {
      const company = companies.find((c) => c.id === companyId);
      showStatus(`✅ ${company?.name ?? "Kompanie"} ist jetzt auf dem Bildschirm`);
    }
  }

  async function selectParticipant(participant: Participant) {
    setSelectedParticipant(participant);

    const { error } = await supabase
      .from("sf_live_state")
      .update({
        competition,
        company_key: participant.company_key,
        participant_id: participant.id,
        participant_name: participant.name,
        message_type: "normal",
        insignia: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (!error) {
      showStatus(`✅ ${participant.name} ist jetzt auf dem Bildschirm`);
    }
  }

  async function sendInsignia(insignia: Insignia) {
    const updates: Record<string, unknown> = {
      competition,
      company_key: selectedCompanyId,
      participant_id: selectedParticipant?.id ?? null,
      participant_name: selectedParticipant?.name ?? null,
      message_type: "insignia",
      insignia,
      updated_at: new Date().toISOString(),
    };

    if (insignia === "krone") updates.krone_gefallen = true;
    if (insignia === "zepter") updates.zepter_gefallen = true;
    if (insignia === "apfel") updates.apfel_gefallen = true;

    const { error } = await supabase
      .from("sf_live_state")
      .update(updates)
      .eq("id", 1);

    if (error) {
      console.error(error);
      showStatus("❌ Fehler beim Senden");
      return;
    }

    await supabase.from("sf_event_log").insert({
      competition,
      company_key: selectedCompanyId,
      participant_id: selectedParticipant?.id ?? null,
      participant_name: selectedParticipant?.name ?? null,
      action: insignia,
    });

    if (selectedParticipant && insignia !== "vogel") {
      await supabase
        .from("sf_participants")
        .update({ ausgeschieden: true })
        .eq("id", selectedParticipant.id);

      setParticipants((current) =>
        current.filter((p) => p.id !== selectedParticipant.id)
      );

      setSelectedParticipant(null);
    }

    if (insignia === "krone") setInsigniaState((p) => ({ ...p, krone: true }));
    if (insignia === "zepter") setInsigniaState((p) => ({ ...p, zepter: true }));
    if (insignia === "apfel") setInsigniaState((p) => ({ ...p, apfel: true }));

    const labels = {
      krone: "👑 Krone",
      zepter: "⚜️ Zepter",
      apfel: "🌍 Apfel",
      vogel: "🎯 Vogel",
    };

    showStatus(`✅ ${labels[insignia]} ist jetzt auf dem Bildschirm`);
  }

  const namesForCompany = participants.filter(
    (p) => p.company_key === selectedCompanyId
  );

  if (selectedCompany) {
    return (
      <main className="min-h-screen bg-neutral-100">
        <header className="bg-green-900 text-white p-5 shadow relative">
  <button
    onClick={() => {
      setSelectedCompanyId(null);
      setSelectedParticipant(null);
    }}
    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg font-bold transition"
  >
    ← Zurück
  </button>

  <h1 className="text-2xl font-bold text-center">
    {selectedCompany.name}
  </h1>
</header>

        <section className="max-w-md mx-auto p-4 space-y-5">
          <div
            className={`rounded-2xl p-3 text-center font-bold shadow ${
              isOnline ? "bg-green-700 text-white" : "bg-red-700 text-white"
            }`}
          >
            {isOnline ? "🟢 Verbunden" : "🔴 Keine Verbindung"}
          </div>

          {statusMessage && (
            <div className="bg-green-700 text-white rounded-2xl p-4 text-center font-bold shadow">
              {statusMessage}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow p-5 flex justify-center">
            <Image
              src={selectedCompany.logo}
              alt={selectedCompany.name}
              width={130}
              height={130}
              className="object-contain"
            />
          </div>

          {selectedParticipant && (
            <div className="bg-green-900 text-white rounded-2xl p-4 text-center shadow">
              <div className="text-sm">Aktuell ausgewählt</div>
              <div className="text-2xl font-bold">{selectedParticipant.name}</div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold text-green-950 mb-3">
              Schütze auswählen
            </h2>

            <div className="space-y-3">
              {namesForCompany.length === 0 && (
                <p className="text-center text-neutral-600">
                  Keine aktiven Aspiranten für diese Kompanie.
                </p>
              )}

              {namesForCompany.map((participant) => (
                <button
                  key={participant.id}
                  onClick={() => selectParticipant(participant)}
                  className="w-full bg-green-900 text-white rounded-2xl p-5 text-2xl font-bold shadow active:scale-95 transition"
                >
                  {participant.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-green-950 mb-3">
              {competition === "prince" ? "Insignie" : "Königsschießen"}
            </h2>

            {competition === "prince" ? (
              <div className="grid gap-3">
                {!insigniaState.krone && (
                  <button
                    onClick={() => sendInsignia("krone")}
                    className="bg-yellow-500 rounded-2xl p-5 text-2xl font-bold shadow"
                  >
                    👑 Krone
                  </button>
                )}

                {!insigniaState.zepter && (
                  <button
                    onClick={() => sendInsignia("zepter")}
                    className="bg-yellow-500 rounded-2xl p-5 text-2xl font-bold shadow"
                  >
                    ⚜️ Zepter
                  </button>
                )}

                {!insigniaState.apfel && (
                  <button
                    onClick={() => sendInsignia("apfel")}
                    className="bg-yellow-500 rounded-2xl p-5 text-2xl font-bold shadow"
                  >
                    🌍 Apfel
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  if (confirm("Ist der Vogel wirklich gefallen?")) {
                    sendInsignia("vogel");
                  }
                }}
                className="w-full bg-red-700 text-white rounded-2xl p-6 text-2xl font-bold shadow"
              >
                🎯 Vogel gefallen
              </button>
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100">
      <header className="bg-green-900 text-white p-6 shadow-lg">
        <Link href="/" className="underline text-sm">
          ← Startseite
        </Link>

        <h1 className="text-3xl font-bold text-center mt-2">Bedienung</h1>
        <p className="text-center mt-2 text-green-100">Kompanie auswählen</p>
      </header>

      <section className="max-w-md mx-auto p-4 space-y-5">
        <div
          className={`rounded-2xl p-3 text-center font-bold shadow ${
            isOnline ? "bg-green-700 text-white" : "bg-red-700 text-white"
          }`}
        >
          {isOnline ? "🟢 Verbunden" : "🔴 Keine Verbindung"}
        </div>

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

        {loading && (
          <p className="text-center font-bold text-green-900">Lade Daten...</p>
        )}

        <button
          onClick={loadParticipants}
          className="w-full bg-yellow-500 rounded-2xl p-4 text-xl font-bold shadow"
        >
          Teilnehmer neu laden
        </button>

        <div className="space-y-4">
          {companies.map((company) => (
            <button
              key={company.id}
              onClick={() => selectCompany(company.id)}
              className="w-full bg-white rounded-2xl shadow p-4 flex items-center gap-5 active:scale-95 transition"
            >
              <Image
                src={company.logo}
                alt={company.name}
                width={80}
                height={80}
                className="object-contain"
              />

              <span className="text-2xl font-bold text-green-900">
                {company.name}
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}