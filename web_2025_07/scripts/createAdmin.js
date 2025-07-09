const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database(path.join(__dirname, 'database.db'));

async function createAdmin() {
    const username = 'dxj';
    const password = '666666';
    const accountType = 'admin';
    
    try {
        // 检查用户是否已存在
        db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
            if (err) throw err;
            
            if (row) {
                console.log('管理员账户已存在');
                process.exit(0);
            }
            
            // 加密密码
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // 插入管理员账户
            db.run(
                'INSERT INTO users (username, password, account_type) VALUES (?, ?, ?)',
                [username, hashedPassword, accountType],
                function(err) {
                    if (err) throw err;
                    console.log('管理员账户创建成功');
                    process.exit(0);
                }
            );
        });
    } catch (error) {
        console.error('创建管理员账户失败:', error);
        process.exit(1);
    }
}

createAdmin();
