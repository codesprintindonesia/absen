// ================================================================
// src/services/master/kebijakanAbsensi/create.service.js
// Service untuk create kebijakan absensi DENGAN AUDIT LOG
// ================================================================

import { getSequelize } from "../../../libraries/databaseInstance.library.js";
import createRepository from "../../../repositories/master/kebijakanAbsensi/create.repository.js";
import { generateMasterId, ID_PREFIX } from "../../../utils/idGenerator.util.js";
import { auditLog, AUDIT_ACTION } from "../../../utils/audit.util.js";

/**
 * Business logic untuk create kebijakan absensi dengan audit log
 * @param {Object} data - Data kebijakan absensi baru (sudah tervalidasi oleh Joi middleware)
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @returns {Promise<Object>} Kebijakan absensi yang dibuat
 */
const createService = async (data, { req } = {}) => {
  const sequelize = await getSequelize();
  let transaction;

  try {
    transaction = await sequelize.transaction();

    // Generate ID otomatis dengan format KEB-NNN
    const generatedId = generateMasterId(ID_PREFIX.KEBIJAKAN_ABSENSI);

    const policyData = {
      ...data,
      id: generatedId, // Auto-generated ID
    };

    // Create via repository
    const policy = await createRepository(policyData, { transaction });

    // Log audit INSERT
    await auditLog({
      action: AUDIT_ACTION.CREATE,
      tableName: "master.m_kebijakan_absensi",
      refId: policy.id,
      beforeData: null,
      afterData: policy,
      req,
      transaction,
    });

    await transaction.commit();
    return policy;
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
};

export default createService;
