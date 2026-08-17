import { STATUS_LABELS } from '../utils/format';

export default function StatusBadge({ status }) {
  const style = STATUS_LABELS[status] || STATUS_LABELS.OPEN;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${style.className}`}>
      {style.label}
    </span>
  );
}
