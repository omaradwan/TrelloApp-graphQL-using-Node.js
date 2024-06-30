const nodemailer=require("nodemailer")
const jwt=require("jsonwebtoken");
const User=require("../models/user")

module.exports.sendConfirmationEmail = async (email,content) => {
    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSKEY
        }
    });

    // Send confirmation email
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: content.subject,
        text: content.text
    };

    transporter.sendMail(mailOptions,(err,info)=>{
        if(err){
            console.error('Error sending email:', err);
        }
        else{
            console.log('Email sent:', info.response);
        }
    });   
    
};



module.exports.verifyToken=((req,res,next)=>{
    const authtoken = req.headers["Authorization"] || req.headers["authorization"];
    if (!authtoken) {
      req.isAuth=false
      return next()
    }
   const token = authtoken.split(' ')[1];
 
   const SECRET_KEY = process.env.SECRET_KEY
  
    try{
        const curuser = jwt.verify(token,SECRET_KEY);
        
        req.userId = curuser.id
        req.isAuth=true
        next();
    }
    catch (err) {
        req.isAuth=false
        return next()
    }
        
})

module.exports.setImage=async(req,res,next)=>{
   
    if(!req.isAuth){
        throw new Error("not authinticated")
    }
    let userId=req.userId;
    if(!userId){
        throw new Error("no userId has been sent");
    }
    if(req.file.filename){
        let user=await User.findById(userId);
        user.profilePic=req.file.filename;

        await user.save();
        return res.status(200).json({msg:"user created Successfully with image upload"});
    }
}

module.exports.getID=(token)=>{
    const SECRET_KEY = process.env.SECRET_KEY
    try{
        const curuser = jwt.verify(token,SECRET_KEY);
        
        let userId = curuser.id
        return userId;
    }
    catch (err) {
        console.log("getID function with error",err);
        return null;
    }
}