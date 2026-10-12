// Helper functions for formatting dates and calculating inpatient duration

export function formatDateTime(isoString?: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const day = String(d.getDate()).padStart(2, '0');
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
  } catch (e) {
    return isoString;
  }
}

export function getNowDateTimeLocal(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

export function generateNoReg(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 900) + 100);
  return `REG-${y}${m}${d}-${rand}`;
}

export function calculateInpatientDuration(
  tglMasuk?: string,
  tglKeluar?: string,
  isDirawat = false
): string {
  if (!tglMasuk) return '-';

  const start = new Date(tglMasuk);
  if (isNaN(start.getTime())) return '-';

  let end: Date;
  let isActive = false;

  if (!tglKeluar || isDirawat) {
    end = new Date();
    isActive = true;
  } else {
    end = new Date(tglKeluar);
    if (isNaN(end.getTime())) {
      end = new Date();
      isActive = true;
    }
  }

  const diffMs = Math.max(0, end.getTime() - start.getTime());
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = Math.floor(diffHours % 24);

  if (diffHours < 24) {
    if (diffHours < 1) {
      return isActive ? 'Baru Masuk (< 1 Jam)' : '1 Hari (Observasi Singkat)';
    }
    return isActive ? `1 Hari (${Math.floor(diffHours)} Jam Aktif)` : '1 Hari (Observasi)';
  } else {
    const displayDays = Math.max(1, Math.ceil(diffHours / 24));
    if (isActive) {
      return `${displayDays} Hari (Aktif: ${diffDays}h ${remainingHours}j)`;
    } else {
      return `${displayDays} Hari`;
    }
  }
}
