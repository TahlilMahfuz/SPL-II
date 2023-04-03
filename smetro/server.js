const express=require("express");
const app = express();
const {pool} = require("./dbconfig");
const bcrypt=require("bcrypt");
const session=require("express-session");
const flash=require("express-flash");
const passport=require('passport');
const qr=require('qrcode');
const fs=require('fs');

const initializePassport=require('./passportConfig');
const sendMail = require("./controllers/sendmail");
const cookieParser = require("cookie-parser");

initializePassport(passport);

require('dotenv').config()

const port=process.env.PORT || 3001;

app.set('view engine',"ejs");
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));
app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: true,
      save:true,
      saveUninitialized: true
    })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));








//GET METHODS
app.get("/",checkIndexAuthenticated,(req,res) =>{
    // res.render('index');
    res.render('user/userlogin');
})

app.get("/user/dashboard",(req,res) =>{
    req.session.user=req.user;
    req.session.save();
    let arr=[];
    arr['username']=req.session.user.username;
    arr['userid']=req.user.userid;
    res.render('user/dashboard',{arr});
})

app.get("/user/userlogin",checkAuthenticated,(req,res) =>{
    res.render('user/userlogin');
})

app.get("/user/usersignup", (req,res) =>{
    res.render('user/usersignup');
})

app.get("/userlogout", (req, res) => {
    req.logout(req.user, err => {
      if(err) return next(err);
      req.session.destroy();
      res.redirect("/user/userlogin");
    });
});

app.get("/user/tickethistory",(req,res) =>{
    let uid=req.session.user.userid;
    pool.query(
        `SELECT *
        FROM reservation natural join trains natural join users
        WHERE userid =$1 and avaiability=1
        order by reserve_time desc`,[uid],
        (err,results)=>{
            if(err){
                throw err;
            }
            console.log("database connected");
            console.log(results.rows);

            if(results.rows.length>0){
                res.render("user/tickethistory",{results});
            }
            else{
                let no_err=[];
                no_err.push({message:"Sorry you have no previous tickets"});
                res.render("user/dashboard",{no_err});
            }
        }
    );
})












//POST METHODS

app.post("/user/usersignup",async (req,res) =>{

    let {username,usernid,useremail,userphone,userpassword,cuserpassword} = req.body;

    console.log(username,usernid,useremail,userphone,userpassword,cuserpassword);
    
    let error=[];

    if(userpassword!=cuserpassword){
        error.push({message: "Passwords do not match"});
        res.render('user/usersignup',{error});
    }
    else{
        const userotp = Math.floor(1000 + Math.random() * 9000);

        pool.query(
            `select * from users where useremail=$1`,[useremail],
            (err,results)=>{
                if(err){
                    throw err;
                }
                console.log("database connected");
                console.log(results.rows);

                if(results.rows.length>0){
                    error.push({message: "Email already exists"});
                    res.render("user/usersignup",{error});
                }
                else{
                    let message="Your otp varification code is ";
                    let subject="Verify your account";
                    sendMail(useremail,userotp,subject,message);
                    res.render('user/register',{username,usernid,useremail,userphone,userpassword,userotp});
                }
            }
        );
    }
})

app.post("/user/register",async (req,res) =>{
    let {username,usernid,useremail,userphone,userpassword,userotp,uservarcode} = req.body;
    let error=[];
    if(userotp!=uservarcode){
        error.push({message:"Invalid varification code"});
        res.render("user/register",{error});
    }
    else{
        let hash=await bcrypt.hash(userpassword,10);
        console.log(hash);
        pool.query(
            `INSERT INTO users (username,usernid,useremail,userphone,userpassword)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING username,usernid,useremail,userphone,userpassword`,
            [username,usernid,useremail,userphone,hash],
            (err, results) => {
            if (err) {
                throw err;
            }
                console.log(results.rows);
                console.log("Data inserted");
                req.flash("success_msg", "You are now registered. Please log in");

                let no_err=[];
                no_err.push({message:"Account created. You can log in now"});
                res.render("user/userlogin",{no_err});
            }
        );
    }
})


