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

  input InputDataBoard {
    title: String!
    description: [String!]
    list: [String!]
    userWithRoles: [UserWithRoleInput!]!  
    invitationLink: String
    expiryDate: String
  }
  input UserWithRoleInput {
    userId: String!
    role: String!
  }
  input listData{
    title:String!
    tasks:[String!]
    transition:[String!]
    allowedRoles:[String!]
  }
  
  type InviteResponse{
    success: Boolean!
    message: String
    workSpace:workSpace
  }


 
  type listRes{
    List:list
    res:Res!
  }
  type list{
    title: String!
    allowedRoles: [String]
  }

  type boardRes{
    Board:[board]
    res:Res!
  }
  type board{
    title:String!
    creator:String!
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
    createList(inputInfo:listData,workSpaceId:String!,boardId:String):listRes!
    
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