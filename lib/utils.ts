import { differenceInCalendarDays, differenceInMonths, differenceInYears } from 'date-fns';


export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatRelativeTime = (date: string | null): string => {
  if (!date) return '-';
  try {
    const target = new Date(date);
    const now = new Date();

    const diffDays = differenceInCalendarDays(target, now);
    const diffMonths = differenceInMonths(target, now);
    const diffYears = differenceInYears(target, now);

    if (diffYears !== 0) {
      return diffYears < 0
        ? `${Math.abs(diffYears)} tahun lalu`
        : `${diffYears} tahun lagi`;
    } else if (diffMonths !== 0) {
      return diffMonths < 0
        ? `${Math.abs(diffMonths)} bulan lalu`
        : `${diffMonths} bulan lagi`;
    } else if (diffDays !== 0) {
      if (diffDays === -1) return 'Kemarin';
      if (diffDays === 1) return 'Besok';
      return diffDays < 0
        ? `${Math.abs(diffDays)} hari lalu`
        : `${diffDays} hari lagi`;
    } else {
      return 'Hari ini';
    }
  } catch {
    return '-';
  }
};


export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};



export const parseRupiahToNumber = (value: string): number => {
  return parseInt(value.replace(/\D/g, ''), 10) || 0;
};
