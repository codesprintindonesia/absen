// src/services/transactional/shiftHarianPegawai/generate.service.js

import { getSequelize } from "../../../libraries/databaseInstance.library.js"; 
import { isHariKerja } from "../../../utils/hariKerja.utils.js";
import findActiveShiftPegawai from "../../../repositories/relational/shiftPegawai/findActive.repository.js";
import findByPegawaiAndTanggal from "../../../repositories/transactional/shiftHarianPegawai/findByPegawaiAndTanggal.repository.js";
import deleteByPegawaiAndTanggal from "../../../repositories/transactional/shiftHarianPegawai/deleteByPegawaiAndTanggal.repository.js";
import createShiftHarian from "../../../repositories/transactional/shiftHarianPegawai/create.repository.js";
import findShiftGroupById from "../../../repositories/master/shiftGroup/findById.repository.js";
import findShiftPattern from "../../../repositories/relational/shiftGroupDetail/findPattern.repository.js";
import findLokasiPriority from "../../../repositories/relational/lokasiKerjaPegawai/findActivePriority.repository.js";
import findShiftKerjaWithHariKerja from "../../../repositories/master/shiftKerja/findByIdWithHariKerja.repository.js";

const sequelize = await getSequelize();

export const generateShiftHarianPegawaiService = async ({
  tanggalMulai,
  tanggalAkhir,
  idPegawai = null,
  mode = "error",
}) => {
  const transaction = await sequelize.transaction();

  if (!["skip", "overwrite", "error"].includes(mode)) {
    throw new Error(
      `Invalid mode: ${mode}. Must be 'skip', 'overwrite', or 'error'`
    );
  }

  try { 

    const shiftPegawaiList = await findActiveShiftPegawai(idPegawai, {
      transaction,
    });

    if (shiftPegawaiList.length === 0) {
      throw new Error("Tidak ada pegawai dengan shift assignment aktif");
    }

    const tanggalArray = generateDateArray(tanggalMulai, tanggalAkhir);

    const results = {
      totalPegawai: shiftPegawaiList.length,
      totalHari: tanggalArray.length,
      totalGenerated: 0,
      skippedNonWorkingDays: 0,
      errors: [],
    };

    for (const shiftPegawai of shiftPegawaiList) {
      try {
        const pegawaiResults = await processShiftForPegawai({
          shiftPegawai,
          tanggalArray,
          mode,
          transaction,
        });

        results.totalGenerated += pegawaiResults.inserted + pegawaiResults.overwritten;
        results.skippedNonWorkingDays += pegawaiResults.skippedNonWorkingDays;
      } catch (error) { 

        results.errors.push({
          idPegawai: shiftPegawai.id_pegawai,
          namaPegawai: shiftPegawai.nama_pegawai,
          error: error.message,
        });
      }
    }

    await transaction.commit(); 

    return {
      success: true,
      message: "Generate shift harian selesai",
      data: results,
    };
  } catch (error) {
    await transaction.rollback(); 

    throw error;
  }
};

