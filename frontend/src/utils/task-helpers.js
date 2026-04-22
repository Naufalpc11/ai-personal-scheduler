export function timeToMinutes(hhmm) {
  const [hour, minute] = String(hhmm).split(':').map(Number)
  return (hour * 60) + minute
}

export function dateToStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function addDays(date, n) {
  const next = new Date(date)
  next.setDate(next.getDate() + n)
  return next
}

export const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
export const DAY_NAMES_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
