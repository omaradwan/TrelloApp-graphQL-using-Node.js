const mongoose=require("mongoose")

const commentSchema=new mongoose.Schema({
    comment:{
        type:String,
        required:true,
    },
    senderId:{
        type:String,ref:"User",
        required:true
    },
    taskId:{
        type:String,
        ref:"Task",
        required:true,
        index:true
    }
},{
    timestamps:true
})

module.exports=mongoose.model("Comment",commentSchema)