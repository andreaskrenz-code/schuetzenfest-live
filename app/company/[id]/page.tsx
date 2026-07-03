import Link from "next/link";
import Image from "next/image";

const companies = [
  {
    id: "heide",
    name: "Heide-Kompanie",
    logo: "/logos/heide.png",
  },
  {
    id: "kaemper",
    name: "Kämper-Kompanie",
    logo: "/logos/kaemper.png",
  },
  {
    id: "koenigstraesser",
    name: "Königsträßer-Kompanie",
    logo: "/logos/koenigstraesser.png",
  },
  {
    id: "maspern",
    name: "Maspern-Kompanie",
    logo: "/logos/maspern.png",
  },
  {
    id: "western",
    name: "Western-Kompanie",
    logo: "/logos/western.png",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-100">
      <header className="bg-green-900 text-white p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-center">
          Schützenfest Live
        </h1>
        <p className="text-center mt-2 text-green-100">
          Bitte eine Kompanie auswählen
        </p>
      </header>

      <section className="max-w-md mx-auto p-4">
        <div className="space-y-4">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/company/${company.id}`}
              className="block bg-white rounded-2xl shadow-lg hover:shadow-xl transition p-4"
            >
              <div className="flex items-center gap-5">
                <Image
                  src={company.logo}
                  alt={company.name}
                  width={80}
                  height={80}
                  className="rounded-xl"
                />

                <span className="text-2xl font-bold text-green-900">
                  {company.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}