const {buildSchema}=require("graphql")

module.exports=buildSchema(`
 
  type workSpace{
    title:String!
    creator:String!
    members:[String!]!
  }
  
  input userInputData{
    title:String!
    members:[String!]
    boards:[String!]
    admins:[String!]
    isPublic:Boolean
  }

  
  
  type InviteResponse{
    success: Boolean!
    message: String
    workSpace:workSpace
  }


  input listData{
    title:String!
    tasks:[String!]
    transition:[String!]
    allowedRoles:[String!]
  }
  type listRes{
    List:list
    res:Res!
  }
  type list{
    title: String!
    allowedRoles: [String]
  }
  input editDataList{
    title:String
    task:[String!]
    transition:[String!]
    allowedRoles:[String!]
  }



  input InputDataBoard {
    title: String!
    description: [String!]
    list: [String!]
    userWithRoles: [UserWithRoleInput!]!  
    invitationLink: String
    expiryDate: String
  }
  input editDataBoard{
    title: String
    userWithRoles: [UserWithRoleInput!]
  }
  input UserWithRoleInput {
    userId: String!
    role: String!
  }
  type boardRes{
    Board:[board]
    res:Res!
  }
  type board{
    title:String!
    creator:String!
  }


  input InputDataTask{
    title:String!
    description:String!
    curList:String!
    assignedUsers:[String!]
    deadline:String!
  }
  type taskRes{
    Task:task
    res:Res!
  }
  type task{
    title:String!
    description:String
    curList:String!
    assignedUsers:[String!]
    deadline:String!
  }

  type Res{
    err:[String]!
    status:String!
  }

  
  type rootMutation{
    
    createWorkSpace(userData:userInputData!):workSpace!
   
    addAdmin(workSpaceId:String!,userTobeAdded:String!):workSpace!
    addUser(userId:String!,workSpaceId:String!):workSpace!
    removeUser(userId:String!,workSpaceId:String!):String!
    inviteUser(email:String!,workSpaceId:String!):String!
    
    receiveInvitaion(userId:String!,link:String!):InviteResponse!

     
    createBoard(workSpaceId:String!,userData:InputDataBoard!):boardRes!
    editBoard(workSpaceId:String!,boardId:String!,userData:editDataBoard!):boardRes!
    deleteBoard(workSpaceId:String!,boardId:String!):boardRes!

    createList(inputInfo:listData,workSpaceId:String!,boardId:String):listRes!
    editList(boardId:String!,listId:String!,userData:editDataList!):listRes!
    deleteList(boardId:String!,listId:String!):listRes!

    addTask(boardId:String!,listId:String!,userData:InputDataTask):taskRes!
    
  }
  type rootQuery{
    getWorkSpace(id:String!):workSpace!
    getMembers(workSpaceId:String!):workSpace!
    getBoards(workSpaceId:String!):boardRes!
    getAllWorkSpaces(id:String!):[workSpace!]!

  }
  schema{
    query:rootQuery
    mutation:rootMutation
  }
`)