app.post("/user/userlogin",passport.authenticate("local",{
    successRedirect:"dashboard",
    failureRedirect:"userlogin",
    failureFlash:true
}));

app.post("/user/bookticket",async (req,res) =>{

    let {from,to,journeydate} = req.body;

    console.log(from,to,journeydate);

    let arr=[];
    arr['username']=req.session.user.username;

    pool.query(
        `SELECT * FROM trains WHERE departure = $1 AND destination = $2 AND departuredate = $3 and seats>0`,
        [from, to, journeydate],
        (err, results) => {
          if (err) {
            throw err;
          }
          console.log("database connected");
          console.log(results.rows);
      
          if (results.rows.length > 0) {
            console.log(results.rows.length);
            req.session.traininfo=results;
            res.render("user/bookticket", {results,arr});
          } 
          else {
            let error = [];
            error.push({ message: "Sorry, no trains available" });
            res.render("user/dashboard", { error, arr});
          }
        }
    );
})

app.post("/user/confirmbook",async (req,res) =>{

    let {trainid} = req.body;
    console.log("trainID: ");

    console.log(trainid);

    let uid=req.session.user.userid;

    pool.query(
    `INSERT INTO reservation (trainid, userid)
    VALUES ($1, $2)
    RETURNING reservationid`,
    [trainid, uid],
    async (err, results) => {
            if (err) {
                throw err;
            }
            console.log("database connected");
            console.log(results);

            const reservationId = results.rows[0].reservationid;
            console.log("RID: "+reservationId);

            //Generate QR code
            let stjson=JSON.stringify(reservationId);
            qr.toFile("./public/img/qr.png",stjson,{
                width: 200,
                height: 200
            },function(err){
                if(err)
                    throw err;
            });
            qr.toString(stjson,{type:"terminal"},function (err,code) {
                if(err){
                    throw err;
                }
                else{
                    console.log(code);
                    pool.query(
                        `update reservation
                        set qr_code=$1
                        where reservationid=$2
                        RETURNING reservationid`,
                        [code,reservationId],
                        async (err, results) => {
                                if (err) {
                                    throw err;
                                }
                                else{
                                    console.log("qr_code inserted");
                                }
                            }
                        );
                }
            });

            let uid=req.session.user.userid;
            let no_err=[];

            pool.query(
                `SELECT *
                FROM reservation natural join trains natural join users
                WHERE userid =$1 and avaiability=1
                order by reserve_time desc`,[uid],
                (err,results)=>{
                    if(err){
                        throw err;
                    }
                    console.log("database connected");
                    console.log(results.rows);

                    if(results.rows.length>0){
                        no_err.push({message:"Ticket Confirmed."});
                        res.render("user/tickethistory",{results});
                    }
                    else{
                        no_err.push({message:"Sorry you have no previous tickets"});
                        res.render("user/dashboard",{no_err});
                    }
                }
            );
        }
    );
})
app.post("/user/showqr",(req,res) =>{
    let {reservationid}=req.body;
    let stjson=JSON.stringify(reservationid);
    qr.toFile("./public/img/qr.png",stjson,{
        width: 500,
        height: 500
    },function(err){
        if(err)
            throw err;
    });
    pool.query(
        `SELECT *
        FROM reservation natural join trains natural join users
        WHERE reservationid =$1 and avaiability=1
        order by reserve_time desc`,[reservationid],
        (err,results)=>{
            if(err){
                throw err;
            }
            else{  
                res.render('user/showqr',{results});
            }
        }
    );
    
})












//API
function checkIndexAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/user/dashboard");
    }
    next();
}
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("dashboard");
    }
    next();
}
  
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("user/userlogin");
}




app.listen(port, () =>{
    console.log(`Server listening port http://localhost:${port}`);
})