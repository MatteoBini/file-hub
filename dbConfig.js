const mysql = require(`mysql2`);

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "abcd",
    database: "file_hub"
});

module.exports = { pool };
