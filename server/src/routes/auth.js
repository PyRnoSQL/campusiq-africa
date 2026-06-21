const express = require('express');
const bcrypt = require('bcryptjs');
const { findAll, updateRow } = require('../services/sheetsService');
const { signToken, authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const users = await findAll('Users', { email });
    const user = users[0];
    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash || '');
    if (!validPassword) return res.status(401).json({ error: 'Invalid email or password' });

    await updateRow('Users', user.id, { last_login: new Date().toISOString() });

    const token = signToken(user);
    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
