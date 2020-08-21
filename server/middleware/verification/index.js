const admin=require('firebase-admin')
const {getDbAccess}=require('../../utils/prefference/index')
exports.isAdmin=async(req,res,next)=>{
    try{
        let cjwt=req.cookies.userjwt
        let pjwt=req.params.jwt
        if(pjwt){
            let decoded=await admin.auth().verifyIdToken(pjwt)
            if(decoded.admin){
                next()
            }else{
                res.status(500).send("You are not a admin")
            }
        }else{
            let decoded=await admin.auth().verifyIdToken(cjwt)
            if(decoded.admin){
                next()
            }else{
                res.status(500).send("You are not a admin")
            }
        }
        
    }catch(err){
        res.status(500).send("Give a valid token")
    }
}

exports.isUser=async(req,res,next)=>{
    try{
        let jwt=req.cookies.userjwt
        let decoded=await admin.auth().verifyIdToken(jwt)
        if(decoded.admin){
            next()
        }
        else if(decoded.uid){
            let prefference=decoded.preference
            let pref=getDbAccess(prefference)
            if(pref==="None"){
                res.status(400).json({message:"Bad request"})
            }else{
                req.pref=pref
                req.uid=decoded.uid
                next()
            }
        }else{
            res.status(400).json({message:"Invalid token"})
        }
    }catch(err){
        res.status(400).json({message:err.message})
    }
}

exports.isSessionActive=(req,res,next)=>{
    try{
        if(req.session.view===undefined){
            res.redirect(`/video/single/show/${req.params.id}`)
        }else if(req.session.view===1){
            next()
        }else{
            res.status(400).send({message:"Video is fetched twice"})
        }
    }catch(err){

    }
}
exports.isVideoUser=async(req,res,next)=>{
        let userjwt=req.cookies.userjwt
        let videojwt=req.cookies.videojwt
        if(req.session.view===undefined){
            res.status(400).send({message:"Video got corrupted"})
        }else if(req.session.view===1){
        if(userjwt){
            try{
            let decoded=await admin.auth().verifyIdToken(userjwt)
            if(decoded.uid){
                next()
            }else{
                res.status(404).send({message:"Not found"})
            }
            }catch(err){
                if(videojwt){
                try{
                    let decoded=await admin.auth().verifyIdToken(videojwt)
                    if(decoded.uid){
                        next()
                    }else{
                        res.status(404).send({message:"Not found"})
                    }
                }catch(err){
                    res.status(404).send({message:"Not found"})
                }
            }else{
                res.status(404).send({message:"Not found"})
            }
            }
        }else{
            try{
                let decoded=await admin.auth().verifyIdToken(videojwt)
                if(decoded.uid){
                    next()
                }else{
                    res.status(404).send({message:"Not found"})
                }
            }catch(err){
                res.status(404).send({message:"Not found"})
            }
        }
    }else{
        res.render('notfound',{host:req.headers.host})
    }
}
exports.isExamEnable=async(req,res,next)=>{
    try{
        let doc=await admin.firestore().collection("users").doc(req.uid).get()
        if(doc.exists){
            let enable=doc.data().examenable
            if(enable){
                next()
            }else{
                res.status(400).json({message:"You have no permission to give exam"})
            }
        }else{
            res.status(400).json({message:"Uid is not valid"})
        }
    }catch(err){

    }
}
