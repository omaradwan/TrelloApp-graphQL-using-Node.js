const mongoose=require("mongoose")

const userSchema=new mongoose.Schema({
   email:{
    type:String,
    required:true,
    unique:true,
    trim:true
   },
   password:{
    type:String,
    required:true,
    trim:true
   },
   name:{
    type:String,
    required:true,
    trim:true
   },
   avatar:{
    type:String
   },
   verificationCode:{
    type:String
   },
   expiryDate:{
    type:Date
   },
   profilePic:{
      type:String
   }

},
{timestamps:true}
)

module.exports=mongoose.model("User",userSchema)