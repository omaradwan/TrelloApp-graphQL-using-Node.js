const express=require("express");
const mongoose=require("mongoose");
const {graphqlHTTP}=require("express-graphql")
const path=require("path");
const authSchema = require('./graphql/authSchema')
const authResolver = require('./graphql/authResolver');
const userServiceResolver = require("./graphql/userServiceResolver");
const userServiceSchema = require('./graphql/userServiceSchema');
const middles=require("./middlewar/helper")
const {verifyToken}=require("./middlewar/helper");
const multer=require("multer");
const io=require("./middlewar/socket");
const User=require('./models/user')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let destinationFolder = '';
          const fileType = file.mimetype.split('/')[0];
      if (fileType === 'image') {
        destinationFolder = 'uploads';
      }else if (fileType === 'audio') {
        destinationFolder = 'audio';
      }  else {
        return cb(new Error('Unsupported file'), null);
      }
         cb(null, destinationFolder);
      },
  
  
     filename: async(req, file, cb) => {   
      if(!req.isAuth){
        const err = new Error("Not authenticated");
        err.status = 401; 
         cb(err);
      }  
      if(req.body.destination&&req.body.destination=='audio'){
        let date=new Date();
        const ext = file.mimetype.split('/')[1];
        const fileName = `${req.userId}-${date.getDate()}.${ext}`;
         cb(null, fileName); // Set the filename
      }
      else if(req.body.destination&&req.body.destination=='image'){
      const ext = file.mimetype.split('/')[1];
         const fileName = `${req.userId}.${ext}`;

         let user=await User.findById(req.userId);
         user.profilePic=fileName;
         await user.save();

          cb(null, fileName); // Set the filename
      }
      else{
        const err = new Error("destination is messing");
        err.status = 401; 
         cb(err);
      }
    }
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

app.post('/profile',verifyToken,upload.single('avatar'),(req,res,next)=>{
    return res.status(200).json({msg:"files uploaded successfully"});
})


app.use('/api/profile/uploads',verifyToken,(req,res,next)=>{
    res.setHeader("Content-Type","image/png"),
    next();
},express.static(path.join("uploads")))

app.use('/api/profile/audio', verifyToken, (req, res, next) => {
    res.setHeader("Content-Type", "audio/mp3");
    next();
}, express.static(path.join( 'audio')));

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



const server=app.listen(port);
io.initSocket(server);
io.getIO().on("connection",io.Connection);

