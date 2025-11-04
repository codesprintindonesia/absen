import { getSequelize } from './databaseInstance.library.js';

/**
 * Transaction Library untuk Bank Sultra
 * Mengelola database transaction lifecycle
 */

/**
 * Create new database transaction
 * @param {Object} options - Transaction options
 * @returns {Promise<Transaction>} Sequelize transaction instance
 */
export const createTransaction = async (options = {}) => {
  const sequelize = await getSequelize();
  
  return await sequelize.transaction({
    isolationLevel: options.isolationLevel || null,
    type: options.type || null,
    logging: options.logging || false,
    ...options
  });
};

/**
 * Commit transaction
 * @param {Transaction} transaction - Sequelize transaction instance
 * @returns {Promise<void>}
 */
export const commitTransaction = async (transaction) => {
  if (!transaction) {
    throw new Error('Transaction instance is required');
  }
  
  await transaction.commit();
};

/**
 * Rollback transaction
 * @param {Transaction} transaction - Sequelize transaction instance  
 * @returns {Promise<void>}
 */
export const rollbackTransaction = async (transaction) => {
  if (!transaction) {
    throw new Error('Transaction instance is required');
  }
  
  await transaction.rollback();
};

/**
 * Check if transaction is still active
 * @param {Transaction} transaction - Sequelize transaction instance
 * @returns {boolean} True if transaction is active
 */
export const isTransactionActive = (transaction) => {
  return transaction && !transaction.finished;
};

/**
 * Execute function with auto-managed transaction (untuk backward compatibility)
 * @param {Function} callback - Function to execute within transaction
 * @param {Object} options - Transaction options
 * @returns {Promise<any>} Result from callback function
 */
export const withManagedTransaction = async (callback, options = {}) => {
  const transaction = await createTransaction(options);
  
  try {
    const result = await callback(transaction);
    await commitTransaction(transaction);
    return result;
  } catch (error) {
    await rollbackTransaction(transaction);
    throw error;
  }
};

/**
 * Get transaction info for debugging
 * @param {Transaction} transaction - Sequelize transaction instance
 * @returns {Object} Transaction information
 */
export const getTransactionInfo = (transaction) => {
  if (!transaction) {
    return { status: 'no_transaction' };
  }
  
  return {
    id: transaction.id,
    finished: transaction.finished,
    parent: transaction.parent ? transaction.parent.id : null,
    options: transaction.options
  };
};