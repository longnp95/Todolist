const mysql = require('mysql');
const dbConnection = require ('../params/db.connection');

async function query(sql, params) {
    const [results, ] = await dbConnection.execute(sql, params);
  
    return results;
}
  
module.exports = {
    query
}