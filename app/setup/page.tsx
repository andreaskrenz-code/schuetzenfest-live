"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { companies } from "@/lib/companies";
import Link from "next/link";

type Competition = "prince" | "king";

type Participant = {
  name: string;
  companyKey: string;
};

export default function SetupPage() {
  const [competition, setCompetition] = useState<Competition>("prince");
  const [participants, setParticipants] = useState<Participant[]>([
    { name: "", companyKey: "heide" },
  ]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function addParticipant() {
    setParticipants([...participants, { name: "", companyKey: "heide" }]);
  }

  function updateParticipant(
    index: number,
    field: keyof Participant,
    value: string
  ) {
    const copy = [...participants];
    copy[index] = { ...copy[index], [field]: value };
    setParticipants(copy);
  }

  function removeParticipant(index: number) {
    setParticipants(participants.filter((_, i) => i !== index));
  }

  async function saveParticipants() {
    setSaving(true);
    setMessage("Speichere...");

    const cleanParticipants = participants
      .map((p, index) => ({
        name: p.name.trim(),
        company_key: p.companyKey,
        competition,
        sort_order: index + 1,
        ausgeschieden: false,
      }))
      .filter((p) => p.name.length > 0);

    if (cleanParticipants.length === 0) {
      setMessage("Bitte mindestens einen Namen eintragen.");
      setSaving(false);
      return;
    }

    await supabase
      .from("sf_live_state")
      .update({
        participant_id: null,
        participant_name: null,
        company_key: null,
        message_type: "normal",
        insignia: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    const deleteResult = await supabase
      .from("sf_participants")
      .delete()
      .eq("competition", competition)
      .select();

    if (deleteResult.error) {
      console.error(deleteResult.error);
      setMessage(deleteResult.error.message);
      setSaving(false);
      return;
    }

    const insertResult = await supabase
      .from("sf_participants")
      .insert(cleanParticipants)
      .select();

    if (insertResult.error) {
      console.error(insertResult.error);
      setMessage(insertResult.error.message);
      setSaving(false);
      return;
    }

    setMessage(`Gespeichert: ${cleanParticipants.length} Teilnehmer.`);
    setSaving(false);
  }

  async function resetFestival() {
    const confirmed = confirm(
      "Neues Schützenfest vorbereiten?\n\nAlle Teilnehmer, Ereignisse und Insignien werden gelöscht."
    );

    if (!confirmed) return;

    setSaving(true);
    setMessage("Bereite neues Schützenfest vor...");

    await supabase
      .from("sf_live_state")
      .update({
        competition: "prince",
        company_key: null,
        participant_id: null,
        participant_name: null,
        message_type: "normal",
        insignia: null,
        krone_gefallen: false,
        zepter_gefallen: false,
        apfel_gefallen: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    await supabase
      .from("sf_event_log")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    await supabase
      .from("sf_participants")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    setParticipants([{ name: "", companyKey: "heide" }]);
    setCompetition("prince");
    setMessage("✅ Neues Schützenfest wurde vorbereitet.");
    setSaving(false);
  }

  return (
    <main className="min-h-screen bg-neutral-100">
      <header className="bg-green-900 text-white p-5 shadow relative">

  <Link
    href="/"
    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg font-bold transition"
  >
    ← Start
  </Link>

  <h1 className="text-2xl font-bold text-center">
    Einrichtung
  </h1>

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

        <div className="space-y-3">
          <h2 className="text-xl font-bold text-green-950">
            Aspiranten eingeben
          </h2>

          {participants.map((participant, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border p-3 space-y-2"
            >
              <input
                className="w-full rounded-xl border-2 border-gray-300 bg-white p-4 text-xl text-black placeholder:text-gray-400 focus:border-green-700 focus:outline-none"
                placeholder="Name"
                value={participant.name}
                onChange={(e) =>
                  updateParticipant(index, "name", e.target.value)
                }
              />

              <select
                className="w-full p-3 rounded-lg border text-lg text-black bg-white"
                value={participant.companyKey}
                onChange={(e) =>
                  updateParticipant(index, "companyKey", e.target.value)
                }
              >
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>

              {participants.length > 1 && (
                <button
                  onClick={() => removeParticipant(index)}
                  className="w-full bg-red-600 text-white rounded-lg p-2 text-sm font-bold"
                >
                  Entfernen
                </button>
              )}
            </div>
          ))}

          <button
            onClick={addParticipant}
            className="w-full bg-green-800 text-white rounded-2xl p-5 text-xl font-bold shadow"
          >
            + Aspirant hinzufügen
          </button>

          <button
            onClick={saveParticipants}
            disabled={saving}
            className="w-full bg-yellow-500 disabled:bg-neutral-400 rounded-2xl p-5 text-xl font-bold shadow"
          >
            {saving ? "Speichere..." : "Teilnehmer speichern"}
          </button>

          <button
            onClick={resetFestival}
            disabled={saving}
            className="w-full bg-red-700 disabled:bg-neutral-400 text-white rounded-2xl p-5 text-xl font-bold shadow"
          >
            🧹 Neues Schützenfest vorbereiten
          </button>

          {message && (
            <p className="text-center font-bold text-green-950">{message}</p>
          )}
        </div>
      </section>
    </main>
  );
}