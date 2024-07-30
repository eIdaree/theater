const sql = require('mssql');

const config = {
    user: 'kuralay',
    password: 'kura123',
    server: 'localhost',
    database: 'theater',
    options: {
        trustServerCertificate: true
    }
};

async function connectDB() {
    try {
        const pool = await sql.connect(config);
        return pool;
    } catch (err) {
        console.error('Ошибка подключения к базе данных:', err);
        throw err; 
    }
}

module.exports = { sql, connectDB };


module.exports = { sql, connectDB };
