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
app.use(express.json());








//GET METHODS
app.get("/",checkIndexAuthenticated,(req,res) =>{
    pool.query(
        `select distinct departure from fares`,
        (err,results)=>{
            if(err){
                throw err;
            }
            console.log(results);
            const resultsArray = Array.from(results.rows);
            res.render('index',{results: resultsArray});
        }
    );
})

app.get("/user/dashboard",(req,res) =>{
    req.session.user=req.user;
    req.session.save();
    let arr=[];
    arr['username']=req.session.user.username;
    arr['userid']=req.user.userid;

    pool.query(
        `select distinct departure from fares`,
        (err,results)=>{
            if(err){
                throw err;
            }
            console.log(results);
            const resultsArray = Array.from(results.rows);
            res.render('user/dashboard',{results: resultsArray,arr});
        }
    );
    
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
        WHERE userid =$1 and availability<3
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
                let error=[];
                error.push({message:"You have no previous tickets"});
                pool.query(
                    `select distinct departure from fares`,
                    (err,results)=>{
                        if(err){
                            throw err;
                        }
                        console.log(results);
                        const resultsArray = Array.from(results.rows);
                        res.render('user/dashboard',{results: resultsArray,error});
                    }
                );
            }
        }
    );
})
app.get("/user/scanqr", async (req,res) => {
    res.render('user/scanqr');
});

app.get("/test", async (req,res) => {
    res.render('test');
});













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
                if(results.rows.length>0){
                    error.push({message: "Email already exists"});
                    res.render("user/usersignup",{error});
                }
                else{
                    pool.query(
                        `select * from users where userphone=$1`,[userphone],
                        (err,results)=>{
                            if(err){
                                throw err;
                            }
            
                            if(results.rows.length>0){
                                error.push({message: "Phone number already exists"});
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

    if(from == to){
        pool.query(
            `select distinct departure from fares`,
            (err,results)=>{
                if(err){
                    throw err;
                }
                console.log(results);
                const resultsArray = Array.from(results.rows);
                let error=[];
                error.push({ message: "Please select different departure and destination" });
                res.render('user/dashboard',{results: resultsArray,arr,error});
            }
        );
    }

    let arr=[];
    arr['username']=req.session.user.username;

    pool.query(
        `SELECT * FROM trains natural join fares 
        WHERE departure = $1 AND destination = $2 AND departuredate = $3 and seats>0`,
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
            pool.query(
                `select distinct departure from fares`,
                (err,results)=>{
                    if(err){
                        throw err;
                    }
                    console.log(results);
                    const resultsArray = Array.from(results.rows);
                    
                    error.push({ message: "Sorry, no trains available for this date" });
                    res.render('user/dashboard',{results: resultsArray,arr,error});
                }
            );
          }
        }
    );
})

app.post("/user/query",async (req,res) =>{
    let {from,to,journeydate} = req.body;
    if(from == to){
        pool.query(
            `select distinct departure from fares`,
            (err,results)=>{
                if(err){
                    throw err;
                }
                console.log(results);
                const resultsArray = Array.from(results.rows);
                let error=[];
                error.push({ message: "Please select different departure and destination" });
                res.render('index',{results: resultsArray,error});
            }
        );
    }
    pool.query(
        `SELECT * FROM trains natural join fares 
        WHERE departure = $1 AND destination = $2 AND departuredate = $3 and seats>0`,
        [from, to, journeydate],
        (err, results) => {
          if (err) {
            throw err;
          }
          console.log("database connected");
          console.log(results.rows);
      
          if (results.rows.length > 0) {
            console.log(results.rows.length);
            res.render("ticketlist", {results});
          } 
          else {
            let error = [];
            pool.query(
                `select distinct departure from fares`,
                (err,results)=>{
                    if(err){
                        throw err;
                    }
                    console.log(results);
                    const resultsArray = Array.from(results.rows);
                    
                    error.push({ message: "Sorry, no trains available for this date" });
                    res.render('user/dashboard',{results: resultsArray,error});
                }
            );
          }
        }
    );
})

app.post("/user/varifybooking",(req,res) =>{
    const token = Math.floor(1000 + Math.random() * 9000);
    let {trainid} = req.body;
    req.session.user.bookingtoken=token;
    let message="Your otp varification code for booking confirmation is ";
    let subject="Verify your booking";
    sendMail(req.session.user.useremail,token,subject,message);
    let no_err=[];
    no_err.push({message:"Please provide the booking token sent to your email"});
    res.render('user/varifybooking',{trainid,no_err});
});

