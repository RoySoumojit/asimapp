const admin=require('firebase-admin')
const {randomArrayJe} =require('../../../utils/array/index')
const jwt=require('jsonwebtoken')
const {encrypt} =require('../../../utils/crytography/index');
function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
  }
  
exports.getAllData=async(req,res,next)=>{
    try{
        let pref=req.pref
        req.session.userpref=req.pref
        let val=await admin.firestore().collection('hsquestions')
        .where("examcatagory","==",pref)
        .get()
        let temp=[]
        let docs=val.docs
        if(!val.empty){
            for(let i=0;i<docs.length;i++){
                temp.push({id:docs[i].id,...docs[i].data()})
            }
            let response=randomArrayJe(temp)
            let answer=encrypt(JSON.stringify(response.answer))
            let token=
            jwt.sign({answer:answer,uid:req.uid},process.env.JWT_SECRET,{expiresIn:"3h"})
            res.status(200).json({
                question:response.question,
                token:token
            })
        }else{
            res.status(400).json({message:"No data found"})
        }
    }catch(err){
        res.status(500).json({message:err.message})
    }
}

exports.calculate=async(req,res)=>{
    try{    
        let answer=req.answer
        let useranswer=req.body.answer
        let pos=0
        let neg=0
        let outof=0
        if(answer.length===useranswer.length){
            for(let i=0;i<answer.length;i++){
                if(answer[i].answer[0].toLowerCase()===useranswer[i].answer[0]){
                    pos+=4
                }else{
                    if(useranswer[i].answer[0]){
                        neg-=1
                    }
                }
                outof+=4
            }
            await admin.firestore().collection("users").doc(req.uid).update({
                examenable:false,
                hsscore:pos+neg,
                hsoutof:outof,
                hsper:round(((pos+neg)/outof)*100,2)
            })
            let temp={}
            for(let i=0;i<useranswer.length;i++){
                temp[useranswer[i].id]={answer:useranswer[i].answer[0]||"Not answered"}
            }
            req.session.userhsanswer=temp
            res.status(200).json({
                pos,
                neg,
                outof
            })
        }else{
            res.status(400).json({message:"Something went wrong"})
        }
    }catch(err){

    }
}

exports.displayAnswerSheet=async(req,res)=>{
    try{
        let useranswer=req.session.userhsanswer
        console.log(useranswer)
        if(!useranswer){
            res.render('hs/resultTable',{answer:null,error:"No user data found"})
        }else{
        let val=await admin.firestore().collection("hsquestions")
        .where("examcatagory","==",req.session.userpref)
        .get()
        let temp=[]
        let total=0
        if(!val.empty){
            for(let i=0;i<val.docs.length;i++){

                temp.push({
                    questionImage:val.docs[i].data().image,
                    questionText:val.docs[i].data().text,
                    actaulAnswer:val.docs[i].data().answer[0].toLowerCase(),
                    givenAnswer:useranswer[val.docs[i].id].answer,
                    score:(val.docs[i].data().answer[0].toLowerCase()===useranswer[val.docs[i].id].answer)
                    ?4:useranswer[val.docs[i].id].answer==="Not answered"?0:-1
                })
                if(val.docs[i].data().answer[0].toLowerCase()===useranswer[val.docs[i].id].answer){
                    total+=4
                }else{
                    if(useranswer[val.docs[i].id].answer!=="Not answered"){
                        total-=1
                    }
                }
            }
            
            res.render('hs/resultTable',{answer:temp,error:null,total:total})
        }else{
            res.render('hs/resultTable',{answer:null,error:"No data found"})
        }
    }
    }catch(Err){
        res.render('hs/resultTable',{answer:null,error:Err.message})
    }
}