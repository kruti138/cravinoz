import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

router.post('/register',
  body('name').isString().notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, phone } = req.body;
    try {
      let user = await prisma.user.findUnique({ where: { email } });
      const hashed = await bcrypt.hash(password, 10);

      if (user) return res.status(400).json({ message: 'Email already in use' });

      user = await prisma.user.create({
        data: { name, email, password: hashed, phone, role: 'USER', addresses: '[]' }
      });

      // create verification code and send email
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const codeHash = await bcrypt.hash(code, 10);
      const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes
      await prisma.emailVerification.upsert({
        where: { email },
        update: { codeHash, expiresAt },
        create: { email, codeHash, expiresAt }
      });

      // send email (best-effort)
      try {
        const { sendVerificationEmail } = await import('../utils/mailer');
        await sendVerificationEmail(email, name, code);
      } catch (mailErr) {
        console.error('Failed to send verification email', mailErr);
      }

      res.json({ message: 'Verification code sent' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Verify code
router.post('/verify',
  body('email').isEmail(),
  body('code').isLength({ min: 6, max: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, code } = req.body;
    try {
      const v = await prisma.emailVerification.findUnique({ where: { email } });
      if (!v) return res.status(400).json({ message: 'No verification code found. Please request a new code.' });
      if (v.expiresAt && new Date(v.expiresAt) < new Date()) return res.status(400).json({ message: 'Code expired. Please request a new code.' });
      const match = await bcrypt.compare(code, v.codeHash);
      if (!match) return res.status(400).json({ message: 'Invalid code' });

      // mark user as verified
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(400).json({ message: 'User not found' });
      await prisma.user.update({ where: { email }, data: { verified: true, updatedAt: new Date() } });
      await prisma.emailVerification.delete({ where: { email } });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Resend code
router.post('/resend',
  body('email').isEmail(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email } = req.body;
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(400).json({ message: 'User not found' });

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const codeHash = await bcrypt.hash(code, 10);
      const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes
      await prisma.emailVerification.upsert({
        where: { email },
        update: { codeHash, expiresAt },
        create: { email, codeHash, expiresAt }
      });

      try {
        const { sendVerificationEmail } = await import('../utils/mailer');
        await sendVerificationEmail(email, user.name, code);
      } catch (mailErr) {
        console.error('Failed to send verification email', mailErr);
      }

      res.json({ message: 'Verification code resent' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.post('/login',
  body('email').isEmail(),
  body('password').isString().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });
      if (!user.verified) return res.status(403).json({ message: 'Email not verified' });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ message: 'Invalid credentials' });
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Admin login helper: returns token only if role is ADMIN
router.post('/admin/login',
  body('email').isEmail(),
  body('password').isString().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });
      if (user.role !== 'ADMIN') return res.status(403).json({ message: 'Not an admin' });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ message: 'Invalid credentials' });
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;