app.post("/user/confirmbook",async (req,res) =>{

    let {trainid,token} = req.body;
    if(req.session.user.bookingtoken==token){
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
                
            //Update train table to deduct a seat
            pool.query(
                `update trains set seats=seats-1
                where trainid=$1`,[trainid],
                (err,results)=>{
                    if(err){
                        throw err;
                    }
                }
            );

            //Update User account that deducts the fare of the train
            let uid=req.session.user.userid;
            pool.query(
                `select amount from trains natural join fares where trainid=$1`,[trainid],
                (err,results)=>{
                    if(err){
                        throw err;
                    }
                    console.log("Got amount: ");
                    let fare = results.rows[0].amount;
                    console.log(fare);

                    pool.query(
                        `select userbalance from users where userid=$1`,[uid],
                        (err,results)=>{
                            if(err){
                                throw err;
                            }
                            let userbalanace=results.rows[0].userbalance;
                            if(userbalanace<fare){
                                let error=[];
                                error.push({message:"Sorry!Not enough account balance.Please recharge your account."});
                                pool.query(
                                    `select distinct departure from fares`,
                                    (err,results)=>{
                                        if(err){
                                            throw err;
                                        }
                                        console.log(results);
                                        const resultsArray = Array.from(results.rows);
                                        res.render('user/dashboard',{results: resultsArray,error});
                                    }
                                );
                            } 
                            else{
                                pool.query(
                                    `update users set userbalance=userbalance-$1 where userid=$2`,[fare,uid],
                                    (err,results)=>{
                                        if(err){
                                            throw err;
                                        }
                                        console.log("User update completed");
                                    }
                                );
                                console.log("User update completed");
                            }
                        }
                    );
                }
            );

            let no_err=[];

            pool.query(
                `SELECT *
                FROM reservation natural join trains natural join users
                WHERE userid =$1 and availability=1
                order by reserve_time desc`,[uid],
                (err,results)=>{
                    if(err){
                        throw err;
                    }
                    console.log("database connected");
                    console.log(results.rows);

                    if(results.rows.length>0){
                        no_err.push({message:"Ticket Confirmed."});
                        res.render("user/tickethistory",{results,no_err});
                    }
                    else{
                        no_err.push({message:"Sorry you have no previous tickets"});
                        res.render("user/dashboard",{no_err});
                    }
                }
            );
        }
    );
    }
    else{
        let error=[];
        error.push({message:"Wrong token provided.Booking canceled."})
        pool.query(
            `select distinct departure from fares`,
            (err,results)=>{
                if(err){
                    throw err;
                }
                let error=[];
                error.push({message:"No such reservation exists."})
                const resultsArray = Array.from(results.rows);
                res.render('user/dashboard',{results:resultsArray,arr,error});
            }
        );
    }
    
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
        WHERE reservationid =$1 and availability<3
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



app.post('/api/scan', (req, res) => {
    const result = req.body.result;
});

