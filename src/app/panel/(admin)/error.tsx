"use client";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <div role="alert" className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-950 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">No se pudo cargar</p>
      <h1 className="mt-3 text-2xl font-semibold">El panel no ha podido recuperar estos datos.</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-red-900/75">
        Revisa la conexión y vuelve a intentarlo. No se ha modificado ningún registro.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 min-h-11 rounded-full bg-[#741314] px-5 text-sm font-bold text-[#FFF7E8]"
      >
        Reintentar
      </button>
    </div>
  );
}
