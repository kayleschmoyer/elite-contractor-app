// backend/src/config/index.js
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5001,
    // Add other configurations like database URL, JWT secret, etc.
    // databaseUrl: process.env.DATABASE_URL,
};

export default config;