app.post('/user/checkValidity', (req, res) => {
    const result = req.body.result;
    // Send this result to database
    console.log("The result is "+ result);
    //handle exceptions
    pool.query(
        `select departuretime,availability from reservation natural join trains where reservationid=$1`,[result],
        (err,results)=>{
            if(err){
                console.log("The rows returned are: "+ results.rows.length);
                throw err;
            }
            else if(results.rows.length>0){  
                const departureTime = results.rows[0].departuretime;
                const availability = results.rows[0].availability;
                const currentTime = new Date();
                if(departureTime<currentTime && availability==0){
                    let error=[];
                    error.push({message:"Sorry!You have missed the train."});
                    res.render('user/doorSystem',{error});
                }
                else if(availability>=3){
                    let error=[];
                    error.push({message:"The ticket has been expired"});
                    res.render('user/doorSystem',{error});
                }
            }
            else if(results.rows.length==0){
                let arr=[];
                arr['username']=req.session.user.username;
                arr['userid']=req.user.userid;

                pool.query(
                    `select distinct departure from fares`,
                    (err,results)=>{
                        if(err){
                            throw err;
                        }
                        let error=[];
                        error.push({message:"No such reservation exists."})
                        const resultsArray = Array.from(results.rows);
                        res.render('user/dashboard',{results:resultsArray,arr,error});
                    }
                );
            }
        }
    );
    pool.query(
        `update reservation
        set 
            scanned_entertime=case
                when availability=1 then now()
                else scanned_entertime
            end,
            scanned_departuretime=case
                when availability=2 then now()
                else scanned_departuretime
            end,
            availability=availability+1
        where reservationid=$1
        returning reservation.scanned_departuretime,
        reservation.scanned_entertime,
        reservation.availability,
        reservation.trainid`,[result],
        (err,results)=>{
            if(err){
                throw err;
            }
            else if(results.rows.length>0){  
                const enter = results.rows[0].scanned_entertime;
                const departure = results.rows[0].scanned_departuretime;
                const availability = results.rows[0].availability;
                const trainid = results.rows[0].trainid;
                
                //Calculate the time difference in minutes
                const timeDiffInMs = new Date(departure) - new Date(enter);
                const timeDiffInMinutes = Math.round((timeDiffInMs / 1000) / 60);
                
                console.log("enter: "+enter);
                console.log("departure: "+departure);
                console.log("availability: "+availability);
                console.log("trainid: "+trainid);
                console.log("Time diff in minutes:1 "+timeDiffInMinutes);
                
                if(timeDiffInMinutes>120){
                    const extraCharge=((timeDiffInMinutes-120)/60)*100;
                    console.log("Extra charge is: "+extraCharge);
                    
                    pool.query(
                        `insert into stuckpassengers (reservationID, extraCharge)
                        values($1,$2)`,[result,extraCharge],
                        (err,results)=>{
                            if(err){
                                throw err;
                            }
                            else{  
                                let error=[];
                                error.push({message:"You have some penalty charges("+extraCharge+") pending for staying too long in the station. Please contact our customer service booth kindly to pay the dues."});
                                res.render('user/doorSystem',{error});
                            }
                        }
                    );
                }
                else{
                    let no_err=[];
                    no_err.push({message:"The door is open!"});
                    if(availability==3){
                        pool.query(
                            `update trains set seats=seats+1 where trainid=$1`,[trainid],
                            (err,results)=>{
                                if(err){
                                    throw err;
                                }
                                else{
                                    res.render('user/doorSystem',{no_err});
                                }
                            }
                        );
                    }
                    else{
                        res.render('user/doorSystem',{no_err});
                    }
                }

            }
        }
    );
});
















//Admin Get Methods
app.get("/admin/adminlogin",checkAuthenticated,(req,res) =>{
    res.render('admin/adminlogin');
})

app.get("/admin/adminsignup", (req,res) =>{
    res.render('admin/adminsignup');
})
app.get("/admin/admindashboard", (req,res) =>{

    pool.query(
        `select * from fares`,
        (err,results)=>{
            if(err){
                throw err;
            }
            else{  
                console.log(results);
                const resultsArray = Array.from(results.rows);
                res.render('admin/admindashboard',{results});
            }
        }
    );
})
app.get("/admin/addtrain", (req,res) =>{
    pool.query(
        `select distinct departure from fares`,
        (err,results)=>{
            if(err){
                throw err;
            }
            
            const resultsArray = Array.from(results.rows);
            pool.query(
                `select * from trains`,
                (err,result)=>{
                    if(err){
                        throw err;
                    }
                    else{
                        res.render('admin/addtrain',{results: resultsArray,result});
                    }
                }
            );
        }
    );
});
app.get("/admin/stuckpassengers", (req,res) =>{
    pool.query(
        `select * from stuckpassengers natural join reservation natural join users where status=0`,
        (err,results)=>{
            if(err){
                throw err;
            }
            
            else{
                const resultsArray = Array.from(results.rows);
                res.render('admin/stuckpassengers',{results});
            }
        }
    );
});

app.get("/admin/addbalance", (req,res) =>{
    res.render('admin/addbalance');
});













