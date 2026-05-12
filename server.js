const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const DB = require('./utils/db');
const { scrapeLinkedInJobs } = require('./utils/scraper');
const { sendEmails } = require('./utils/mailer');

const app = express();

// Folders
['./public/uploads', './public/results'].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Allows parsing JSON from frontend
app.use(session({ secret: 'college_api_secret', resave: false, saveUninitialized: false }));

const upload = multer({ dest: 'public/uploads/' });

// Check if logged in
const requireAuth = (req, res, next) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
    next();
};

// --- AUTHENTICATION APIs ---
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, appPassword, linkedin } = req.body;
        if (DB.findUser(email)) return res.status(400).json({ error: "Email exists" });
        await DB.createUser({ email, password, appPassword, linkedin });
        res.json({ message: "Registered successfully" });
    } catch (e) { 
        // THIS LINE WILL PRINT THE REAL ERROR IN YOUR TERMINAL
        console.error("REGISTRATION CRASH DETAILS:", e); 
        res.status(500).json({ error: "Server error" }); 
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = DB.findUser(email);
    if (user && await DB.matchPassword(password, user.password)) {
        req.session.userId = user.id;
        req.session.userEmail = user.email;
        req.session.appPassword = user.appPassword;
        req.session.userLinkedIn = user.linkedin; 
        res.json({ message: "Logged in", email: user.email });
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: "Logged out" });
});

app.get('/api/me', (req, res) => {
    if (req.session.userId) res.json({ loggedIn: true, email: req.session.userEmail });
    else res.json({ loggedIn: false });
});

// --- AUTOMATION APIs ---
app.post('/api/automate', requireAuth, upload.single('resume'), async (req, res) => {
    
    // THIS IS THE LINE THAT WAS MISSING! 👇
    const { keyword, location } = req.body; 
    
    const resumePath = req.file ? req.file.path : null;
    if (!resumePath) return res.status(400).json({ error: "Resume required" });

    try {
        console.log(`Starting search for: ${keyword} in ${location}...`);
        
        // 1. Scrape Jobs
        const jobs = await scrapeLinkedInJobs(keyword, location);
        
        // 2. Send Emails
        const emailResults = await sendEmails(jobs, resumePath, req.session.userEmail, req.session.appPassword, req.session.userLinkedIn);
        
        // 3. Save to history
        DB.saveHistory(req.session.userId, jobs);

        res.json({ jobs, emailResults });
    } catch (error) {
        console.error("🚨 AUTOMATION CRASH DETAILS:", error);
        res.status(500).json({ error: "Automation failed" });
    }
});

app.get('/api/history', requireAuth, (req, res) => {
    const history = DB.getHistory(req.session.userId);
    res.json(history);
});

app.listen(3000, () => console.log(`API Server running at http://localhost:3000`));