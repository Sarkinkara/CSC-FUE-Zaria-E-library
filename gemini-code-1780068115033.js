const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Global Security Middleware
app.use(helmet()); // Sets secure HTTP headers
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

// Rate Limiting to prevent Brute Force/DDoS
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Logging Middleware
const auditLogger = async (req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
        if (req.user) {
            pool.query(
                'INSERT INTO audit_logs (user_id, action, resource, ip_address) VALUES ($1, $2, $3, $4)',
                [req.user.id, req.method, req.originalUrl, req.ip]
            ).catch(err => console.error('Logging failed:', err));
        }
        originalSend.apply(res, arguments);
    };
    next();
};

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: 'Access denied. Token missing.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
        req.user = user;
        next();
    });
};

const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
    next();
};

---

### API Authentication Endpoints

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, role, regNumber, staffNumber } = req.body;
        
        // Input Validation
        if (!email || !password || !role) return res.status(400).json({ error: 'Missing fields' });
        if (role === 'student' && !regNumber) return res.status(400).json({ error: 'Registration number required' });
        if (role === 'admin' && !staffNumber) return res.status(400).json({ error: 'Staff number required' });

        const hashedPassword = await bcrypt.hash(password, 12);
        
        const result = await pool.query(
            'INSERT INTO users (email, password_hash, role, reg_number, staff_number) VALUES ($1, $2, $3, $4, $5) RETURNING id, role',
            [email, hashedPassword, role, regNumber || null, staffNumber || null]
        );
        
        res.status(201).json({ message: 'User registered successfully', userId: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: 'Database error or user already exists.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, identifier } = req.body; // identifier = reg_number or staff_number
        
        const userRes = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND (reg_number = $2 OR staff_number = $2)',
            [email, identifier]
        );
        
        if (userRes.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials.' });
        
        const user = userRes.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(401).json({ error: 'Invalid credentials.' });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.json({ token, role: user.role });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

---

### Content & Features Endpoints

// Get course materials grouped by level
app.get('/api/courses', authenticateToken, auditLogger, async (req, res) => {
    try {
        const materials = await pool.query(
            'SELECT cm.*, u.email as lecturer FROM course_materials cm JOIN users u ON cm.uploaded_by = u.id WHERE u.role = \'admin\''
        );
        const notices = await pool.query('SELECT * FROM tutor_notices ORDER BY created_at DESC');
        res.json({ materials: materials.rows, notices: notices.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch course view' });
    }
});

// Admin Upload endpoint
app.post('/api/admin/upload', authenticateToken, requireAdmin, auditLogger, async (req, res) => {
    const { title, courseCode, level, filePath } = req.body; // In production, combine with multer file storage
    try {
        await pool.query(
            'INSERT INTO course_materials (title, course_code, level, file_path, uploaded_by) VALUES ($1, $2, $3, $4, $5)',
            [title, courseCode, level, filePath, req.user.id]
        );
        res.status(201).json({ message: 'Resource uploaded successfully.' });
    } catch (err) {
        res.status(500).json({ error: 'Upload failed.' });
    }
});

// AI Context Simplifier
app.post('/api/ai/explain', authenticateToken, async (req, res) => {
    const { text, contextLevel } = req.body; // contextLevel could be 'lower-level' or 'beginner'
    if (!text) return res.status(400).json({ error: 'Text is required' });

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: `You are an elite Computer Science Professor. Explain the provided technical text or term in highly intuitive terms suitable for a first-year undergraduate student (${contextLevel}). Keep it concise.` },
                { role: "user", content: text }
            ],
        });
        res.json({ explanation: response.choices[0].message.content });
    } catch (err) {
        res.status(500).json({ error: 'AI processing failed' });
    }
});

// Staff Directory Endpoint
app.get('/api/staff', async (req, res) => {
    const staff = await pool.query('SELECT * FROM staff_directory ORDER BY rank DESC');
    res.json(staff.rows);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running safely on port ${PORT}`));