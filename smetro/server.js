const express=require("express");
const app = express();
const {pool} = require("./dbconfig");
const bcrypt=require("bcrypt");
const session=require("express-session");
const flash=require("express-flash");
const passport=require('passport');

const initializePassport=require('./passportConfig');

initializePassport(passport);

require('dotenv').config()

const port=process.env.PORT || 3001;


app.listen(port, () =>{
    console.log(`Server listening port http://localhost:${port}`);
})