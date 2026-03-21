import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3307,
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
            ssl: false
        },
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        logger.info('MySQL connected via Sequelize');
    } catch (error) {
        logger.error('Database connection failed', { message: error.message, stack: error.stack });
        process.exit(1);
    }
};

export { sequelize, connectDB };
