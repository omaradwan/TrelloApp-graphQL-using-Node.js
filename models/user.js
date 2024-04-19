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
   resetPasswordLink:{
    type:String
   },
   expiryDate:{
    type:Date
   }

},
{timestamps:true}
)

module.exports=mongoose.model("User",userSchema)