const express=require("express");
const mongoose=require("mongoose");
const {graphqlHTTP}=require("express-graphql")
const authSchema = require('./graphql/authSchema')
const authResolver = require('./graphql/authResolver')

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

app.use((err,req,res,next)=>{
    console.log(err)
    const msg=err.message;
    const status=err.code||500;
    return res.status(status).json(msg)
})


app.listen(port,()=>{
    console.log("in server")
})
