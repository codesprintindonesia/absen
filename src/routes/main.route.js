// src/routes/main.routes.js  
import { Router } from 'express';
import lokasiKerjaRoutes from './master/lokasiKerja.route.js';
import kebijakanAbsensiRoutes from './master/kebijakanAbsensi.route.js';
import shiftGroupRoutes from './master/shiftGroup.route.js';
import shiftKerjaRoutes from './master/shiftKerja.route.js'; 
import shiftGroupDetailRoutes from './relational/shiftGroupDetail.route.js';
import databasesRoutes from './databases.route.js';
import shiftPegawaiRoutes from './relational/shiftPegawai.route.js';
import logRawAbsensiRoutes from './transactional/logRawAbsensi.route.js'; 
import hariLiburRoutes from './master/hariLibur.route.js';
import lokasiKerjaPegawaiRoutes from './relational/lokasiKerjaPegawai.route.js';
import shiftHarianPegawaiRoutes from './transactional/shiftHarianPegawai.route.js';
import absensiHarianRoutes from './transactional/absensiHarian.route.js';
import realisasiLemburRoutes from './laporan/realisasiLembur.route.js';

const router = Router();

// Mount lokasi kerja routes
router.use("/databases", databasesRoutes);
router.use('/lokasi-kerja', lokasiKerjaRoutes); 
router.use('/kebijakan-absensi', kebijakanAbsensiRoutes);
router.use('/shift-group', shiftGroupRoutes);
router.use('/shift-kerja', shiftKerjaRoutes); 
router.use('/shift-group-detail', shiftGroupDetailRoutes); 
router.use('/shift-pegawai', shiftPegawaiRoutes);
router.use('/log-raw-absensi', logRawAbsensiRoutes); 
router.use("/hari-libur", hariLiburRoutes);
router.use("/lokasi-kerja-pegawai", lokasiKerjaPegawaiRoutes);
router.use("/shift-harian-pegawai", shiftHarianPegawaiRoutes);
router.use("/absensi-harian", absensiHarianRoutes);
router.use("/realisasi-lembur", realisasiLemburRoutes);

// Error handler middleware (harus di akhir) 

export default router;