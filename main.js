const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const authentication = require('./middleware/authentication.js');
const cookieParser = require('cookie-parser');

const app = express();

app.set('view engine' ,  'ejs');
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static('public'));

const connection = mysql.createConnection({
    host: "localhost" , 
    user: "root" , 
    password: "1234" , 
    database: "mekdemschoolportal"
});

connection.connect(
    function(err){
        if (err) console.log(err);
        else  
        {
            app.listen(5000 , ()=>console.log("server running on port 5000"));
            console.log("database connected successfully");
        }
    }
);

//ROUTES AND CONTROLLERS

//login 
app.get('/login' , (req , res)=> {
    res.render('login' , {error: false });
});

app.post('/login' , (req , res) => { 
     let sql = `select * from student where studentId = "${req.body.username}" and password = "${req.body.password}"  `;
     connection.query(sql , (error , result) => {
      if (result !==undefined && result.length > 0 ) {
          const token = jwt.sign({
              StudentID : result[0].StudentID , 
              FullName: result[0].FullName
            },
            'SECRETKEY', {
              expiresIn: '7d'
            });
            
            res.cookie('jwt' , token , {httpOnly:true , maxAge:3600*1000});
            res.redirect('/home')
    
      } else {
          res.render('login' , {error:true });
       }
   });
});

app.get('/home' , authentication.isStudentLoggedIn ,(req , res)=> {
    console.log(req.userData);
    res.render('home' , { student: req.userData });
});



//council  - 
app.get('/council' , authentication.isStudentLoggedIn ,(req , res)=> {
    //req.userData.StudentID   holds the current logged in student id which is a string
    //req.userData.FullName    holds the current logged in student full name
    let sql =  `select * from council`;
    connection.query(sql , (error , result) => {
        if (result !==undefined && result.length > 0 ) {
        res.render('council' , {council: result})
        }
        else 
        {
            res.render('council' , {council:0});
        }
     });
});

//clearance 
app.get('/clearance',authentication.isStudentLoggedIn,(req,res)=>{
     res.render('clearance.ejs',{error: false});
   //let sql = `select * from student where studentId = ${req.userData.StudentID} `;
    
});
app.post('/clearance',authentication.isStudentLoggedIn,(req,res)=> {
    let fname = req.body.fname;
    let mname = req.body.mname;
    let lname = req.body.lname;
    let date  = req.body.date;
     let id = req.body.id;
     let sex= req.body.sex;
     let cyear= req.body.cyear;
    let rfc= req.body.rfc;
    let myfile= req.body.myfile;
    let sql = `INSERT INTO clearance VALUES ('${fname}', '${mname}', '${lname}', '${date}', '${id}', '${sex}', '${cyear}', '${rfc}', '${myfile}')`;
    connection.query(sql , (error , result) => {
        if(!error){
            console.log(result);
            res.render('clearance.ejs',{msg: false});
        }
        else{
            console.log(error.message);
            res.render('clearance.ejs' ,{msg: true});
        }
        //  res.redirect("/home");
    });
});
// transferRequest

app.get('/intraTransferReq',authentication.isStudentLoggedIn,(req,res)=>{
    res.render('intraTransferReq.ejs',{error: false});
  let sql = `select * from student where studentId = ${req.userData.StudentID}`;
});
app.post('/intraTransferReq',authentication.isStudentLoggedIn,(req,res)=>{
    let fname = req.body.fname;
    let mname = req.body.mname;
    let lname = req.body.lname;
    let id    = req.userData.StudentID;
    let date  = req.body.date;
    let sex   = req.body.sex;
    let egy   = req.body.egy;
    let cgpa  = req.body.cgpa;
    let depto = req.body.depto;
    let deptfrom = req.body.deptfrom;
    let sql = `INSERT INTO transferrequest VALUES ('${id}', '${fname}', '${mname}', '${lname}', '${date}', '${sex}', '${egy}', '${cgpa}', '${depto}' , '${deptfrom}')`;
   connection.query(sql , (error , result) => {
       if(!error){
           console.log(result);
           res.render('intraTransferReq.ejs',{msg: false});
       }
       else{
           console.log(error.message);
           res.render('intraTransferReq.ejs' ,{msg: true});
       }
//    res.redirect("/home");
});
});
