const nodemailer = require("nodemailer");

const sendMail=async(req,res)=>{
    let testAccount = await nodemailer.createTestAccount();

    //connect with smtp
    const transporter = nodemailer.createTransport({
        service:"gmail",
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.Authority_Email,
            pass: process.env.email_password
        }
    });

    let info = await transporter.sendMail({
        from: '"SMetro 👻" <smetro@gmail.com>',
        to: "piwepag807@terkoer.com",
        subject: "Verify your account", 
        text: "Welcome to smetro", 
        html: "<b>Welcome</b>",
    });
    res.json(info);
};

module.exports=sendMail;

