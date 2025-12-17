const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Ambil token dari header Authorization
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret'); 
        req.user = decoded; // Ini penting! Biar controller bisa baca req.user.id
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};