// src/libraries/databaseInstance.library.js
import Database from './databaseConnection.library.js';

// Private state variables
let database = null;
let sequelizeInstance = null;
let connectionPromise = null;

/**
 * Private function untuk membuat koneksi
 */
const createConnection = async () => {
  try {
    if (!database) {
      database = new Database();
    }

    const profile = process.env.DATABASE || 'development';
    await database.connect(profile);
    sequelizeInstance = database.getConnection();
     
    return sequelizeInstance;

  } catch (error) {
    sequelizeInstance = null;
    connectionPromise = null;
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

/**
 * Get Sequelize instance dengan lazy loading
 */
const getSequelizeInstance = async () => {
  if (sequelizeInstance) {
    return sequelizeInstance;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = createConnection();
  return connectionPromise;
};

/**
 * Close database connection
 */
const closeConnection = async () => {
  if (database) {
    await database.close();
    sequelizeInstance = null;
    connectionPromise = null;
    database = null;
  }
};

// Export functions
const getSequelize = () => getSequelizeInstance();
const dbManager = { closeConnection };

export { getSequelize, dbManager };
export default getSequelize;