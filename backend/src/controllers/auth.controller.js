// backend/src/controllers/auth.controller.js
import AuthService from '../services/auth.service.js';

const register = async (req, res, next) => {
    try {
        // Basic validation (use a library like Joi or Zod for robust validation)
        const { email, password, name } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }
        // Add password complexity checks here if desired

        const user = await AuthService.registerUser({ email, password, name });
        // Send back user info (excluding password) on successful registration
        res.status(201).json(user);
    } catch (error) {
         // Handle specific errors from the service
         if (error.message === 'Email already in use.') {
             return res.status(409).json({ message: error.message }); // 409 Conflict
         }
        // Pass other errors to the global error handler
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const token = await AuthService.loginUser({ email, password });
        // Send the token back to the client on successful login
        res.status(200).json({ accessToken: token });

    } catch (error) {
         // Handle specific errors from the service
        if (error.message === 'Invalid email or password.') {
             return res.status(401).json({ message: error.message }); // 401 Unauthorized
        }
        next(error);
    }
};

const AuthController = {
    register,
    login,
};

export default AuthController;