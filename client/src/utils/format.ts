export function timeAgo(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);

  if (d === 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 7) return `${d}d ago`;

  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function isOverdue(dueDate: string): boolean {
  return Boolean(dueDate && new Date(dueDate) < new Date());
}

export function formatDue(dueDate: string): string {
  if (!dueDate) return '';

  return new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
