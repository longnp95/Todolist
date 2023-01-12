const db = require('./db.service');

async function validated(userid, password) {
    const result = await db.query(
        `SELECT * FROM usersData WHERE userid = ? AND password = ?`,
        [userid, password]
    );
    if (result&&result.length) return true;
    return false;
}

async function existed(username){
    const result = await db.query(
        `SELECT * FROM usersData WHERE username = ?`,
        username
    );
    if (result&&result.length) return true;
    return false;
}

async function get(username, password) {
    const result = await db.query(
        `SELECT userid, fullname, username FROM usersData WHERE username = ? AND password = ?`,
        [username, password]
    );
    if (result&&result.length) return {
        found : true,
        data : result[0]
    };
    return {
        found : false,
        data : result[0]
    };
}

async function add(fullname, username, password) {
    const result = await db.query(
        `INSERT INTO usersData (fullname, username, password) VALUES (?, ?, ?)`,
        [fullname, username, password]
    );
    console.log(result);
    return result;
}

module.exports = {
    validated,
    existed,
    get,
    add,
}