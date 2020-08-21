const express=require('express')
const Router=express.Router()
const youtube=require('youtube-dl')
const fs=require('fs')
const path=require('path')
const admin=require('firebase-admin')
const fetch=require('node-fetch')
const {isAdmin,isVideoUser,isSessionActive} =require('../../middleware/verification')
const {checkVisibility}=require('../../middleware/videos/index')
const hosts=["localhost","asimsirmath.in"]
Router.get('/download/:id',async(req,res,next)=>{
    try{
        if(fs.existsSync(path.join(__dirname,"../../videos",`${req.params.id}.mp4`))){
            res.status(400).send({message:"File already exists"})
        }
        const video =youtube(`https://www.youtube.com/watch?v=${req.params.id}`)
        let newfilename=req.params.id
        video.pipe(fs.createWriteStream(path.join(__dirname,"../../videos",`${newfilename}.mp4`)))
        admin.firestore().collection('videos').add({link:req.params.id,date:Date.now(),title:req.params.title})
        res.status(200).send("Success")
    }catch(err){
        res.status(500).send(err.message)
    }
})

Router.get('/delete/:id/:jwt',isAdmin,(req,res,next)=>{
    try{
        let normal=path.join(__dirname,"../../videos",`${req.params.id}.mp4`)
        fs.unlinkSync(normal)
        res.status(200).send("Success")
    }catch(err){
        console.log(err)
        res.status(500).send("Some error occure in deleteing the file")
    }
})
// Router.get('/show/iamthesupermanu/:id',isVideoUser,isSessionActive,(req,res,next)=>{
//     try{
//     if(req.session.view===1){
//     const pathval = path.join(__dirname,"../../videos",`${req.params.id}.mp4`)
// 	const stat = fs.statSync(pathval)
// 	const fileSize = stat.size
//     const range = req.headers.range
// 	if (range) {
// 		const parts = range.replace(/bytes=/, "").split("-")
// 		const start = parseInt(parts[0], 10)
// 		const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1
// 		const chunksize = (end-start)+1
// 		const file = fs.createReadStream(pathval, {start, end})
// 		const head = {
// 			'Content-Range': `bytes ${start}-${end}/${fileSize}`,
// 			'Accept-Ranges': 'bytes',
// 			'Content-Length': chunksize,
//             'Content-Type': 'video/mp4'
//         }
//         console.log("I am in if")
//         res.writeHead(206, head)
//         file.pipe(res)
// 	} else {
// 		const head = {
// 			'Content-Length': fileSize,
//             'Content-Type': 'video/mp4',
//         }
//         console.log("I am in else")
// 		res.writeHead(200, head)
// 		fs.createReadStream(pathval).pipe(res)
//     }
// }else{
//     res.status(400).send({message:"video got corrupted"})
// }
// }catch(err){
//     res.status(404).send("Page not found")
// }
// })

// Router.get('/single/show/:id',checkVisibility,(req,res)=>{
//     try{
//         if(hosts.includes(req.headers.host)){
//             if(fs.existsSync(path.join(__dirname,"../../videos",`${req.params.id}.mp4`))){
//                 res.cookie('videojwt', req.session.jwt, { maxAge:3600000,httpOnly:true});
                
//                 res.render('videos/singleVideo',{id:req.params.id,error:null,
//                     host:req.headers.host,keyid:"iamthesupermanu"})
//             }else{
//                 res.render('notfound',{host:req.headers.host})
//             }
//         }else{
//             res.status(500).send("You have tempared with host")
//         }
//     }catch(err){
//         res.render('videos/singleVideo',{exists:false,error:err.message})
//     }
// })
Router.get("/single/show/:id",checkVisibility,async(req,res,next)=>{
    try{
        let val=await fetch(`https://dev.vdocipher.com/api/videos/${req.params.id}/otp`,{
            method:"POST",
            body:JSON.stringify({ttl:300}),
            headers:{
            'Authorization':`Apisecret ${process.env.VIDEO_API_KEY}`,
            'Content-Type':'application/json',
            'Accept':'application/json'
            }
        }).then((resp)=>{
            return resp.json()
        }).catch(err=>{
            return err
        })
        console.log(val.playbackInfo)
        res.render('videos/singleVideo',{otp:val.otp,playbackinfo:val.playbackInfo})
    }catch(err){
        console.error(err.message)
    }
})

//android app api specific
Router.get('/show/:id',async(req,res,next)=>{
    try{
        let val=await fetch(`https://dev.vdocipher.com/api/videos/${req.params.id}/otp`,{
            method:"POST",
            body:JSON.stringify({ttl:300}),
            headers:{
            'Authorization':`Apisecret KQ8pkHnSkTOxkz4SJDxJpsWxHPmCMdNtBHrf8jGspYo8QvGk0BLcW2SNIA8OeAsS`,
            'Content-Type':'application/json',
            'Accept':'application/json'
            }
        }).then((resp)=>{
            return resp.json()
        }).catch(err=>{
            return err
        })
        res.json({otp:val.otp,playbackinfo:val.playbackInfo})
    }catch(err){
        console.error(err.message)
        res.status(400).send("Error occured")
    }
})

//android app api for checking the user is logged in or not?
Router.get('/check/signIn/:id',async(req,res)=>{
    let val=await admin.firestore().collection("users").doc(req.params.id).get()
    if(val.exists && val.id===req.params.id){
        if(val.data().isLoggedIn){
            res.json({ signInPass: false})
        }else{
            val.ref.update({
                isLoggedIn:true
            })
            res.json({signInPass: true})
        }
    }else{
        res.json({ signInPass: false})
    }
})

//android app all videoes by user filter
Router.get("/get/all",async(req,res)=>{
    let val=await admin.firestore().collection("videos").get()
    let info=[]
    if(!val.empty){
        for (let i=0;i<val.docs.length;i++){
            info.push({
                title:val.docs[i].data().title,
                link:val.docs[i].data().link
            })
        }
        res.json(info)
    }else{
        res.json([])
    }
})

Router.get('/show/login/:id',(req,res,next)=>{
    if(req.session.videoview){
        res.redirect(`/single/show/${req.params.id}`)
    }else{
        res.render('videos/login',{id:req.params.id})
    }
})

Router.post('/api/:id/:jwt',(req,res,next)=>{
    try{
        req.session.videoview=true
        req.session.view=0
        req.session.jwt=req.params.jwt
        res.redirect(`/video/single/show/${req.params.id}`)
    }catch(err){
        res.send("error")
    }
})

Router.get("/list/all",isAdmin,(req,res)=>{
    try{
        let arr=fs.readdirSync(path.join(__dirname,"../../videos"))
        let info=[]
        let total=0
        for(let i=0;i<arr.length;i++){
            let stat=fs.statSync(path.join(__dirname,"../../videos",arr[i]))
            let size=Math.round(stat.size/(1024*1024))
            total+=size
            info.push({
                filename:arr[i],
                size
            })
        }
        res.render("videos/videoList",{total,details:info,remaining:924-total})
    }catch(err){
        console.log(err)
        if(hosts.includes(req.headers.host)){
            res.render("notfound",{host:req.headers.host})
        }else{
            res.status(400).send({message:"Bad request"})
        }
    }
})




module.exports=Router