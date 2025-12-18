require('dotenv').config();
const db = require('./config/db');

async function migrate() {
    try {
        const [rows] = await db.query("SHOW COLUMNS FROM users LIKE 'profile_picture'");
        if (rows.length === 0) {
            await db.query("ALTER TABLE users ADD COLUMN profile_picture VARCHAR(255) DEFAULT NULL");
            console.log("✅ Column 'profile_picture' added successfully.");
        } else {
            console.log("ℹ️ Column 'profile_picture' already exists.");
        }
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
}

migrate();
