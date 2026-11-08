interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  PENDIENTE: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pendiente' },
  ACEPTADA: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Aceptada' },
  COMPLETADA: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completada' },
  RECHAZADA: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rechazada' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}

