"use client";

export default function ManageError({ reset }: { reset: () => void }) {
  return <main className="grid min-h-svh place-items-center bg-[#FDE3AD] p-6 text-[#741314]"><div className="max-w-md rounded-3xl border-2 border-[#741314] bg-[#FFF7E8] p-8">
    <h1 className="text-3xl font-bold">Un momento, no hemos podido conectar.</h1>
    <p className="mt-4">Comprueba tu conexión y vuelve a cargar tu comercio.</p>
    <button type="button" onClick={reset} className="mt-6 min-h-12 rounded-xl bg-[#741314] px-6 font-bold text-[#FFF7E8]">Volver a intentar</button>
  </div></main>;
}
