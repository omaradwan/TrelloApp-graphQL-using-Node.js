const mongoose=require("mongoose")

const taskSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
    },
    curList:{type:String,ref:"List"},
    assignedUsers:{
        type:String,ref:"User"
    },
    deadline:{type:Date}
},{
    timestamps:true
})

module.exports=mongoose.model("Task",taskSchema)