import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hors ligne",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <section className="sec">
      <div className="wrap narrow" style={{ textAlign: "center" }}>
        <p className="mono tiny eyebrow">Connexion perdue</p>
        <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)", marginTop: 12 }}>
          Vous êtes hors ligne.
        </h1>
        <p className="lede" style={{ margin: "20px auto 0" }}>
          Les pages déjà consultées restent accessibles. Vous pouvez même
          rédiger votre demande : elle sera enregistrée et partira dès que la
          connexion revient.
        </p>
        <div className="hero-cta" style={{ justifyContent: "center", marginTop: 28 }}>
          <Link href="/" className="btn">
            Retour à l’accueil
          </Link>
          <Link href="/contact" className="btn ghost">
            Écrire une demande
          </Link>
        </div>
      </div>
    </section>
  );
}
