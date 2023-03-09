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
            user: 'servicelagbe@gmail.com',
            pass: 'fxjraufpgwdtmfzq'
        }
    });

    let info = await transporter.sendMail({
        from: '"SMetro 👻" <smetro@gmail.com>',
        to: "piwepag807@terkoer.com",
        subject: "Verify your account", 
        text: "Welcome to smetro", 
        html: "<b>Welcome</b>",
    });
    console.log("Email sent: %s",info.messageId);
    res.json(info);
};

module.exports=sendMail;

