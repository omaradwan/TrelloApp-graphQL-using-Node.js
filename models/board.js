const mongoose=require("mongoose")

const boardSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
    },
    list:[{type:String,ref:"List"}],
    userWithRoles: [{
        userId: {
          type: String,
          required: true
        },
        role: {
          type: String,
          required: true
        }
      }],
    creator:{
        type:String,ref:"User",
        required:true
    },
 
    invitationLink:{type:String},
    expiryDate:{type:Date}
},{
    timestamps:true
})

module.exports=mongoose.model("Board",boardSchema)