const express=require("express");
const mongoose=require("mongoose");
const {graphqlHTTP}=require("express-graphql")
const authSchema = require('./graphql/authSchema')
const authResolver = require('./graphql/authResolver');
const userServiceResolver = require("./graphql/userServiceResolver");
const userServiceSchema = require('./graphql/userServiceSchema');
const middles=require("./middlewar/helper")



require("dotenv").config();
const app=express();


const url=process.env.MONGO_URL
const port=process.env.PORT;
mongoose.connect(url)
.then(()=>{
    console.log("connected to db")
})
.catch(()=>{
    console.log("error with db")
})

app.use(middles.verifyToken)

app.use('/graphql/auth', graphqlHTTP({
    schema: authSchema,
    rootValue: authResolver,
    graphiql: true,
    customFormatErrorFn(err){
        if(!err.originalError){
            return err;
        }
        else{
           const data=err.originalError.data;
           const message=err.originalError.message;
           const code=err.originalError.code;
           return{message:message,code:code,data:data}
        }
    }
}))
app.use('/graphql/user', graphqlHTTP({
    schema: userServiceSchema,
    rootValue: userServiceResolver,
    graphiql: true,
    customFormatErrorFn(err){
        if(!err.originalError){
            return err;
        }
        else{
           const data=err.originalError.data;
           const message=err.originalError.message;
           const code=err.originalError.code;
           return{message:message,code:code,data:data}
        }
    }
}))



app.listen(port,()=>{
    console.log("in server")
})