// Admin Post Methods
app.post("/admin/adminsignup",async (req,res) =>{

    let {masterkey,adminname,adminnid,adminemail,adminphone,adminpassword,cadminpassword} = req.body;

    console.log(masterkey,adminname,adminnid,adminemail,adminphone,adminpassword,cadminpassword);
    
    let error=[];

    if(adminpassword!=cadminpassword){
        error.push({message: "Passwords do not match"});
        res.render('admin/adminsignup',{error});
    }
    else if(masterkey!="1234"){
        error.push({message: "Incorrect masterkey.Please contact authority"});
        res.render('admin/adminsignup',{error});
    }
    else{
        const adminotp = Math.floor(1000 + Math.random() * 9000);

        pool.query(
            `select * from admins where adminemail=$1`,[adminemail],
            (err,results)=>{
                if(err){
                    throw err;
                }
                console.log("database connected");
                console.log(results.rows);

                if(results.rows.length>0){
                    error.push({message: "Email already exists"});
                    res.render("admin/adminsignup",{error});
                }
                else{
                    let message="Your otp varification code is ";
                    let subject="Verify your account";
                    sendMail(adminemail,adminotp,subject,message);
                    res.render('admin/adminregister',{adminname,adminnid,adminemail,adminphone,adminpassword,adminotp});
                }
            }
        );
    }
})

app.post("/admin/adminregister",async (req,res) =>{
    let {adminname,adminnid,adminemail,adminphone,adminpassword,adminotp,adminvarcode} = req.body;
    let error=[];
    if(adminotp!=adminvarcode){
        error.push({message:"Invalid varification code"});
        res.render("admin/adminregister",{error});
    }
    else{
        let hash=await bcrypt.hash(adminpassword,10);
        console.log(hash);
        pool.query(
            `INSERT INTO admins (adminname,adminnid,adminemail,adminphone,adminpassword)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING adminname,adminnid,adminemail,adminphone,adminpassword`,
            [adminname,adminnid,adminemail,adminphone,hash],
            (err, results) => {
            if (err) {
                throw err;
            }
                console.log(results.rows);
                console.log("Data inserted");
                req.flash("success_msg", "You are now registered admin. Please log in");

                let no_err=[];
                no_err.push({message:"Account created. You can log in now as an admin"});
                res.render("admin/adminlogin",{no_err});
            }
        );
    }
})



app.post("/admin/adminlogin",async (req,res) =>{
    let {adminemail,adminpassword} = req.body;
    console.log("admin email: "+adminemail);
    console.log("admin password: "+adminpassword);

    let error=[];
    pool.query(
        `select * from admins where adminemail=$1`,
        [adminemail],
        (err, results) => {
          if (err) {
            throw err;
          }
          console.log(results.rows);
  
          if (results.rows.length > 0) {
            const admin = results.rows[0];
  
            bcrypt.compare(adminpassword, admin.adminpassword, (err, isMatch) => {
              if (err) {
                console.log(err);
              }
              if (isMatch) {
                req.session.admin=results;
                pool.query(
                    `select * from fares`,
                    (err,results)=>{
                        if(err){
                            throw err;
                        }
                        else{  
                            console.log("Fare details: ");
                            console.log(results);
                            const resultsArray = Array.from(results.rows);
                            res.render('admin/admindashboard',{results});
                        }
                    }
                );
                // res.render("admin/admindashboard");
              } 
              else {
                //password is incorrect
                error.push({message:"Incorrect Passowrd"});
                res.render("admin/adminlogin",{error});
              }
            });
          } 
          else {
            // No user
            console.log("no user");
            error.push({message:"No admins found with this email"});
            res.render("admin/adminlogin",{error});

          }
        }
      );
})

app.post("/admin/addroute",async (req,res) =>{
    let {departure,destination,amount} = req.body;
    console.log(departure+" " +destination+" " +amount);

    let error=[],no_err=[];

    pool.query(
        `select * from fares where departure=$1 and destination=$2`,
        [departure,destination],
        (err, results) => {
          if (err) {
            throw err;
          }
          console.log(results.rows);
          console.log(results.rows.length);
  
          if (results.rows.length > 0) {
            error.push({message:"Route already exists"});
            pool.query(
                `select * from fares`,
                (err,results)=>{
                    if(err){
                        throw err;
                    }
                    else{  
                        res.render('admin/admindashboard',{results,error});
                    }
                }
            );
          }
          else{
            pool.query(
                `INSERT INTO fares (departure,destination,amount)
                    VALUES ($1, $2, $3)
                    RETURNING fareid,departure,destination,amount`,
                [departure,destination,amount],
                (err, results) => {
                if (err) {
                    throw err;
                }
                }
            );
            pool.query(
                `INSERT INTO fares (departure,destination,amount)
                    VALUES ($1, $2, $3)
                    RETURNING fareid,departure,destination,amount`,
                [destination,departure,amount],
                (err, results) => {
                if (err) {
                    throw err;
                }
                    // console.log(results.rows);
                    
                    no_err.push({message:"Fare Inserted"});
                    pool.query(
                        `select * from fares`,
                        (err,results)=>{
                            if(err){
                                throw err;
                            }
                            else{  
                                res.render('admin/admindashboard',{results,no_err});
                            }
                        }
                    );
                }
            );
          }
        }
      );
})


