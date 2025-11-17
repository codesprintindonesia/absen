// verify-shift-security.js - Verification script untuk shift security setup

import { getSequelize } from './src/libraries/databaseInstance.library.js';

const sequelize = await getSequelize();

console.log('\n════════════════════════════════════════════════════════════');
console.log('📊 VERIFIKASI DATA SHIFT SECURITY');
console.log('════════════════════════════════════════════════════════════\n');

try {
  // 1. Check shift kerja
  const shifts = await sequelize.query(`
    SELECT id, nama, is_hari_kerja, jam_masuk, jam_pulang
    FROM absensi.m_shift_kerja
    WHERE id IN ('SHF-PAGI', 'SHF-SIANG', 'SHF-MALAM', 'SHF-OFF')
    ORDER BY id
  `, { type: sequelize.QueryTypes.SELECT });

  console.log('✅ SHIFT KERJA (4 shifts):');
  console.table(shifts);

  // 2. Check shift group
  const groups = await sequelize.query(`
    SELECT id, nama, durasi_rotasi_hari, is_active
    FROM absensi.m_shift_group
    WHERE id = 'SG-SECUR'
  `, { type: sequelize.QueryTypes.SELECT });

  console.log('\n✅ SHIFT GROUP:');
  console.table(groups);

  // 3. Check shift group detail
  const details = await sequelize.query(`
    SELECT
      sgd.id,
      sgd.urutan_hari_siklus as hari,
      sgd.id_shift_kerja,
      sk.nama as nama_shift,
      sk.is_hari_kerja
    FROM absensi.r_shift_group_detail sgd
    JOIN absensi.m_shift_kerja sk ON sk.id = sgd.id_shift_kerja
    WHERE sgd.id_shift_group = 'SG-SECUR'
    ORDER BY sgd.urutan_hari_siklus
  `, { type: sequelize.QueryTypes.SELECT });

  console.log('\n✅ SHIFT GROUP DETAIL - PATTERN (7 hari):');
  console.table(details);

  // 4. Validation
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('🔍 VALIDASI:');
  console.log('════════════════════════════════════════════════════════════');

  const checks = {
    'Shift Kerja (4)': shifts.length === 4,
    'Shift Group (1)': groups.length === 1,
    'Shift Group Detail (7)': details.length === 7,
    'Durasi Rotasi = 7': groups[0]?.durasi_rotasi_hari === 7,
    'SHF-OFF is_hari_kerja = FALSE': shifts.find(s => s.id === 'SHF-OFF')?.is_hari_kerja === false,
    'Other shifts is_hari_kerja = TRUE': shifts.filter(s => s.id !== 'SHF-OFF').every(s => s.is_hari_kerja === true),
  };

  Object.entries(checks).forEach(([check, passed]) => {
    console.log(`  ${passed ? '✅' : '❌'} ${check}`);
  });

  const allPassed = Object.values(checks).every(v => v === true);

  console.log('\n════════════════════════════════════════════════════════════');
  if (allPassed) {
    console.log('🎉 SEMUA VALIDASI BERHASIL!');
    console.log('════════════════════════════════════════════════════════════');
    console.log('\n📝 Next Steps:');
    console.log('   1. Assign pegawai ke shift group SG-SECUR');
    console.log('   2. Run generate shift harian');
    console.log('   3. Verifikasi pattern dengan: node test-cycle-pattern.js');
  } else {
    console.log('⚠️  ADA VALIDASI YANG GAGAL!');
    console.log('════════════════════════════════════════════════════════════');
  }

  process.exit(allPassed ? 0 : 1);

} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}
