const admin=require('firebase-admin')
const { isUser } = require('../../middleware/verification')
const Router=require('express').Router()

Router.post("/prefference",isUser,async(req,res)=>{
    try{
    let uid=req.body.uid
    let changeString=req.body.preff
    if(uid){
        if(changeString==="11hs"){
            admin.auth().setCustomUserClaims(uid,{preference:"hs11"})
        }else if(changeString==="12hs"){
            admin.auth().setCustomUserClaims(uid,{preference:"hs12"})
        }else if(changeString==="11joint"){
            admin.auth().setCustomUserClaims(uid,{preference:"joint11"})
        }
        else if(changeString==="12joint"){
            admin.auth().setCustomUserClaims(uid,{preference:"joint12"})
        }
        else if(changeString==="11and12joint"){
            admin.auth().setCustomUserClaims(uid,{preference:"joint11and12"})
        }
        else if(changeString==="11and12hs"){
            admin.auth().setCustomUserClaims(uid,{preference:"hs11and12"})
        }
        else{
            
        }
    }
    res.status(200).send("Successfully done")
}catch(err){
    res.status(400).send(err.message)
}
})

Router.post("/fees/update",isUser,async(req,res)=>{
    try{
        let fees=req.body.fees
        let uid=req.body.uid
        admin.firestore().collection('payments').doc(uid).update({
            fees
        })
        res.status(200).send("Successfully done")
    }catch(err){
        res.status(400).send(err.message)
    }
})

Router.post("/payments/uid",isUser,async(req,res)=>{
    try{
        let uid=req.body.uid
        let batchno=req.body.batchno
        admin.firestore().collection('payments').doc(uid).update({
            batchno
        })
    }catch(Err){

    }
})

Router.post("/create/user",isUser,async(req,response)=>{
    let uid=req.body.uid
    let changeString=req.body.preff
    let email=req.body.email
    let batchno=req.body.batchno
    let fees=req.body.fees
    if(uid){
        if(changeString==="11hs"){
            admin.auth().setCustomUserClaims(uid,{preference:"hs11"})
        }else if(changeString==="12hs"){
            admin.auth().setCustomUserClaims(uid,{preference:"hs12"})
        }else if(changeString==="11joint"){
            admin.auth().setCustomUserClaims(uid,{preference:"joint11"})
        }
        else if(changeString==="12joint"){
            admin.auth().setCustomUserClaims(uid,{preference:"joint12"})
        }
        else if(changeString==="11and12joint"){
            admin.auth().setCustomUserClaims(uid,{preference:"joint11and12"})
        }
        else if(changeString==="11and12hs"){
            admin.auth().setCustomUserClaims(uid,{preference:"hs11and12"})
        }
        else{
            
        }
    }
    try{
    
    await admin.firestore().collection('payments').doc(uid)
        .set({
            email,
            batchno,
            fees,
            april:{
                amount:0,
                flag:false
            },
            may:{
                amount:0,
                flag:false
            },
            jun:{
                amount:0,
                flag:false
            },
            july:{
                amount:0,
                flag:false
            },
            aug:{
                amount:0,
                flag:false
            },
            sept:{
                amount:0,
                flag:false
            },
            oct:{
                amount:0,
                flag:false
            },
            nov:{
                amount:0,
                flag:false
            },
            dec:{
                amount:0,
                flag:false
            },
            jan:{
                amount:0,
                flag:false
            },
            feb:{
                amount:0,
                flag:false
            },
            march:{
                amount:0,
                flag:false
            }
        })
        response.status(200).send("Succssfully done!!")
    }catch(err){
        console.error(err.message)
        response.status(400).send(err.message)
    }
})

module.exports=Router
