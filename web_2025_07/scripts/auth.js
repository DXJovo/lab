const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const db = new sqlite3.Database(path.join(__dirname, 'database.db'));

// 临时存储验证码
const verificationCodes = new Map();
const resetTokens = new Map();

// 发送验证码路由
router.post('/send-verification-code', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: '邮箱不能为空' });
    }

    // 生成6位随机验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes.set(email, {
        code,
        expires: Date.now() + 5 * 60 * 1000 // 5分钟后过期
    });

    // 实际项目中这里应该发送邮件，这里只是模拟
    console.log(`验证码发送到 ${email}: ${code}`);
    
    res.json({ message: '验证码已发送' });
});

// 注册路由
router.post('/register', async (req, res) => {
    const { username, email, verificationCode, password, accountType } = req.body;
    
    try {
        // 检查验证码
        const storedCode = verificationCodes.get(email);
        if (!storedCode || storedCode.code !== verificationCode) {
            return res.status(400).json({ message: '验证码错误' });
        }
        if (storedCode.expires < Date.now()) {
            return res.status(400).json({ message: '验证码已过期' });
        }

        // 检查用户名是否已存在
        db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], async (err, row) => {
            if (err) {
                return res.status(500).json({ message: '数据库错误' });
            }
            
            if (row) {
                if (row.username === username) {
                    return res.status(400).json({ message: '用户名已存在' });
                } else {
                    return res.status(400).json({ message: '邮箱已注册' });
                }
            }
            
            // 加密密码
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // 插入新用户
            db.run(
                'INSERT INTO users (username, email, password, account_type) VALUES (?, ?, ?, ?)',
                [username, email, hashedPassword, accountType],
                function(err) {
                    if (err) {
                        return res.status(500).json({ message: '注册失败' });
                    }
                    // 注册成功后移除验证码
                    verificationCodes.delete(email);
                    res.status(201).json({ message: '注册成功' });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 登录路由
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // 查找用户
        db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
            if (err) {
                return res.status(500).json({ message: '数据库错误' });
            }
            
            if (!user) {
                return res.status(401).json({ message: '用户名或密码错误' });
            }
            
            // 验证密码
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: '用户名或密码错误' });
            }
            
            // 生成JWT
            const token = jwt.sign(
                { id: user.id, username: user.username, accountType: user.account_type },
                process.env.SECRET_KEY || 'your-secret-key-here',
                { expiresIn: '1h' }
            );
            
            res.json({ 
                message: '登录成功',
                token,
                accountType: user.account_type 
            });
        });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 发送密码重置链接
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: '邮箱不能为空' });
        }

        // 检查邮箱是否注册
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!user) {
            return res.status(404).json({ message: '该邮箱未注册' });
        }

        // 生成重置token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.SECRET_KEY || 'your-secret-key-here',
            { expiresIn: '15m' }
        );
        
        resetTokens.set(email, {
            token,
            expires: Date.now() + 15 * 60 * 1000 // 15分钟后过期
        });

        // 配置邮件发送
        const sendResetEmail = async () => {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'your-email@gmail.com', // 替换为实际邮箱
                    pass: 'your-email-password'  // 替换为实际密码或应用专用密码
                }
            });

            const mailOptions = {
                from: 'your-email@gmail.com',
                to: email,
                subject: '密码重置链接',
                text: `请点击以下链接重置密码: http://localhost:3000/reset-password?token=${token} (15分钟内有效)`
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log('密码重置邮件已发送');
                return true;
            } catch (error) {
                console.error('邮件发送失败:', error);
                return false;
            }
        };

        const emailSent = await sendResetEmail();
        if (!emailSent) {
            return res.status(500).json({ message: '邮件发送失败' });
        }
        
        res.json({ message: '密码重置链接已发送到您的邮箱' });
    } catch (error) {
        console.error('密码重置请求处理失败:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 重置密码
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    
    try {
        // 验证token
        const decoded = jwt.verify(token, process.env.SECRET_KEY || 'your-secret-key-here');
        
        // 检查token是否有效
        const storedToken = resetTokens.get(decoded.email);
        if (!storedToken || storedToken.token !== token) {
            return res.status(400).json({ message: '无效的token' });
        }
        if (storedToken.expires < Date.now()) {
            return res.status(400).json({ message: 'token已过期' });
        }

        // 更新密码
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        db.run(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, decoded.email],
            function(err) {
                if (err) {
                    return res.status(500).json({ message: '密码重置失败' });
                }
                // 重置成功后移除token
                resetTokens.delete(decoded.email);
                res.json({ message: '密码重置成功' });
            }
        );
    } catch (error) {
        res.status(400).json({ message: '无效的token' });
    }
});

module.exports = router;
