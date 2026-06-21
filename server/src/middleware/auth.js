const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-me';

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      institution_id: user.institution_id,
      role: user.role,
      full_name: user.full_name,
      preferred_language: user.preferred_language,
    },
    SECRET,
    { expiresIn: '12h' }
  );
}

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing authentication token' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (req.user.role === 'SuperAdmin') return next(); // super admin bypasses role checks
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions for this action' });
    }
    next();
  };
}

// Ensures a non-SuperAdmin user only ever touches data scoped to their own institution.
function scopeToInstitution(req, res, next) {
  if (req.user.role === 'SuperAdmin') return next();
  if (req.query.institution_id && req.query.institution_id !== req.user.institution_id) {
    return res.status(403).json({ error: 'Cannot access another institution\'s data' });
  }
  req.query.institution_id = req.user.institution_id;
  if (req.body && typeof req.body === 'object') {
    req.body.institution_id = req.user.institution_id;
  }
  next();
}

module.exports = { signToken, authenticate, authorize, scopeToInstitution, SECRET };
