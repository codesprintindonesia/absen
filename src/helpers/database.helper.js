/**
 * Database helper functions
 * File: src/helpers/database.helper.js
 */

import { getSequelize } from "../../libraries/databaseInstance.library.js";

/**
 * Execute raw SQL query
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
export const executeQuery = async (query, params = []) => {
  const sequelize = await getSequelize();
  
  const [results] = await sequelize.query(query, {
    replacements: params,
    type: sequelize.QueryTypes.SELECT,
  });

  return results;
};