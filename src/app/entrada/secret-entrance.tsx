"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { ArrowRight, KeyRound } from "lucide-react";
import styles from "./secret-entrance.module.css";

export function SecretEntrance({ destination }: { destination: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function enter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/site-access", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, next: destination }),
      });
      const result = await response.json();
      if (!response.ok) { setError(result.error || "No se ha podido abrir. Inténtalo otra vez."); setBusy(false); return; }
      window.location.assign(result.next);
    } catch { setError("No hay conexión. Prueba de nuevo en un momento."); setBusy(false); }
  }
  return (
    <main className={styles.entrance}>
      <Image src="/logo/LogoNuevo.svg" alt="Pickyalo" width={156} height={56} priority className={styles.logo} />
      <section className={styles.card} aria-labelledby="secret-title">
        <span className={styles.key}><KeyRound size={24} aria-hidden="true" /></span>
        <p className={styles.eyebrow}>Solo entre nosotros</p>
        <h1 id="secret-title">Lo bueno está<br /><em>al otro lado.</em></h1>
        <p className={styles.description}>¿Tienes la clave? Abre Pickyalo.</p>
        <form onSubmit={enter}>
          <label htmlFor="secret-password">La clave</label>
          <input id="secret-password" type="password" autoComplete="current-password" autoCapitalize="none" spellCheck={false} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={Boolean(error)} aria-describedby="secret-feedback" placeholder="Escríbela aquí" />
          <p id="secret-feedback" role="status" className={styles.feedback}>{error}</p>
          <button type="submit" disabled={busy}>{busy ? "Abriendo…" : "Entrar"}<ArrowRight size={20} aria-hidden="true" /></button>
        </form>
        <p className={styles.note}>El mismo enlace. Un pequeño secreto.</p>
      </section>
    </main>
  );
}
