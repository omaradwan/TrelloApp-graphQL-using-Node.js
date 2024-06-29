const express=require("express");
const mongoose=require("mongoose");
const {graphqlHTTP}=require("express-graphql")
const authSchema = require('./graphql/authSchema')
const authResolver = require('./graphql/authResolver');
const userServiceResolver = require("./graphql/userServiceResolver");
const userServiceSchema = require('./graphql/userServiceSchema');
const middles=require("./middlewar/helper")
const {verifyToken}=require("./middlewar/helper");
const multer=require("multer");


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let destinationFolder = '';
          const fileType = file.mimetype.split('/')[0];
      if (fileType === 'image') {
        destinationFolder = 'uploads';
      } else {
        return cb(new Error('Unsupported file'), null);
      }
         cb(null, destinationFolder);
      },
  
  
     filename: (req, file, cb) => {     
      const ext = file.mimetype.split('/')[1];
         const fileName = `${req.userId}.${ext}`;
          cb(null, fileName); // Set the filename
      },
  });
  
  
  const fileFilter = (req, file, cb) => {
      const fileType = file.mimetype.split("/")[0];
    if (fileType === "image" || fileType === "audio") {
      return cb(null, true);
    } else {
      return cb(new Error("Invalid file type"), false);
    }
  };
  
  const upload = multer({
      storage:storage,
      fileFilter
  })



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

app.post('/profile',verifyToken,upload.single('avatar'),middles.setImage)
app.use('/graphql/auth',graphqlHTTP({
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
