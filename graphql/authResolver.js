const User=require("../models/user")
const bcrypt=require("bcrypt")
const { nextTick } = require("process")
const validator=require("validator")

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
        return isSaved
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
         console.log(user)
         return {...user._doc,id:user._id.toString()}
    }

}
