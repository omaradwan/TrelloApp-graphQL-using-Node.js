const workSpace=require("../models/workSpace")
const User=require("../models/user")
const Board=require("../models/board")
const validator=require("validator")
module.exports={

    createWorkSpace: async function({userData},req){
      //  console.log("in")
        if(!req.isAuth){
            throw new Error("not authinticated")
        }
        const{title,members,boards,admins,isPublic}=userData
        const userId=req.userId;
        const errors=[];
        if(validator.isEmpty(title))errors.push("title if the workSpace is required")
        if(!userId)errors.push("userId is required");
        if(errors.length>0){
            const error=new Error("invalid input");
            error.data=errors;
            error.code=400;
            throw error;
        }
        const user=await User.findOne({_id:userId});
        if(!user){
            throw new Error("userId should be sent")
        }
        // check if there another workspace with the same name
        const checkName=await workSpace.findOne({title:title});
        if(checkName){
            throw new Error("there is another workspace with the same name")
        }
        const newWorkSpace=new workSpace({
            title,
            members,
            boards,
            admins,
            creator:userId,
            isPublic
        })
        
        newWorkSpace.admins.push(req.userId)
        newWorkSpace.members.push(req.userId)
        const isSaved=await newWorkSpace.save();
        if(!isSaved){
            throw new Error("error while creating workspace")
        }
        return {...isSaved._doc}
    },
    getWorkSpace: async function({id},req){
       // console.log("in")
        if(!req.isAuth){
            throw new Error("not authinticated")
        }
        const wsId=id;  
        const userId=req.userId
        if(!wsId){
            throw new Error("id should be sent")
        }
        const WS=await workSpace.findOne({_id:wsId})
        if(!WS){
            throw new Error("cannot find workspace");
        }
        if(!WS.members.includes(userId)){
            const error=new Error("user not in this workspace");
            error.code=401;
            throw error
        }
        return {...WS._doc}
    },
    addAdmin:async function(data,req){
        if(!req.isAuth){
        throw new Error("not authinticated")
        }
       
        const{workSpaceId,userTobeAdded}=data;
       
        const WS=await workSpace.findOne({_id:workSpaceId});
        if(!WS){
            throw new Error("cannot find workspace");
        }
        const isAdmin=req.userId;
        if(!WS.admins.includes(isAdmin)){
            const error=new Error("Only admins can make this functionality!")
            error.code=401;
            throw error
        }
        const userFound=await User.findOne({_id:userTobeAdded});
        if(!userFound){
            throw new Error("no user with this ID")
        }
        if(WS.admins.includes(userTobeAdded)){
            throw new Error("user is already an admin")
        }    
        WS.admins.push(userTobeAdded);
        await WS.save()
        return{...WS._doc}      
    },
    getMembers:async function({workSpaceId},req){
        if(!req.isAuth){
            throw new Error("not authinticated")
        }
        const userId=req.userId;
        const WS=await workSpace.findOne({_id:workSpaceId})
        if(!WS){
            throw new Error("no workspace found")
        }
        if(!WS.members.includes(userId)){
            throw new Error("you don't have the authority to do this operation")
        }

       return {...WS._doc}

    },
    createBoard:async function({workSpaceId,userData},req){
        if(!req.isAuth){
            throw new Error("not authinticated")
        }
        const{title,description,list,userWithRoles,creator,invitationLink,expiryDate}=userData
        const userId=req.userId
       
        const WS=await workSpace.findOne({_id:workSpaceId})
        if(!WS){
            throw new Error("cannot find workspace with this Id")
        }
        if(!WS.admins.includes(userId)){
            throw new Error("Only admins can add boards")
        }
        const newBoard=new Board({
            title,
            description,
            list,
            userWithRoles,
            creator,
            invitationLink,
            expiryDate
        })
        const isSaved=await newBoard.save();
        return{...WS._doc,...isSaved._doc}
    }

}

