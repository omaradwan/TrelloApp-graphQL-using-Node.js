const {buildSchema}=require("graphql")

module.exports=buildSchema(`

  type user{
    name:String!
    email:String!
    id:String!
    token:String!
  }
  input userInputData {
    name:String!
    email:String!
    password:String!
    confirmPassword:String!
    avatar:String
  }
  input userUpdateInput{
    email:String,
    name:String,
    password:String
  }
  type rootMutation {
    signup(userInput:userInputData):user!
    login(email:String!,password:String!):user!
    edit(userId:String!,updates:userUpdateInput!):user!
    forgetPassword(userId:String!,email:String!):String!
    resetPassword(email:String!,newPassword:String!):user!
    checkVerification(email:String!,code:String!):Boolean!
  }
  type rootQuery{
    name:String!
  }
  schema{
    query:rootQuery
    mutation:rootMutation
  }
`)
