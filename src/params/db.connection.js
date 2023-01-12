const mysql = require('mysql');
const dbConfig = require('../configs/db.config').default;

module.exports = mysql.createConnection(dbConfig);