import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-100">
      <header className="bg-green-900 text-white p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-center">Schützenfest Live</h1>
        <p className="text-center mt-2 text-green-100">
          Vogelschießen Anzeige
        </p>
      </header>

      <section className="max-w-md mx-auto p-4 space-y-4">
        <Link
          href="/setup"
          className="block bg-white rounded-2xl shadow p-6 text-center"
        >
          <div className="text-4xl mb-2">⚙️</div>
          <div className="text-2xl font-bold text-green-900">Einrichtung</div>
          <p className="text-neutral-600 mt-2">Veranstaltung und Aspiranten anlegen</p>
        </Link>

        <Link
          href="/control"
          className="block bg-white rounded-2xl shadow p-6 text-center"
        >
          <div className="text-4xl mb-2">📱</div>
          <div className="text-2xl font-bold text-green-900">Bedienung</div>
          <p className="text-neutral-600 mt-2">Kompanie, Schütze und Insignien auswählen</p>
        </Link>

        <Link
          href="/display"
          className="block bg-white rounded-2xl shadow p-6 text-center"
        >
          <div className="text-4xl mb-2">🖥️</div>
          <div className="text-2xl font-bold text-green-900">Anzeige</div>
          <p className="text-neutral-600 mt-2">Bildschirmansicht für den Livestream</p>
        </Link>
      </section>
    </main>
  );
}