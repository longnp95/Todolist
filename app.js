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

router.post("/signUp", (req,res) => {
    const fullname = req.body.fullname;
    const username = req.body.username.toLowerCase();
    const password = req.body.password;
    const matched = con.query(
        `EXIST (SELECT 1 FROM usersData WHERE username = ${username})`,
        function (err, result){
            if (err) throw err;
            return result;
        }
    );
    if (matched) {
        res.writeHead(200,
            { 'Content-Type': 'text/plain' });
        res.write('UserExisted');
    } else {
        con.query(
            "INSERT INTO usersData (fullname, username, password) VALUES " +
            `(${fullname}, ${username}, ${password});`,
            function (err) {
                if (err) throw err;
                console.log
            }
        );
        res.writeHead(201,
            { 'Content-Type': 'text/plain' });
        res.write("User's record created.");
    }
    res.end();
});

router.post("/signIn", (req,res) => {
    const username = req.body.username.toLowerCase();
    const password = req.body.password;
    const matched = con.query(
        `EXIST (SELECT 1 FROM usersData WHERE username = ${username} AND password = ${password})`,
        function (err, result){
            if (err) throw err;
            return result;
        }
    );
    if (!matched) {
        res.writeHead(403,
            { 'Content-Type': 'text/plain' });
        res.write('WrongPassword');
    } else {
        userData = con.query(
            `SELECT 1 FROM usersData WHERE username = ${username} AND password = ${password}`,
            function (err,result) {
                if (err) throw err;
                return result;
            }
        );
        const tableName = 'tasks'+userData.username;
        con.query(
            `CREATE TABLE IF NOT EXISTS ${tableName} (id INT AUTO_INCREMENT PRIMARY KEY, content VARCHAR(), done BOOLEAN);`,
            function (err,result) {
                if (err) throw err;
                console.log(`${username}'s to-do table initialized.`);
            }
        );
        res.writeHead(200,
            { 'Content-Type': 'text/plain' });
        res.write("LoggedIn");
    }
    res.end();
});




app.listen("5555", () => {
    console.log("Server started on port 5555");
});