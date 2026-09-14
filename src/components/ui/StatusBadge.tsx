interface StatusBadgeProps {
  ok: boolean;
  label: string;
}

export function StatusBadge({ ok, label }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
        ok
          ? 'bg-emerald-100 text-emerald-900'
          : 'bg-red-100 text-red-900'
      }`}
    >
      <span
        aria-hidden="true"
        className={`size-2 rounded-full ${ok ? 'bg-emerald-600' : 'bg-red-600'}`}
      />
      {label}: {ok ? 'conectado' : 'sin conexion'}
    </span>
  );
}
