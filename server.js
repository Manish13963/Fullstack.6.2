// server.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Hardcoded user for demonstration
const user = {
    username: 'user1',
    password: 'password123',
    balance: 1000
};

// Secret key for JWT signing
const SECRET_KEY = 'mybanksecret';

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(401).json({ message: 'Token missing' });

    jwt.verify(token, SECRET_KEY, (err, userData) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = userData;
        next();
    });
}

// Login route to generate JWT
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username !== user.username || password !== user.password) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

// Protected route to view balance
app.get('/balance', authenticateToken, (req, res) => {
    res.json({ balance: user.balance });
});

// Protected route to deposit money
app.post('/deposit', authenticateToken, (req, res) => {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid amount' });
    }
    user.balance += amount;
    res.json({ message: `Deposited $${amount}`, balance: user.balance });
});

// Protected route to withdraw money
app.post('/withdraw', authenticateToken, (req, res) => {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid amount' });
    }
    if (amount > user.balance) {
        return res.status(400).json({ message: 'Insufficient balance' });
    }
    user.balance -= amount;
    res.json({ message: `Withdrew $${amount}`, balance: user.balance });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Banking API running on http://localhost:${PORT}`);
});
