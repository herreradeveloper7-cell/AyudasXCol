export default function Loading({ mensaje = "Cargando página..." }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-3 py-20 text-center text-slate-500"
    >
      <span
        aria-hidden="true"
        className="h-8 w-8 motion-safe:animate-spin rounded-full border-4 border-slate-200 border-t-secondary"
      />
      <span>{mensaje}</span>
    </div>
  );
}
