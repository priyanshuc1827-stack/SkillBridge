import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
}

export function getInitials(name) {
  return name
    ?.split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '??';
}

export function getDashboardPath(role) {
  const paths = {
    student: '/dashboard/student',
    college: '/dashboard/college',
    recruiter: '/dashboard/recruiter',
    admin: '/dashboard/admin',
  };
  return paths[role] ?? '/';
}
