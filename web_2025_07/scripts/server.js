const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your-secret-key-here';

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../main.html'));
});

// 数据库连接
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('数据库连接失败:', err.message);
    } else {
        console.log('成功连接到SQLite数据库');
        initializeDatabase();
    }
});

// 初始化数据库
function initializeDatabase() {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        account_type TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
}

// 认证路由
const authRoutes = require('./auth');
app.use('/api', authRoutes);

// 启动服务器
function startServer(port) {
    const server = app.listen(port, 'localhost', () => {
        console.log(`服务器运行在 http://localhost:${port}`);
        console.log(`外部访问地址: http://${getLocalIP()}:${port}`);
        
        const address = server.address();
        if (address) {
            console.log(`服务器正在监听端口: ${address.port}`);
        } else {
            console.error('服务器未能成功绑定端口');
        }
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`端口 ${port} 被占用，尝试端口 ${port + 1}`);
            startServer(port + 1);
        } else {
            console.error('服务器启动失败:', err);
            process.exit(1);
        }
    });
}

startServer(PORT);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('未捕获的异常:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的Promise拒绝:', reason);
});

function getLocalIP() {
    const interfaces = require('os').networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return '0.0.0.0';
}

module.exports = app;
