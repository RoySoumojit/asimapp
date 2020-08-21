const csv=require('fast-csv')
const fs=require('fs')
const express=require('express')
const Router=express.Router()
const {isAdmin}=require('../../middleware/verification')
const admin=require('firebase-admin')
const path=require('path')
Router.get("/payment/:jwt",isAdmin,async(req,res)=>{
    try{
        let val=await admin.firestore().collection('payments').get()
        if(!val.empty){
            let valdocs=val.docs
            let i=0
            let info=[["#","email","batchno","fees running month","april","may","june","july","august","september","october","november","december","january","february","march"]]
            for(;i<valdocs.length;i++){
                let valdoc=valdocs[i].data()
                console.log(valdoc)
                info.push([i,valdoc.email,valdoc.batchno,valdoc.fees,parseInt(valdoc.april.amount),parseInt(valdoc.may.amount),
                parseInt(valdoc.jun.amount),parseInt(valdoc.july.amount),parseInt(valdoc.aug.amount),
                parseInt(valdoc.sept.amount),parseInt(valdoc.oct.amount),parseInt(valdoc.nov.amount),
                parseInt(valdoc.dec.amount),parseInt(valdoc.jan.amount),parseInt(valdoc.feb.amount),parseInt(valdoc.march.amount)
            ])
            }
            let response=UserPaymentCSVExport(info)
            if(response.status==200){
                let date=new Date()
                res.set('Content-Disposition',`attachment; filename=payment_${date.getDate()}_${date.getMonth()+1}_${date.getFullYear()}.csv`)
                res.set('Content-Type', 'text/csv');
                var data=fs.createReadStream(path.join(__dirname,"payment.csv"),'utf8')
                data.pipe(res)
            }else{
                res.status(500).send(response.message)
            }
        }else{
            res.status(500).send("Payment section is empty")
        }
    }catch(err){

    }
})

Router.get('/userInfo/:jwt',isAdmin,async(req,res)=>{
    try{
        let info=[["#","email","batchno","password",
        "name","class","batch time","address",
        "preference","new school","oldschool","class 10 marks","class 12 marks","father name",
        "fether occupation","father phonenumber","mother name",
        "mother occupation","mother phonenumber"]]
        let val=await admin.firestore().collection('users').get()
        if(!val.empty){
            let valdocs=val.docs
            for(let i=0;i<valdocs.length;i++){
                let d=valdocs[i].data()
                info.push([i,d.email,d.batchno,d.password,d.name,d.class,d.batchtime,
                    d.address,d.grantStatus,d.newschool,d.oldschool,d.total10,d.total12,d.fathername,
                    d.fatheroccupation,d.fatherphno,d.mothername,d.motheroccupation,d.motherphno])
            }
            let response=UserInfoCSVExport(info)
            if(response.status==200){
                let date=new Date()
                res.set('Content-Disposition',`attachment; filename=asimmath_userinfo_${date.getDate()}_${date.getMonth()+1}_${date.getFullYear()}.csv`)
                res.set('Content-Type', 'text/csv');
                var data=fs.createReadStream(path.join(__dirname,"userinfo.csv"),'utf8')
                data.pipe(res)
            }else{
                res.status(500).send(response.message)
            }
        }else{
            res.status(404).send("No user record found")
        }
    }catch(err){
            res.status(500).send("Error occured: "+err.message)
    }
})

function UserPaymentCSVExport(info){
    try{
        let ws=fs.createWriteStream(path.join(__dirname,'payment.csv'))
        csv.write(info,{headers:true})
        .pipe(ws)
        return{
            status:200,
            message:"Ok"
        }
    }catch(err){
        return{
            status:400,
            message:"Error occured:"+err.message
        }
    }
}
function UserInfoCSVExport(info){
    try{
        let ws=fs.createWriteStream(path.join(__dirname,'userinfo.csv'))
        csv.write(info,{headers:true})
        .pipe(ws)
        return{
            status:200,
            message:"Ok"
        }
    }catch(err){
        return{
            status:400,
            message:"Error occured:"+err.message
        }
    }
}


module.exports=Router