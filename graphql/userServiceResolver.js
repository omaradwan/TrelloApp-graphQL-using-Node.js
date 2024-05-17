const workSpace=require("../models/workSpace")
const User=require("../models/user")
const Board=require("../models/board")
const List=require("../models/list")
const validator=require("validator")
const helpers=require("../middlewar/helper")
const uuid=require("uuid")
const list = require("../models/list")
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
    addUser:async function(data,req){
       const{userId,workSpaceId}=data;
       if(!userId||!workSpaceId){
        throw new Error("Error")
       }
       if(!req.isAuth){
        throw new Error("not authinticated")
       }
       const isAdmin=req.userId;
       const WS=await workSpace.findOne({_id:workSpaceId})
       if(!WS){
        throw new Error("no workspace found")
       }
       if(!WS.admins.includes(isAdmin)){
        const error=new Error("Only admins can make this functionality!")
        error.code=401;
        throw error
    }
       if(WS.members.includes(userId)){
        throw new Error("user is already in workspace")
       }
       WS.members.push(userId);
       await WS.save();
       return{...WS._doc}  
    },
    removeUser:async function(data,req){
        const{userId,workSpaceId}=data;
        if(!userId||!workSpaceId){
         throw new Error("Error")
        }
        if(!req.isAuth){
         throw new Error("not authinticated")
        }
        const isAdmin=req.userId;
       
        const WS=await workSpace.updateOne(
            {
            _id:workSpaceId,
            admins:isAdmin
            },
            { $pull: { members:userId, admins:userId} },
            {new:true}
        )
        if(!WS){
            const error=new Error("operation failed")
            error.code=400;
            throw error;
        }
        const user=await User.findOne({_id:userId});
        return`${user.name} removed successfully` 
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
        WS.boards.push(newBoard._id.toString());
        await WS.save();
        return{...WS._doc,...isSaved._doc}
    },
    getBoards:async function({workSpaceId},req){
        if(!req.isAuth){
            throw new Error("not authinticated")
        }
        const WS=await workSpace.findOne({_id:workSpaceId}).populate("boards");
       
        if(!WS){
            throw new Error("no workSpace with this Id")
        }
        const userId=req.userId;
        if(!WS.members.includes(userId)){
            throw new Error("user is not in this workSpace")
        }
        const boards=WS.boards;
        if(!boards){
            throw new Error("no boards in the work space")
        }
        return boards;
    },
    inviteUser:async function({email,workSpaceId},req){
        if(!req.isAuth){
            throw new Error("not authinticated")
        }
        const userId=req.userId;
        const WS=await workSpace.findOne({_id:workSpaceId});
        if(!WS){
            throw new Error("no workspace found with this id");
        }
        if(!WS.admins.includes(userId)){
            const error=new Error("Only admins can invite users");
            error.code=401;
            throw error;
        }
        const uuidv = uuid.v4();

        const link = `https:test.com/invitation/${WS.title}/${uuidv}`;
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);
        WS.invitationLink=link;
        WS.expiryDate=expirationDate;
        await WS.save();
        var obj={};
        obj.subject="Invitation to workspace"
        obj.text=`the invitation link is ${link}`

        helpers.sendConfirmationEmail(email,obj);
        return "invitation has sent successfully"
    },
    receiveInvitaion:async function({userId,link},req){
        if(!link){
            throw new Error("link must be provided");
        }
        const WS=await workSpace.findOne({invitationLink:link});
        if(!WS){
            throw new Error("the link is not correct or not found workspace");
        }
        const currentDate=new Date();
        if(currentDate>WS.expiryDate){
            const error=new Error("sorry but the link has been expired");
            error.code=400;
            throw error;
        }
      
        if(!userId){
            throw new Error("userId must be provided");
        }
        const haveAccount=await User.findOne({_id:userId});
        if(!haveAccount){
            return{success:false,message:"you must have an account first"};
        }
        if(WS.members.includes(userId)){
            throw new Error("user is already in this workspace");
        }
        WS.members.push(userId);
        await WS.save();
        return{success:true,message:"",workSpace:WS};
    },
    getAllWorkSpaces:async function({id},req){
        if(!req.isAuth){
            throw new Error("not authinticated")
        }

        const userId=id;
        const checkUser=await User.findOne({_id:userId});
        if(!checkUser){
            throw new Error("User have to sign up first")
        }
        if(!userId){
            throw new Error("userId is required");
        }
        const WS=await workSpace.find({
            members:{$in:[userId]}
        })
        if(!WS){
            throw new Error("no workSpaces found")
        }
      //  console.log(WS)
        return WS
    },
    createList:async function({inputInfo,workSpaceId,boardId},req){
        if(!req.isAuth){
            throw new Error("not authinticated")
        }
        const userId=req.userId;
        const WS=await workSpace.findOne({_id:workSpaceId}).populate("boards");
        if(!WS){
            throw new Error("can not found workSpace with this id")
        }
        if(!WS.boards.some(it=>it._id==boardId)){
            const error=new Error("invalid boardId or this board not in this workspace")
            error.code=400;
            throw error;
        }
        if(!WS.admins.includes(userId)){
            throw new Error("Only admins can add lists")
        }
        const {title,tasks,transition,creator,allowedRoles}=inputInfo;

        const newList=new List({
            title,
            tasks,
            transition,
            creator:userId,
            allowedRoles
        })
        await newList.save();
        const board=await Board.findOneAndUpdate(
            {
                _id:boardId
            },
            {
                $push:{list:newList._id}
            },
            {
                new:true
            }
        )
        await board.save();
        return{...newList._doc};
      
        
    }


}

