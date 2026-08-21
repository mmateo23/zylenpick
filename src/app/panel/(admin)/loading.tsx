export default function AdminLoading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando panel</span>
      <div className="h-28 rounded-3xl border border-[#741314]/10 bg-[#FFF7E8]" />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="h-24 rounded-2xl border border-[#741314]/10 bg-white" />
        <div className="h-24 rounded-2xl border border-[#741314]/10 bg-white" />
        <div className="h-24 rounded-2xl border border-[#741314]/10 bg-white" />
      </div>
      <div className="h-64 rounded-2xl border border-[#741314]/10 bg-white" />
    </div>
  );
}
