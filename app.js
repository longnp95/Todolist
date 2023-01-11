const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const app = express();
app.use("/",router);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1111"
});

con.connect(function(err) {
  if (err) throw err;
  const abc = 'abcdef'
  console.log(`Connected!${abc}`);
  con.query(
    'CREATE DATABASE IF NOT EXISTS Todolist',
    function (err) {
        if (err) throw err;
        console.log("Database Initialized");
    }
  );

  con.query(
    'USE Todolist',
    function (err, result) {
        if (err) throw err;
        console.log("Database selected");
    }
  );

  con.query(
    'CREATE TABLE IF NOT EXISTS usersData (userid INT AUTO_INCREMENT PRIMARY KEY, fullname varchar(255), username varchar(255), password varchar(255));',
    function (err) {
        if (err) throw err;
        console.log("Users Data Initialized");
    }
  );
  con.query(
    `CREATE TABLE IF NOT EXISTS tasksData (id INT AUTO_INCREMENT PRIMARY KEY, userid INT, content VARCHAR(1023), done BOOLEAN);`,
    function (err) {
        if (err) throw err;
        console.log('Tasks table initialized.');
    }
);
});

app.use(express.static(__dirname));

router.get('/',(req, res) => {
    res.sendFile(__dirname+'/index.html');
});

app.post("/register", (req,res) => {
    console.log(req.body.fullname);
    const fullname = req.body.fullname;
    const username = req.body.username.toLowerCase();
    const password = req.body.password;
    res.writeHead(200,
        { 'Content-Type': 'text/plain' });
    con.query(
        `SELECT * FROM usersData WHERE username = "${username}"`,
        function (err, result){
            if (err) {
                console.log(err);
                return;
            } else {
                if (result && result.length) {
                    console.log(result);
                    res.end('UserExisted');
                } else {
                    con.query(
                        "INSERT INTO usersData (fullname, username, password) VALUES " +
                        `('${fullname}', '${username}', '${password}');`,
                        function (err) {
                            if (err) throw err;
                        }
                    );
                    res.end('UserCreated');
                }
            }
        }
    );
});

app.post("/login", (req,res) => {
    const username = req.body.username.toLowerCase();
    const password = req.body.password;
    res.writeHead(200,
        { 'Content-Type': 'text/plain' });
    con.query(
        `SELECT * FROM usersData WHERE username = '${username}' AND password = '${password}'`,
        function (err, result){
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                if (result && result.length) {
                    res.end('LoggedIn');
                } else {
                    res.end('NotAuth');
                }
            }
        }
    );    
});

app.post("/getuserid", (req,res) => {
    const username = req.body.username.toLowerCase();
    const password = req.body.password;
    res.writeHead(200,
        { 'Content-Type': 'text/plain' });
    con.query(
        `SELECT * FROM usersData WHERE username = '${username}' AND password = '${password}'`,
        function (err, result){
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                if (result && result.length) {
                    res.end(`${result[0].userid}`);
                } else {
                    res.end('NotAuth');
                }
            }
        }
    );    
});

app.post("/readtasks", (req,res) => {
    const userId = req.body.userid;
    const password = req.body.password;
    console.log(userId);
    res.writeHead(200,
        { 'Content-Type': 'application/json' });
    con.query(
        `SELECT * FROM usersData WHERE userid = ${userId} AND password = '${password}'`,
        function (err, result){
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                if (result && result.length) {
                    con.query(
                        `SELECT * FROM tasksData WHERE userid = '${userId}';`,
                        function (err,tasks) {
                            if (err) {
                                console.log(err);
                                res.end();
                            } else {
                                console.log(`Served tasks for userId ${userId} from table tasksData`);
                                res.end(JSON.stringify(tasks));
                            }
                        }
                    );
                } else {
                    console.log('NotAuth')
                    res.end();
                }
            }
        }
    );    
});

app.post("/addtask", (req,res) => {
    const userid = req.body.userid.toLowerCase();
    const password = req.body.password;
    const content = req.body.content;
    res.writeHead(200,
        { 'Content-Type': 'text/plain' });
    con.query(
        `SELECT * FROM usersData WHERE userid = '${userid}' AND password = '${password}'`,
        function (err, result){
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                if (result && result.length) {
                    con.query(
                        `INSERT INTO tasksData (userid, content, done) VALUES `+
                        `('${userid}', '${content}', false)`,
                        function (err,result) {
                            if (err) throw err;
                            console.log(`${content} added to To-do list`);
                        }
                    );
                    res.end('Added');
                } else {
                    res.end('NotAuth');
                }
            }
        }
    );    
});

/* app.post("/edittask", (req,res) => {
    const username = req.body.username.toLowerCase();
    const password = req.body.password;
    const id = req.body.id;
    const content = req.body.content;
    res.writeHead(200,
        { 'Content-Type': 'text/plain' });
    con.query(
        `SELECT * FROM usersData WHERE username = '${username}' AND password = '${password}'`,
        function (err, result){
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                if (result && result.length) {
                    const tableName = 'tasks_'+username;
                    con.query(
                        `INSERT INTO ${tableName} (content, done) VALUES `+
                        `('${content}', false)`,
                        function (err,result) {
                            if (err) throw err;
                            console.log(`${content} added to To-do list`);
                        }
                    );
                    res.end('Added');
                } else {
                    res.end('NotAuth');
                }
            }
        }
    );    
});
 */
app.post("/removetask", (req,res) => {
    const userid = req.body.userid.toLowerCase();
    const password = req.body.password;
    const id = JSON.parse(req.body.id);
    console.log(id);
    res.writeHead(200,
        { 'Content-Type': 'text/plain' });
    con.query(
        `SELECT * FROM usersData WHERE userid = '${userid}' AND password = '${password}'`,
        function (err, result){
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                if (result && result.length) {
                    if (Array.isArray(id)) {
                        id.forEach(i => deleteById(userid,`'${i}'`));
                    } else {
                        if (id=='all') {
                            con.query(
                                `DELETE FROM tasksData WHERE userid = '${userid}'`,
                                function (err) {
                                    if (err) throw err;
                                    console.log(`Removed all task, user: ${userid}`);
                                }
                            );                            
                        } else {
                            deleteById(userid,id);
                        }
                    }
                    res.end('Removed');
                } else {
                    res.end('NotAuth');
                }
            }
        }
    );    
});

function deleteById(userid, id) {
    con.query(
        `DELETE FROM tasksData WHERE userid = '${userid}' AND id = ${id}`,
        function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log(`Removed task id ${id}`);
            }
        }
    );
}

app.listen("5555", () => {
    console.log("Server started on port 5555");
});