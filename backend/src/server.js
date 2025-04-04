// backend/src/server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/index.js';
import mainRouter from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';
import logger from './utils/logger.js';

// Initialize Express app
const app = express();

// --- Global Middleware ---
// Enable CORS - configure origins properly for production
app.use(cors(/* { origin: 'your_frontend_url' } */));
// Basic security headers
app.use(helmet());
// Parse JSON request bodies
app.use(express.json());
// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));
// HTTP request logging (use 'combined' for production logs)
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));

// --- API Routes ---
app.use('/api', mainRouter); // Prefix all API routes with /api

// --- Default Route (Optional Catch-all for 404s) ---
 app.use((req, res) => {
   res.status(404).json({ message: 'Not Found' });
 });

// --- Global Error Handler ---
// IMPORTANT: Must be the last middleware applied
app.use(errorHandler);


// --- Start Server ---
app.listen(config.port, () => {
    logger.info(`Server running in ${config.env} mode on port ${config.port}`);
    // Add database connection logic here later
});

export default app; // Optional: export for testing