const User=require("../models/user")
const bcrypt=require("bcrypt")
const { nextTick } = require("process")
const validator=require("validator")
const uuid=require("uuid")
const helpers=require("../middlewar/helper")
const jwt=require("jsonwebtoken")
const crypto=require("crypto")


module.exports={
    signup:async function({userInput},req){

        const{name,email,password,confirmPassword,avatar}=userInput
        const errors=[];
        if(!name||!email||!password||!confirmPassword){
            errors.push({msg:"name,email,password and confirmPassword must be required"})
        }
        if(password!=confirmPassword){
            errors.push({msg:"password do not match"})
        }

        if(!validator.isEmail(email)){
            errors.push("invalid email format")
        }
        if(!validator.isLength(password,{min:5})){
            errors.push({msg:"password is too short"})
        }
        if(errors.length>0){
            const error=new Error("invalid input");
            error.data=errors;
            error.code=400;
            throw error;
        }
        const checkUser=await User.findOne({email:email});
        if(checkUser){
            const error=new Error("user with this email already exist")
            throw error
        }
        const hashedPass= await bcrypt.hash(password,10)
       
        const newUser=new User({
            name,
            email,
            password:hashedPass ,
            confirmPassword:hashedPass,
        })
        
        const isSaved=await newUser.save();
        if(!isSaved){
            const error=new Error("error while creating new user")
            error.code=400;
         }
        // var obj={};
        // obj.subject="Register"
        // obj.text="you have sign up successfully"
        // helpers.sendConfirmationEmail(email,obj);

        const secretKey = process.env.SECRET_KEY
        // Create a token with the user's ID
        const id=isSaved._id.toString()
        console.log(id)
        let token
        token = await jwt.sign({ id} , secretKey, { expiresIn: '100h' });
      
        return {...isSaved._doc,token}
    },
    login:async function(userInput,req){
         const errors=[]
         if(!validator.isEmail(userInput.email)||validator.isEmpty(userInput.password)){
            errors.push({msg:"all fields must be filled"})
         }
         if(errors.length>0){
            const error=new Error("invalid input");
            error.data=errors;
            error.code=400;
            throw error
         }
         const user=await User.findOne({email:userInput.email});
         if(!user){
            throw new Error("user not found");
         }
         const decryptedPass=await bcrypt.compare(userInput.password,user.password);
         if(!decryptedPass){
            throw new Error("password is not correct");
         }
        //  console.log(user)
        const secretKey = process.env.SECRET_KEY
        // Create a token with the user's ID
        const id=user._id.toString()
       
        let token
        token = await jwt.sign({ id} , secretKey, { expiresIn: '100h' });
         return {...user._doc,id:user._id.toString(),token}
    },

    edit:async function(info,req){
       const errors=[];
       const userId=info.userId;
       const data=info.updates;
       if(!data){
        throw new Error("should edit any of the fields")
       }
      
     
       if(data.email &&!validator.isEmail(data.email)){
          errors.push("wrong email format");
       }
       if(data.password&&!validator.isLength(data.password,{min:5})){
         errors.push("password is too short");
       }
       if(errors.length>0){
        const error=new Error("invalid input");
        error.data=errors
        error.code=400
        throw error;
       }
       if(data.password){
       const hashedPass=await bcrypt.hash(data.password,12);
       data.password=hashedPass;
       }
       const updatedUser=await User.findOneAndUpdate(
        {
          _id:userId
        },
        {
         ...data
        },
        {
            new:true
        }
       )
       if(!updatedUser){
          throw new Error("cannot find User");
       }
       
       return {...updatedUser._doc,id:updatedUser._id.toString()}
      },
    forgetPassword:async function(info,req){
        // info should have the userId and the email to send the link on it
        const errors=[]
        const userId=info.userId
        const email=info.email;
        if(validator.isEmpty(userId))errors.push("no id has been sent")
        if(validator.isEmpty(email)||!validator.isEmail(email)){
            errors.push("wrong email format")
        }
        if(errors.length>0){
            const error=new Error("invalid input");
            error.data=errors;
            error.code=400;
            throw error;
        }
       
        const user=await User.findOne({_id:userId})
        if(!user){
            throw new Error("no user found with this id")
        }
       
        const codeLength = 6; // Default length is 6
        const code= crypto.randomBytes(codeLength).toString('hex').toUpperCase();
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);
        user.verificationCode=code;
        user.expiryDate=expirationDate;
        // var obj={};
        // obj.subject="reset password"
        // obj.text=link
        // helpers.sendConfirmationEmail(email,obj);
        await user.save()
        return code
    },
    checkVerification:async function(data,req){
        const{email,code}=data;
        if(validator.isEmpty(code)){
            throw new Error("please enter the code");
        }
        const user=await User.findOne({email:email})
        if(!user){
            throw new Error("no user found with this email")
        }
        const currentDate = new Date();
        if(currentDate>user.expiryDate){
            const error=new Error("the code has been expired!")
            error.code=401;
            throw error;
        }
  
        if(user.verificationCode!=code){
            throw new Error("verification code is not correct,pleae try again")
        }
        return true
    },
    resetPassword:async function(data){
        const{email,newPassword}=data;
        const user=await User.findOne({email:email});
    
        if(!user){
            const error=new Error("invalid operation");
            error.data="please enter a valid email"
            error.code=400;
            throw error
        }
        const encryptedPass=await bcrypt.hash(newPassword,12);
        user.password=encryptedPass;
       
        const secretKey = process.env.SECRET_KEY
        // Create a token with the user's ID
        const id=user._id
        let token
        token = await jwt.sign({ id} , secretKey, { expiresIn: '100h' });
        user.verificationCode=null;
        user.expiryDate=null;
        await user.save()
        return {...user._doc,id:user._id.toString(),token}

    }
}

