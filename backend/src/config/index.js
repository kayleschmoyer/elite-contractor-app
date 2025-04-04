// backend/src/config/index.js
import dotenv from 'dotenv';

dotenv.config();

const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5001,
    databaseUrl: process.env.DATABASE_URL, // Keep existing DB URL
    // --- Add JWT Config ---
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '1d', // Default to 1 day if not set
    },
};

// Simple validation to ensure critical env vars are set
if (!config.databaseUrl) {
  console.error("FATAL ERROR: DATABASE_URL is not defined in .env");
  process.exit(1);
}
if (!config.jwt.secret) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in .env");
  process.exit(1);
}


export default config;