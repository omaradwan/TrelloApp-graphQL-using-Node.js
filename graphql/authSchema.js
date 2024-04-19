const {buildSchema}=require("graphql")

module.exports=buildSchema(`

  type user{
    name:String!
    email:String!
    id:String!
  }
  input userInputData {
    name:String!
    email:String!
    password:String!
    confirmPassword:String!
    avatar:String
  }
  type rootMutation {
    signup(userInput:userInputData):user!
    login(email:String!,password:String!):user!
  }
  type rootQuery{
    name:String!
  }
  schema{
    query:rootQuery
    mutation:rootMutation
  }
`)
