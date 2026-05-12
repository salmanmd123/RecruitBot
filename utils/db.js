const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dataFolder = path.join(__dirname, '../data');
const usersFile = path.join(dataFolder, 'users.json');
const historyFile = path.join(dataFolder, 'history.json');

// Ensure files exist
if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder);
if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, JSON.stringify([]));
if (!fs.existsSync(historyFile)) fs.writeFileSync(historyFile, JSON.stringify([]));

const DB = {
    // User Methods
    getUsers: () => JSON.parse(fs.readFileSync(usersFile)),
    findUser: (email) => DB.getUsers().find(u => u.email === email),
    createUser: async (userData) => {
        const users = DB.getUsers();
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);
        userData.id = Date.now().toString();
        
        // Ensure the linkedin URL is saved (or default to empty if missed)
        userData.linkedin = userData.linkedin || ''; 
        
        users.push(userData);
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
        return userData;
    },
    matchPassword: async (entered, saved) => await bcrypt.compare(entered, saved),

    // History Tracker Methods (EXTRA FEATURE)
    getHistory: (userId) => {
        const allHistory = JSON.parse(fs.readFileSync(historyFile));
        return allHistory.filter(h => h.userId === userId);
    },
    saveHistory: (userId, jobs) => {
        const allHistory = JSON.parse(fs.readFileSync(historyFile));
        const newEntries = jobs.map(job => ({ ...job, userId, date: new Date().toISOString() }));
        allHistory.push(...newEntries);
        fs.writeFileSync(historyFile, JSON.stringify(allHistory, null, 2));
    }
};

module.exports = DB;