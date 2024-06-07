const workSpace=require("../models/workSpace")
const User=require("../models/user")
const Board=require("../models/board")
const List=require("../models/list")
const Task=require("../models/task")
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
        
        let res={
            err:[],
            status:"Successfull"
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
       
        if(await Board.findOne({title:title})){
            console.log("in")
            res.err.push("there is already board with this name")
            res.status="failed";
            return {res};
        }
      
        const newBoard=new Board({
            title,
            description,
            list,
            userWithRoles,
            creator:userId,
            invitationLink,
            expiryDate
        })
        

        const board=await newBoard.save();
        WS.boards.push(newBoard._id.toString());
        await WS.save();
        return{Board:[board],res};
    },
    getBoards:async function({workSpaceId},req){
        if(!req.isAuth){
            throw new Error("not authinticated")
        }
        const WS=await workSpace.findOne({_id:workSpaceId}).populate("boards");
        let res={err:[],status:"Successfull"}
        if(!WS){
            throw new Error("no workSpace with this Id")
        }
        const userId=req.userId;
        if(!WS.members.includes(userId)){
            throw new Error("user is not in this workSpace")
        }
        const boards=WS.boards;
        if(!boards){
            res.err.push("no boards in the work space")
            res.status="Failed"
            return {res};
          //  throw new Error("no boards in the work space")
        }
        return {Board:boards,res};
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

        let res={err:[],status:"Successfull"}
        const {title,tasks,transition,allowedRoles}=inputInfo;
        const userId=req.userId;
        const WS=await workSpace.findOne({_id:workSpaceId}).populate("boards")
        if(!WS){
            res.err.push("can not found workSpace with this id")
            res.status="Failed"
            return {res}
        }
        if(!WS.boards.some(it=>it._id==boardId)){
            const error=new Error("invalid boardId or this board not in this workspace")
            error.code=400;
            throw error;
        }
        const wantedBoard = await Board.findById(boardId).populate('list', 'title');
        console.log(wantedBoard.list)
        if(wantedBoard.list.filter(it=>it.title==title).length>=1){
            res.err.push("There is already a list with this name")
            res.status="Failed"
         
            return {res}
        }
        if(!WS.admins.includes(userId)){
            res.err.push("Only admins can add lists")
            res.status="Failed"
            return {res}
        }
       
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
        return{List:newList,res};
       
    },
    deleteBoard:async function({workSpaceId,boardId},req){
        if(!req.isAuth){
            throw new Error("not authinticated")
        }
        let userId=req.userId;
        let res={err:[],status:"Successfull"}
        const WS=await workSpace.findOne({ _id:workSpaceId,boards:{$in:boardId},admins:{$in:userId}})
        if(!WS){
            res.err.push("cannot find workspace or user not an admin in this workspace or no board found")
            res.status="Failed"
            return {res}
        }
        const board=await Board.findById(boardId).select("list");
        if(!board){
            res.err.push("no board found");
            res.status="Failed";
            return {res};
        }
        //console.log(board);
        try{
        await List.deleteMany({_id:{$in:board.list}})
        await Board.findByIdAndDelete(boardId);
        let indexToremove=WS.boards.indexOf(boardId);
        if(indexToremove!==-1){
            WS.boards.splice(indexToremove, 1);
        }
        await WS.save();
        return {res};
        }catch(err){
            console.log(err);
        } 
    },
    editBoard:async function({workSpaceId,boardId,userData},req){
        if(!req.isAuth){
            throw new Error("not authinticated")
        }
        let res={err:[],status:"Successfull"}
        const userId=req.userId;
        const WS=await workSpace.findOne({ _id:workSpaceId,boards:{$in:boardId},admins:{$in:userId}}).populate("boards");
        if(!WS){
            res.err.push("cannot find workspace or user not an admin in this workspace or no board found")
            res.status="Failed"
            return {res}
        }
        const board=WS.boards.find(board=>board._id==boardId);
        const {title,userWithRoles}=userData;
      //  console.log(board)
        if(title)board.title=title;
        if(userWithRoles){
            // lsa 3ayz a tcheck lw hupdate user kan mwgod aslan w mknsh user gded
            userWithRoles.forEach(obj => {
                let newUser=obj;
              //  console.log(obj)
                board.userWithRoles.push(newUser);
            });
        }
        await board.save();
        return {Board:[board],res}
    },
    editList:async function({boardId,listId,userData},req){
        if(!req.isAuth){
            throw new Error("not authinticated")
        }
        let res={err:[],status:"Successfull"}
        const board=await Board.findOne({_id:boardId,list:{$in:listId}}).populate("list");
        if(!board){
            res.err.push("invalid boardId or listId not in this board")
            res.status="Failed"
            return {res}
        }
        let userId=req.userId;
        const checkAdmin=await workSpace.findOne({boards:{$in:boardId},admins:{$in:userId}})
        if(!checkAdmin){
            res.err.push("Only admins can edit list")
            res.status="Failed"
            return {res}
        }
        const {title,task,transition,allowedRoles}=userData;
        let listToUpdate=board.list.find(it=>it._id==listId);
        if(title){
            listToUpdate.title=title;
        }
        if(task){
            listToUpdate.task.push(...task)
        }
        if(transition){
            listToUpdate.transition.push(...transition)
        }
        if(allowedRoles){
            listToUpdate.task.push(...allowedRoles)
        }
        await listToUpdate.save();
        return{List:listToUpdate,res};
    },
    deleteList:async function({boardId,listId},req){
        if(!req.isAuth){
            throw new Error("not authinticated")
        }
        let res={err:[],status:"Successfull"}
        let userId=req.userId;
        const checkAdmin=await workSpace.findOne({boards:{$in:boardId},admins:{$in:userId}})
        if(!checkAdmin){
            res.err.push("Only admins can delete list")
            res.status="Failed"
            return {res}
        }
        const list=await List.findById(listId).populate("task")
        if(!list){
            res.err.push("No list found with this id")
            res.status="Failed"
            return {res}
        }
        try{
            await Task.deleteMany({_id:{$in:list.task}})
            await Board.findByIdAndUpdate({
                _id:boardId
            },
            {
                $pull:{list:listId}
            },
            {
                new:true
            })
            await List.deleteOne({_id:listId})
            return {res}
        }catch(err){
            console.log(err)
        }
    },
    addTask:async function({boardId,listId,userData},req){
        if(!req.isAuth){
            throw new Error("not authinticated")
        }
        let res={err:[],status:"Successfull"}
        let userId=req.userId;
         
        // get workSpace that in this board to check if user admin or not
        const WS=await workSpace.findOne({boards:{$in:boardId},admins:{$in:userId}}).populate("boards","userWithRoles");
        let checkAdmin=WS.admins.includes(userId)
        if(!checkAdmin){
            res.err.push("Only admins can add tasks");
            res.status="Failed";
            return {res};
        }
        let {title,description,curList,assignedUsers,deadline}=userData;

        const board=await Board.findOne({_id:boardId}).populate("list","title");
        //console.log(board.list);
     
       let isDuplicate=true;
       isDuplicate=board.list.map(it=>{
            if(it.title==title)return false;
        })

        if(isDuplicate){
            res.err.push("There is already a task with this title");
            res.status="Failed";
            return {res};
        }
        // console.log(WS.boards)
        
        
        // check if assignedUsers are in this workspace
        // aallUserWithRoles in array of object contains userWithRoles attributes
        const allUserWithRoles = WS.boards.flatMap(board => board.userWithRoles || []);
      //  console.log(allUserWithRoles)
        assignedUsers = assignedUsers.filter(userId =>
            allUserWithRoles.some(user => user.userId === userId)
        );

        const newTask= new Task({
            title,
            description,
            curList,
            assignedUsers,
            deadline:new Date(deadline)
        }) 
       
        let savedTask=await newTask.save();
        const addToList=await List.findOneAndUpdate(
        {
            _id:listId
        },
        {
            $push:{task:savedTask._id}
        },
        {
            new:true
        }
    )
        
       // still need to remind users
       return {Task:savedTask,res}

    },
    editTask:async function({listId,taskId,userData},req){
        if(!req.isAuth){
            throw new Error("not authinticated")
        }
        let res={err:[],status:"Successfull"}
        let userId=req.userId;

        //first getboard to get from it thw workspace to see if the user is admin or not
        let board;
        try{
         board=await Board.find({list:{$in:listId}});
        }catch(err){
            console.log(err);
        }
        const WS=await workSpace.find({boards:{$in:board._id},admins:{$in:userId}});
        if(!WS){
            res.err.push("Only admins can edit tasks");
            res.status="failed";
            return{res};
        }

        //no edit occurs
        if(!userData){
            return{res};
        }
        const{assignedUsers,toGoList,deadline}=userData;

        if(!await List.findOne({_id:listId,task:{$in:taskId}})){
            res.err.push("this task not in the listId parameter");
            res.status="failed";
            return{res};
        }
        let updateFields = {};
        if(assignedUsers){
           updateFields.$push= { assignedUsers: assignedUsers }
        }
        
        // check if this task valid to go to this list
        let oldList
        if(toGoList&&listId!=toGoList){
             oldList=await List.findOne({_id:listId,transition:{$in:toGoList}})
             if(!oldList){
                res.err.push("can not go to this list rightNow");
                res.status="failed";
                return{res};
             }
             else{
               updateFields.curList=toGoList;
             }
        }
        if(deadline){updateFields.deadline=deadline}
        
        console.log(updateFields)
        let updatedTask=await Task.findOneAndUpdate(
            {
                _id:taskId
            },
            updateFields,
            {new:true}
        )

        // remove the task from the old list and put it in the new list
        if(toGoList){
           
            const taskIndex=oldList.task.indexOf(taskId);
            if(taskIndex!==-1){
                oldList.task.splice(taskIndex, 1);
            }
            await oldList.save();
            
            const newList=await List.findOneAndUpdate(
                {
                    _id:toGoList
                },
                {
                    $push:{task:taskId}
                },
                {new:true}
            )
        }     
        return{Task:updatedTask,res}; 
    }
    

}

