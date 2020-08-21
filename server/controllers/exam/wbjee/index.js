const admin=require('firebase-admin')
const {randomArrayWb} =require('../../../utils/array/index')
const jwt=require('jsonwebtoken')
const {encrypt,decrypt} =require('../../../utils/crytography/index')
function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
  }

exports.getAllData=async(req,res,next)=>{
    try{
        let pref=req.pref
        req.session.userpref=req.pref
        let val=await admin.firestore().collection('wbjeequestions')
        .where("examcatagory","==",pref)
        .get()
        let temp=[]
        let docs=val.docs
        if(!val.empty){
            for(let i=0;i<docs.length;i++){
                temp.push({id:docs[i].id,...docs[i].data()})
            }
            let response=randomArrayWb(temp)
            let encanswer1=encrypt(JSON.stringify(response.answer1))
            let encanswer2=encrypt(JSON.stringify(response.answer2))
            let encanswer3=encrypt(JSON.stringify(response.answer3))
            let token=
            jwt.sign({answer1:encanswer1,answer2:encanswer2,answer3:encanswer3,uid:req.uid},process.env.JWT_SECRET,{expiresIn:"3h"})
            res.status(200).json({
                questions1:response.catagory1,
                questions2:response.catagory2,
                questions3:response.catagory3,
                token:token
            })
        }else{
            res.status(400).json({message:"No data found"})
        }
    }catch(err){
        res.status(500).json({message:err.message})
    }
}

exports.getCountOfData=async(req,res,next)=>{
    try{
        let val=await admin.firestore().collection('wbjeequestions')
        .where("examcatagory","==",req.pref)
        .get()
        if(!val.empty){
            let docs=val.docs
            let cat1=0
            let cat2=0
            let cat3=0
            for(let i=0;i<docs.length;i++){
                if(docs[i].data().catagory===1){
                    cat1++;
                }else if(docs[i].data().catagory===2){
                    cat2++;
                }else{
                    cat3++;
                }
            }
            res.status(200).json({data:{
                cat1,cat2,cat3
            }})
        }else{
            res.status(400).json({message:"Empty data"})
        }
    }catch(err){
        res.status(500).json({message:err.message})
    }
}


const calculateCatagory1=(original,user)=>{
    let pos=0
    let neg=0
    let outof=0
    if(original.length===user.length){
        for(let i=0;i<original.length;i++){
            if(original[i].id===user[i].id){
                if(original[i].answer[0].toLowerCase()===user[i].answer[0]){
                    pos+=1
                }else{
                    if(user[i].answer[0]){
                        neg-=0.25
                    }
                }
                outof+=1
            }
        }
        return {
            pos,
            neg,
            total:pos+neg,
            outof
        }
    }else{
        return null
    }
}

const calculateCatagory2=(original,user)=>{
    let pos=0
    let neg=0
    let outof=0
    if(original.length===user.length){
        for(let i=0;i<original.length;i++){
            if(original[i].id===user[i].id){
                if(original[i].answer[0]===user[i].answer[0]){
                    pos+=2
                }else{
                    if(user[i].answer[0]){
                        neg-=0.50
                    }
                }
                outof+=1
            }
        }
        return {
            pos,
            neg,
            total:pos+neg,
            outof:outof*2
        }
    }else{
        return null
    }
}
const calculateCatagory3=(original,user)=>{
    let pos=0
    let outof=0
    if(original.length===user.length){
        for(let i=0;i<original.length;i++){
            if(original[i].id===user[i].id){
                for(let j=0;j<original[i].answer.length;j++){
                    let len=original[i].answer.length
                    let item=original[i].answer[j]
                    if(user[i].answer.includes(item)){
                        pos+=((1/len)*2)
                    }
                }
                outof+=1
            }
        }
        return {
            pos,
            total:pos,
            outof
        }
    }else{
        return null
    }
}
exports.calculate=async(req,res)=>{
    try{
    let bodyanswer=req.body.answer
    let answer=req.answer
    let answer1val=calculateCatagory1(answer.answer1,bodyanswer.answer1)
    let answer2val=calculateCatagory2(answer.answer2,bodyanswer.answer2)
    let answer3val=calculateCatagory3(answer.answer3,bodyanswer.answer3)
    let temp={}
    for(let i=0;i<bodyanswer.answer1.length;i++){
        temp[bodyanswer.answer1[i].id]=
        {
            answer:bodyanswer.answer1[i].answer,
            catagory:1
        }
    }
    for(let i=0;i<bodyanswer.answer2.length;i++){
        temp[bodyanswer.answer2[i].id]={answer:bodyanswer.answer2[i].answer,catagory:2}
    }
    for(let i=0;i<bodyanswer.answer3.length;i++){
        temp[bodyanswer.answer3[i].id]={answer:bodyanswer.answer3[i].answer,catagory:3}
    }
    req.session.userwbjeeanswer=temp
    let wbjeescore =  answer1val.total+answer2val.total+answer3val.total
    let wbjeeoutof = answer1val.outof+answer2val.outof+answer3val.outof
    await admin.firestore().collection("users").doc(req.uid).update({
            examenable:false,
            wbjeescore:wbjeescore,
            wbjeeoutof:wbjeeoutof,
            wbjeeper:round((wbjeescore/wbjeeoutof)*100,2)
        })
    res.status(200).json({
        catagory1:answer1val,
        catagory2:answer2val,
        catagory3:answer3val
    })
}
    catch(err){
        res.status(400).json({message:err.message})
    }
}

exports.displayAnswerSheet=async(req,res)=>{
    try{
        let userwbjeeanswer=req.session.userwbjeeanswer
        if(!userwbjeeanswer){
            res.render('wbjee/resultTable',{answer:null,error:"No user data found"})
        }else{
            let val=await admin.firestore()
            .collection("wbjeequestions")
            .where("examcatagory","==",req.session.userpref)
            .orderBy("catagory")
            .get()
            if(!val.empty){
                let temp=[]
                let docs=val.docs
                let total=0
                for(let i=0;i<docs.length;i++){
                    let useranswer=userwbjeeanswer[docs[i].id].answer
                    let original=docs[i].data().answer
                    let score=0
                    if(docs[i].data().catagory===1){
                        if(!useranswer[0]){
                            score+=0
                        }else if(original[0].toLowerCase()===useranswer[0].toLowerCase()){
                            score+=1
                        }else{
                            score-=0.25
                        }
                    }else if(docs[i].data().catagory===2){
                        if(!useranswer[0]){
                            score+=0
                        }else if(original[0].toLowerCase()===useranswer[0].toLowerCase()){
                            score+=2
                        }else{
                            score-=0.50
                        }
                    }else{
                        if(useranswer.length<=0){
                            score+=0
                        }else{
                            let len=original.length
                            for(let j=0;j<original.length;j++){
                                let item=original[j].toLowerCase()
                                if(useranswer.includes(item)){
                                    score+=((1/len)*2)   
                                }
                            }
                        }
                    }
                    total+=score
                    temp.push({
                        questionText:docs[i].data().text,
                        questionImage:docs[i].data().image,
                        actualAnswer:original.join(','),
                        givenAnswer:useranswer.join(','),
                        catagory:docs[i].data().catagory,
                        score:score
                    })
                }
                res.render('wbjee/resultTable',{answer:temp,error:null,total:total})
            }else{
                res.render('wbjee/resultTable',{answer:null,error:"No data found"})
            }
        }
    }catch(err){
        res.render('wbjee/resultTable',{answer:null,error:err.message})
    }
}