const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header is missing', success: false });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token is missing', success: false });
        }

        const secretKey = process.env.JWT_KEY || process.env.JWT_SECRET || 'supersecuresecretkeyshouldbechangedinproduction';
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Authorization failed: invalid token', success: false });
            } else {
                req.body = req.body || {};
                req.body.userId = decoded.id;
                next();
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
};

module.exports = authMiddleware;
