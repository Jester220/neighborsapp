export default function EmptyState({ title, subtitle, actionLabel, onAction, icon = ' ' }) {
  return (
    <div className="liquid-glass rounded-xl2 flex flex-col items-center justify-center text-center py-16 px-6 animate-fade-up">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      {subtitle && <p className="text-white/50 text-sm max-w-xs mb-5">{subtitle}</p>}
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary-inline">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
