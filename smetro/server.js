const express=require("express");
const app = express();
const {pool} = require("./dbconfig");
const bcrypt=require("bcrypt");
const session=require("express-session");
const flash=require("express-flash");
const passport=require('passport');

const initializePassport=require('./passportConfig');
const sendMail = require("./controllers/sendmail");

initializePassport(passport);

require('dotenv').config()

const port=process.env.PORT || 3001;

app.set('view engine',"ejs");
app.use(express.urlencoded({extended: false}));
app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false
    })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


//GET METHODS
app.get("/",checkIndexAuthenticated,(req,res) =>{
    res.render('index');
})

app.get("/user/dashboard",(req,res) =>{
    let arr=[];
    arr['username']=req.user.username;
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
      res.redirect("/user/userlogin");
    });
});
app.get("/sendMail",sendMail);




//POST METHODS
app.post("/user/usersignup",async (req,res) =>{
    let {username,usernid,useremail,userphone,userpassword,cuserpassword} = req.body;
    //console.log(username,usernid,useremail,userphone,userpassword,cuserpassword);
    
    let error=[];

    if(userpassword!=cuserpassword){
        error.push({message: "Passwords do not match"});
        res.render('user/usersignup',{error});
    }
    else{
        let hash=await bcrypt.hash(userpassword,10);
        console.log(hash);

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
                    //insert the values
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
                        }
                    );
                    let no_err=[];
                    no_err.push({message:"Account created. You can log in now"});
                    res.render("user/usersignup",{no_err});
                }
            }
        );
    }
})


app.post("/user/userlogin",passport.authenticate("local",{
    successRedirect:"dashboard",
    failureRedirect:"userlogin",
    failureFlash:true
}));

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