const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * @desc  Admin login — returns a signed JWT on success
 * @route POST /api/auth/login
 * @access Public
 */
const adminLogin = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'PatelFoundation@2024';

    if (username !== ADMIN_USER) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Compare password (support both plain-text env and bcrypt hash)
    let passwordMatch = false;
    if (ADMIN_PASS.startsWith('$2')) {
        passwordMatch = await bcrypt.compare(password, ADMIN_PASS);
    } else {
        passwordMatch = password === ADMIN_PASS;
    }

    if (!passwordMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
        { role: 'admin', username },
        process.env.JWT_SECRET || 'patel_foundation_super_secret_jwt_key_2024',
        { expiresIn: '8h' }
    );

    return res.status(200).json({
        success: true,
        token,
        expiresIn: '8h',
    });
};

module.exports = { adminLogin };
