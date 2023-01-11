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
    'CREATE TABLE IF NOT EXISTS usersData (fullname varchar(255), username varchar(255) primary key, password varchar(255));',
    function (err, result) {
        if (err) throw err;
        console.log("Users Data Initialized");
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
                    const tableName = 'tasks_'+username;
                    con.query(
                        `CREATE TABLE IF NOT EXISTS ${tableName} (id INT AUTO_INCREMENT PRIMARY KEY, content VARCHAR(1023), done BOOLEAN);`,
                        function (err,result) {
                            if (err) throw err;
                            console.log(`${username}'s to-do table initialized.`);
                        }
                    );
                    res.end('LoggedIn');
                } else {
                    res.end('NotAuth');
                }
            }
        }
    );    
});

app.post("/addtask", (req,res) => {
    const username = req.body.username.toLowerCase();
    const password = req.body.password;
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

app.post("/removetask", (req,res) => {
    const username = req.body.username.toLowerCase();
    const password = req.body.password;
    const id = req.body.id;
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
                        `DELETE FROM ${tableName} WHERE id = ${id}`,
                        function (err,result) {
                            if (err) throw err;
                            console.log(`Removed task id ${id}`);
                        }
                    );
                    res.end('Removed');
                } else {
                    res.end('NotAuth');
                }
            }
        }
    );    
});

app.listen("5555", () => {
    console.log("Server started on port 5555");
});