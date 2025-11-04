// src/utils/hariKerja.utils.js

/**
 * Validasi apakah tanggal masuk dalam hari_kerja shift
 * @param {string} tanggal - Format YYYY-MM-DD
 * @param {Array} hariKerja - Array berisi [1-7] ISO standard (1=Senin, 7=Minggu)
 * @returns {boolean}
 */
export const isHariKerja = (tanggal, hariKerja) => {
  if (!hariKerja || !Array.isArray(hariKerja) || hariKerja.length === 0) {
    return true;
  }

  const date = new Date(tanggal);
  const dayOfWeek = date.getDay();
  const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
  
  return hariKerja.includes(isoDayOfWeek);
};

/**
 * Get day name dari ISO day number
 * @param {number} isoDayOfWeek - 1-7 (1=Senin, 7=Minggu)
 * @returns {string}
 */
export const getDayName = (isoDayOfWeek) => {
  const days = {
    1: 'Senin',
    2: 'Selasa', 
    3: 'Rabu',
    4: 'Kamis',
    5: 'Jumat',
    6: 'Sabtu',
    7: 'Minggu'
  };
  return days[isoDayOfWeek] || 'Unknown';
};