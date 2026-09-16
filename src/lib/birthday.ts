import { Customer, UpcomingBirthday } from '@/types';

/**
 * Calculates days until next birthday from today.
 * Supports recurring annual evaluation regardless of birth year.
 */
export function getDaysUntilBirthday(birthdayStr: string, referenceDate = new Date()): { daysUntil: number; nextBirthdayStr: string } {
  const parts = birthdayStr.split('-');
  if (parts.length < 3) {
    return { daysUntil: -1, nextBirthdayStr: '' };
  }

  const month = parseInt(parts[1], 10) - 1; // 0-indexed month
  const day = parseInt(parts[2], 10);

  const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const currentYear = today.getFullYear();

  // Create birthday date for current year
  let nextBday = new Date(currentYear, month, day);

  // If birthday already passed this year, look at next year
  if (nextBday < today) {
    nextBday = new Date(currentYear + 1, month, day);
  }

  const diffMs = nextBday.getTime() - today.getTime();
  const daysUntil = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const yyyy = nextBday.getFullYear();
  const mm = String(nextBday.getMonth() + 1).padStart(2, '0');
  const dd = String(nextBday.getDate()).padStart(2, '0');
  const nextBirthdayStr = `${yyyy}-${mm}-${dd}`;

  return { daysUntil, nextBirthdayStr };
}

/**
 * Filters and sorts customers whose birthday is in [0, daysAhead] days
 */
export function filterUpcomingBirthdays(customers: Customer[], daysAhead = 7): UpcomingBirthday[] {
  const list: UpcomingBirthday[] = [];

  for (const c of customers) {
    if (!c.birthday || !c.birthday_club_member) continue;

    const { daysUntil, nextBirthdayStr } = getDaysUntilBirthday(c.birthday);
    if (daysUntil >= 0 && daysUntil <= daysAhead) {
      list.push({
        customer_id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        birthday: c.birthday,
        days_until: daysUntil,
        birthday_this_year: nextBirthdayStr,
      });
    }
  }

  return list.sort((a, b) => a.days_until - b.days_until);
}

/**
 * Formats a birthday date string into a friendly label like "20 October"
 */
export function formatBirthdayDisplay(birthdayStr: string): string {
  try {
    const parts = birthdayStr.split('-');
    if (parts.length < 3) return birthdayStr;
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${day} ${months[monthIndex] || ''}`;
  } catch {
    return birthdayStr;
  }
}
