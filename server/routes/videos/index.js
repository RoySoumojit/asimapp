const express=require('express')
const Router=express.Router()
const fs=require('fs')
const path=require('path')
const admin=require('firebase-admin')
const fetch=require('node-fetch')
const {isAdmin} =require('../../middleware/verification')
const {checkVisibility}=require('../../middleware/videos/index')
const hosts=["localhost","asimsirmath.in"]


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