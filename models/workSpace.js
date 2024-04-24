const mongoose=require("mongoose")

const workSpaceSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
        unique:true
    },
    members:[{type:String,ref:"User"}],
    boards:[
        {type:String,ref:"Board",index:true,required:true},
    ],
    admins:[{type:String,ref:"User"}],
    creator:{
        type:String,ref:"User",
        required:true
    },
    isPublic:{
        type:Boolean,
        default:false
    },
    invitationLink:{type:String},
    expiryDate:{type:Date}
},{
    timestamps:true
})

module.exports=mongoose.model("workSpace",workSpaceSchema)