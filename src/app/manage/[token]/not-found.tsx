import Image from "next/image";

export default function ManageNotFound() {
  return <main className="grid min-h-svh place-items-center bg-[#FDE3AD] p-6 text-[#741314]">
    <div className="w-full max-w-md rounded-3xl border-2 border-[#741314] bg-[#FFF7E8] p-8 shadow-[6px_6px_0_#741314]">
      <Image src="/icons/pickyalo-app.svg" alt="Pickyalo" width={64} height={64} />
      <p className="mt-10 text-xs font-bold uppercase tracking-widest">Acceso privado</p>
      <h1 className="mt-3 font-display text-4xl font-bold">Esta llave ya no abre.</h1>
      <p className="mt-5 leading-7">El enlace no es válido o se ha regenerado. Pide a Pickyalo el enlace actual de tu comercio.</p>
    </div>
  </main>;
}