app.post("/admin/addtrain",async (req,res) =>{
    let {trainname,departure,destination,seats,journeydate,departuretime,arrivaltime} = req.body;
    console.log(trainname,departure,destination,seats,journeydate,departuretime,arrivaltime);
    console.log(destination,departure);
    
    if(departure==destination){
        let error=[];
        error.push({message:"Departure and Destination should be different"});
        pool.query(
            `select distinct departure from fares`,
            (err,results)=>{
                if(err){
                    throw err;
                }
                
                const resultsArray = Array.from(results.rows);
                pool.query(
                    `select * from trains`,
                    (err,result)=>{
                        if(err){
                            throw err;
                        }
                        else{
                            res.render('admin/addtrain',{results: resultsArray,error,result});
                        }
                    }
                );   
            }
        );
    }
    else{
        pool.query(
            `INSERT INTO trains (trainname,departure,destination,seats,departuredate,departuretime,arrivaltime)
                VALUES ($1, $2, $3,$4,$5,$6,$7)
                RETURNING trainname,departure,destination,seats,departuredate,departuretime,arrivaltime`,
            [trainname,departure,destination,seats,journeydate,departuretime,arrivaltime],
            (err, results) => {
            if (err) {
                throw err;
            }
                console.log(results.rows);
            }
        );
        pool.query(
            `select distinct departure from fares`,
            (err,results)=>{
                if(err){
                    throw err;
                }
                
                const resultsArray = Array.from(results.rows);
                let no_err=[];
                no_err.push({message:"Train Info Inserted"});
                pool.query(
                    `select * from trains`,
                    (err,result)=>{
                        if(err){
                            throw err;
                        }
                        else{
                            res.render('admin/addtrain',{results: resultsArray,no_err,result});
                        }
                    }
                );
            }
        );
    }
});

app.post("/admin/deletefare",async (req,res) =>{
    let {deletefare} = req.body;
    
    pool.query(
        `Delete from fares where fareid=$1`,[deletefare],
        (err, results) => {
            if (err) {
                throw err;
            }
            else{
                let no_err=[];
                pool.query(
                    `select * from fares`,
                    (err,results)=>{
                        if(err){
                            throw err;
                        }
                        else{  
                            console.log("Fare details: ");
                            console.log(results);
                            no_err.push({message:"Fare has been deleted"});
                            res.render('admin/admindashboard',{results,no_err});
                        }
                    }
                );
            }
        }
    );
});



app.post("/admin/deletetrain",async (req,res) =>{
    let {deletetrain} = req.body;
    
    pool.query(
        `Delete from trains where trainid=$1`,[deletetrain],
        (err, results) => {
            if (err) {
                throw err;
            }
            else{
                let no_err=[];
                pool.query(
                    `select * from trains`,
                    (err,results)=>{
                        if(err){
                            throw err;
                        }
                        else{
                            no_err.push({message:"Train has been deleted"});
                            res.render('admin/admindashboard',{results,no_err});
                        }
                    }
                );
            }
        }
    );
})

app.post("/admin/release",async (req,res) =>{
    let {reservationid} = req.body;
    pool.query(
        `update stuckpassengers set status=status+1 where reservationid = $1`,[reservationid],
        (err, results) => {
            if (err) {
                throw err;
            }
            else{
                let no_err=[];
                pool.query(
                    `update reservation set scanned_entertime=now() where reservationid=$1`,[reservationid],
                    (err,results)=>{
                        if(err){
                            throw err;
                        }
                        else{
                            no_err.push({message:"Passenger has been released"});
                            res.render('admin/admindashboard',{results,no_err});
                        }
                    }
                );
            }
        }
    );
})
app.post("/admin/addbalance",async (req,res) =>{
    let {amount,userphone} = req.body;
    
    pool.query(
        `update users set userbalance=userbalance+$1 where userphone = $2 returning userbalance`,[amount,userphone],
        (err, results) => {
            if (err) {
                throw err;
            }
            else{
                console.log(results);
                let no_err=[];
                no_err.push({message:"Account has been recharged"})
                res.render('admin/addbalance',{results,no_err});
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