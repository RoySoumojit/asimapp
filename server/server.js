const express=require('express')
const app=express()
const path=require('path')
var cors = require('cors')
const helmet=require('helmet')
let admin = require("firebase-admin");
const session=require('express-session')
const cookieParser = require('cookie-parser')


if(process.env.NODE_ENV==="production"){

}else{
    require('dotenv').config()
}

//All files requirement
let serviceAccount = require("./service.json");
const authRoute=require('./routes/auth/auth')
var bodyParser = require('body-parser')
const csvdata=require('./routes/csvdata')
const examwbjee=require('./routes/exam/wbjee')
const examjeemain=require('./routes/exam/jeemain')
const examhs=require('./routes/exam/hs')
const cloudfunc=require("./routes/cloud/index")
const {isAdmin}=require("./middleware/verification/index")
let videos=require('./routes/videos')


//session middleware

app.use(session({
    secret: 'iamsupermanubatman',
    resave: false,
    saveUninitialized: false,
    cookie:{expires:new Date(Date.now()+10800000),maxAge:10800000}
  }))


//some security middleware
app.disable('x-powered-by');
app.use(helmet.xssFilter())
app.use(helmet.frameguard({ action: 'sameorigin' }))
app.use(helmet.dnsPrefetchControl({allow:false}))
// app.use(helmet.hsts())

//cookies parsing
app.use(cookieParser())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 // parse application/json
app.use(bodyParser.json())
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://asimmath.firebaseio.com",
});
app.use(cors())

//for react files middleware
app.use(express.static(path.join(__dirname,"../client","mainclient","build")))
app.use("/exam",express.static(path.join(__dirname,"../client","examclient","build")))
app.use('/practice',express.static(path.join(__dirname,"../client","practiceclient","build")))

app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,"views"));
//Routes for authentication
app.use('/auth',authRoute)
//Routes for Csv file
app.use('/csvfile',csvdata)
//Routes for examination
app.use('/wbjee',examwbjee)
app.use('/jeemain',examjeemain)
app.use('/hs',examhs)
app.use('/cloud',cloudfunc)
app.use('/video',videos)

app.get('/video/script',(req,res)=>{
    res.sendFile(path.join(__dirname,"views","videos","scripts","app.js"))
})
app.get('/userDelete/:id/:jwt',isAdmin,async(req,res)=>{
    let id=req.params.id
    try{
        await admin.auth().deleteUser(id)
        let doc=await admin.firestore().collection('users').doc(id).get()
        try{
            let imageurlpath=doc.data().imageurlpath
            let tempimagepath=imageurlpath.slice(1,)
            admin.storage().bucket().deleteFiles({
                prefix:tempimagepath
            })
        }catch(err){

        }
        doc.ref.delete()
        await admin.firestore().collection('payments').doc(id).delete()
        let tempattend=await admin.firestore()
        .collection('attendence')
        .where('id',"==",id).get()
        tempattend.forEach((doc)=>{
            doc.ref.delete()
        })
        let tempresult=await admin.firestore()
        .collection('results')
        .where('id',"==",id).get()
        tempresult.forEach((doc)=>{
            doc.ref.delete()
        })
        let tempfair=await admin.firestore()
        .collection('faircopy')
        .where('id','==',id).get()
        tempfair.forEach((doc)=>{
            doc.ref.delete()
        })
        res.status(200).send("Successfully deleted")
    }catch(err){
        res.status(400).send("Error occured:"+err.message)
    }
})

app.post("/update/user",(req,res)=>{
    try{
        let profile=req.body.profile
        let uid=req.body.uid
        admin.firestore().collection("users").doc(uid).update({
            ...profile
        })
        res.status(200).send({message:"successfully done"})
    }catch(err){
        res.status(500).send({message:err.message})
    }
})


app.get('/practice/*',(req,res)=>{
    res.sendFile(path.join(__dirname,"../client","practiceclient",'build','index.html'))
})

app.get('/exam/*',(req,res)=>{
    res.sendFile(path.join(__dirname,"../client","examclient",'build','index.html'))
})
app.get('*',(req,res)=>{
    res.sendFile(path.join(__dirname,"../client","mainclient","build",'index.html'))
})
app.listen(process.env.PORT||5000,()=>{
    console.log("Server is listening")
})