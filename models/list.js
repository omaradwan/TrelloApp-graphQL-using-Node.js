const mongoose=require("mongoose")

const listSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
        unique:false
    },
    task:[{type:String,ref:"Task"}],
    transition:[{type:String,ref:"List"}],
    creator:{
        type:String,ref:"User",
        required:true
    },
    allowedRoles:[{type:String}]
})

module.exports=mongoose.model("List",listSchema)