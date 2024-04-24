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
    creator: String!
    invitationLink: String
    expiryDate: String
  }
  input UserWithRoleInput {
    userId: String!
    role: String!
  }
  
  
  type board{
    workSpace:workSpace
    title:String!
    creator:String!
  }
  
  type rootMutation{
    createWorkSpace(userData:userInputData!):workSpace!
    addAdmin(workSpaceId:String!,userTobeAdded:String!):workSpace!
    addUser(userId:String!,workSpaceId:String!):workSpace!
    removeUser(userId:String!,workSpaceId:String!):String!

     
    createBoard(workSpaceId:String!,userData:InputDataBoard!):board!
    
  }
  type rootQuery{
    getWorkSpace(id:String!):workSpace!
    getMembers(workSpaceId:String!):workSpace!
    getBoards(workSpaceId:String!):[board!]!

  }
  schema{
    query:rootQuery
    mutation:rootMutation
  }
`)