const processShiftForPegawai = async ({
  shiftPegawai,
  tanggalArray,
  mode,
  transaction,
}) => {
  const lokasiKerja = await findLokasiPriority(shiftPegawai.id_pegawai, {
    transaction,
  });

  if (!lokasiKerja) {
    throw new Error(
      `Pegawai ${shiftPegawai.id_pegawai} tidak memiliki lokasi kerja aktif`
    );
  }

  const isFixedShift = shiftPegawai.id_shift_kerja !== null;
  const isRotatingShift = shiftPegawai.id_shift_group !== null;

  if (!isFixedShift && !isRotatingShift) {
    throw new Error(
      `Pegawai ${shiftPegawai.id_pegawai} tidak memiliki shift assignment yang valid`
    );
  }

  let shiftGroupInfo = null;
  let shiftPattern = null;
  let cycleLength = 0;
  let fixedShiftInfo = null;

  if (isFixedShift) {
    fixedShiftInfo = await findShiftKerjaWithHariKerja(
      shiftPegawai.id_shift_kerja,
      { transaction }
    );

    if (!fixedShiftInfo) {
      throw new Error(
        `Shift kerja ${shiftPegawai.id_shift_kerja} tidak ditemukan`
      );
    } 
  }

  if (isRotatingShift) {
    shiftGroupInfo = await findShiftGroupById(shiftPegawai.id_shift_group, {
      transaction,
    });

    if (!shiftGroupInfo) {
      throw new Error(
        `Shift group ${shiftPegawai.id_shift_group} tidak ditemukan`
      );
    }

    if (!shiftGroupInfo.durasi_rotasi_hari) {
      throw new Error(
        `Shift group ${shiftPegawai.id_shift_group} belum di-migrate ke cycle-based. Durasi rotasi hari tidak ditemukan.`
      );
    }

    cycleLength = shiftGroupInfo.durasi_rotasi_hari;

    shiftPattern = await findShiftPattern(shiftPegawai.id_shift_group, {
      transaction,
    });

    if (!shiftPattern || shiftPattern.length === 0) {
      throw new Error(
        `Pattern untuk shift group ${shiftPegawai.id_shift_group} tidak ditemukan`
      );
    }

    if (shiftPattern.length !== cycleLength) {
      throw new Error(
        `Pattern tidak lengkap untuk shift group ${shiftPegawai.id_shift_group}. Expected ${cycleLength} detail, got ${shiftPattern.length}`
      );
    }
 
  }

  const offset = shiftPegawai.offset_rotasi_hari || 0;

  const results = {
    inserted: 0,
    skipped: 0,
    overwritten: 0,
    skippedNonWorkingDays: 0,
  };

  for (let dayIndex = 0; dayIndex < tanggalArray.length; dayIndex++) {
    const tanggal = tanggalArray[dayIndex];

    let shiftId;
    let shiftInfo;

    if (isFixedShift) {
      shiftId = shiftPegawai.id_shift_kerja;
      shiftInfo = fixedShiftInfo;
    } else {
      const cyclePosition = ((dayIndex + offset) % cycleLength) + 1;

      const pattern = shiftPattern.find(
        (p) => p.urutan_hari_siklus === cyclePosition
      );

      if (!pattern || !pattern.id_shift_kerja) {
        throw new Error(
          `Pattern tidak ditemukan untuk hari siklus ${cyclePosition} (dayIndex=${dayIndex}, offset=${offset}, cycleLength=${cycleLength})`
        );
      }

      shiftId = pattern.id_shift_kerja;

      shiftInfo = await findShiftKerjaWithHariKerja(shiftId, { transaction });

      if (!shiftInfo) {
        throw new Error(`Shift kerja ${shiftId} tidak ditemukan`);
      }
 
    }

    // VALIDASI HARI KERJA
    if (!isHariKerja(tanggal, shiftInfo.hari_kerja)) { 
      results.skippedNonWorkingDays++;
      continue;
    }

    const existing = await findByPegawaiAndTanggal(
      shiftPegawai.id_pegawai,
      tanggal,
      { transaction }
    );

    if (existing && existing.length > 0) {
      if (mode === "skip") { 
        results.skipped++;
        continue;
      } else if (mode === "overwrite") {
        await deleteByPegawaiAndTanggal(shiftPegawai.id_pegawai, tanggal, {
          transaction,
        }); 
        results.overwritten++;
      } else if (mode === "error") {
        throw new Error(
          `Data shift untuk pegawai ${shiftPegawai.id_pegawai} tanggal ${tanggal} sudah ada. Gunakan mode='overwrite' untuk menimpa data existing.`
        );
      }
    }

    const dateStr = tanggal.replace(/-/g, "");
    const id = `JDW-${shiftPegawai.id_pegawai}-${dateStr}`;

    await createShiftHarian(
      {
        id,
        idPegawai: shiftPegawai.id_pegawai,
        tanggalKerja: tanggal,
        shiftJadwal: shiftId,
        shiftAktual: shiftId,
        lokasiJadwal: lokasiKerja.id_lokasi_kerja,
        lokasiAktual: lokasiKerja.id_lokasi_kerja,
        namaPegawai: shiftPegawai.nama_pegawai,
        idPersonal: shiftPegawai.id_personal,
      },
      { transaction }
    );

    results.inserted++;
  } 

  return results;
};

const generateDateArray = (startDate, endDate) => {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

export const calculateOptimalOffsets = (numPegawai, cycleLength) => {
  const offsets = [];

  if (cycleLength % numPegawai === 0 || numPegawai % cycleLength === 0) {
    const step = Math.floor(cycleLength / numPegawai);
    for (let i = 0; i < numPegawai; i++) {
      offsets.push(i * step);
    }
  } else {
    const step = cycleLength / numPegawai;
    for (let i = 0; i < numPegawai; i++) {
      offsets.push(Math.floor(i * step));
    }
    console.warn(
      `Uneven distribution: ${numPegawai} pegawai with ${cycleLength}-day cycle`
    );
  }

  return offsets;
};

export default generateShiftHarianPegawaiService;