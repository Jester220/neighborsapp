// Maps each help_type from the backend to an emoji icon for quick visual scanning
export const CATEGORY_ICONS = {
  Charger: '🔌',
  Calculator: '🧮',
  'Power bank': '🔋',
  Cable: '🔌',
  Book: '📚',
  Tool: '🔧',
  Stationery: '✏️',
  'Technical help': '💻',
  'Academic help': '📖',
  'Physical help': '💪',
  'Printing/scanning': '🖨️',
  'Finding something': '🔎',
  'Campus-related help': '🏫',
  Other: '❓'
};

export function getCategoryIcon(helpType) {
  return CATEGORY_ICONS[helpType] || '❓';
}

const URGENCY_STYLES = {
  high: { label: 'Urgent', className: 'bg-coral/10 text-coral' },
  medium: { label: 'Moderate', className: 'bg-blue-accent/10 text-blue-accent' },
  low: { label: 'Flexible', className: 'bg-line text-navy/60' }
};

export function getUrgencyStyle(urgency) {
  return URGENCY_STYLES[urgency] || URGENCY_STYLES.medium;
}

export function timeAgo(dateString) {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString();
}

export const STATUS_LABELS = {
  OPEN: { label: 'Open', className: 'bg-blue-accent/10 text-blue-accent' },
  HELP_OFFERED: { label: 'Offer Pending', className: 'bg-coral/10 text-coral' },
  ACCEPTED: { label: 'Accepted', className: 'bg-emerald-100 text-emerald-700' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-emerald-100 text-emerald-700' },
  COMPLETED: { label: 'Completed', className: 'bg-navy/10 text-navy/70' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-600' },
  DECLINED: { label: 'Declined', className: 'bg-red-100 text-red-600' },
  EXPIRED: { label: 'Expired', className: 'bg-navy/10 text-navy/50' }
};
