// analyze-is-umum.js - Analisis kolom is_umum di m_shift_kerja

import { getSequelize } from './src/libraries/databaseInstance.library.js';

const sequelize = await getSequelize();

console.log('\n════════════════════════════════════════════════════════════');
console.log('🔍 ANALISIS KOLOM is_umum DI m_shift_kerja');
console.log('════════════════════════════════════════════════════════════\n');

try {
  // 1. Check apakah kolom is_umum ada
  const columns = await sequelize.query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'absensi'
      AND table_name = 'm_shift_kerja'
      AND column_name = 'is_umum'
  `, { type: sequelize.QueryTypes.SELECT });

  if (columns.length === 0) {
    console.log('❌ Kolom is_umum TIDAK DITEMUKAN di tabel m_shift_kerja');
    console.log('\n✅ Kesimpulan: Kolom is_umum sudah tidak ada atau belum pernah dibuat');
    process.exit(0);
  }

  console.log('✅ Kolom is_umum ditemukan:');
  console.table(columns);

  // 2. Check nilai is_umum di data existing
  const data = await sequelize.query(`
    SELECT
      is_umum,
      COUNT(*) as jumlah,
      STRING_AGG(DISTINCT id, ', ' ORDER BY id) as sample_ids
    FROM absensi.m_shift_kerja
    GROUP BY is_umum
    ORDER BY is_umum DESC NULLS LAST
  `, { type: sequelize.QueryTypes.SELECT });

  console.log('\n📊 Distribusi nilai is_umum:');
  console.table(data);

  // 3. Check semua shift untuk melihat pola
  const allShifts = await sequelize.query(`
    SELECT id, nama, is_umum, is_active, is_hari_kerja
    FROM absensi.m_shift_kerja
    ORDER BY is_umum DESC NULLS LAST, id
    LIMIT 20
  `, { type: sequelize.QueryTypes.SELECT });

  console.log('\n📋 Sample shift data (max 20):');
  console.table(allShifts);

  // 4. Check penggunaan is_umum di kode
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('🔍 ANALISIS PENGGUNAAN:');
  console.log('════════════════════════════════════════════════════════════');

  const hasTrue = data.some(d => d.is_umum === true);
  const hasFalse = data.some(d => d.is_umum === false);
  const hasNull = data.some(d => d.is_umum === null);

  console.log(`\n📌 Nilai yang digunakan:`);
  console.log(`   - TRUE: ${hasTrue ? '✅ Ada' : '❌ Tidak ada'}`);
  console.log(`   - FALSE: ${hasFalse ? '✅ Ada' : '❌ Tidak ada'}`);
  console.log(`   - NULL: ${hasNull ? '✅ Ada' : '❌ Tidak ada'}`);

  // 5. Kesimpulan
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('💡 KESIMPULAN:');
  console.log('════════════════════════════════════════════════════════════');

  if (!hasTrue && !hasFalse && hasNull) {
    console.log('\n⚠️  Kolom is_umum sepertinya TIDAK DIGUNAKAN:');
    console.log('   - Semua nilai NULL');
    console.log('   - Tidak ada data yang memanfaatkan kolom ini');
    console.log('\n💡 REKOMENDASI: Bisa dihapus jika tidak ada di business logic');
  } else if (hasTrue || hasFalse) {
    console.log('\n✅ Kolom is_umum DIGUNAKAN:');
    console.log('   - Ada data dengan nilai TRUE atau FALSE');
    console.log('   - Mungkin untuk membedakan shift umum vs shift khusus');
    console.log('\n💡 REKOMENDASI: Perlu cek business logic sebelum hapus');
  }

  console.log('\n📝 LANGKAH SELANJUTNYA:');
  console.log('   1. Grep kode untuk cari penggunaan "is_umum"');
  console.log('   2. Cek apakah ada logic yang depend pada kolom ini');
  console.log('   3. Jika tidak digunakan, bisa dihapus');

  process.exit(0);

} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}
