const admin=require('firebase-admin')
let serviceAccount = require("./service.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://asimmath.firebaseio.com"
  });
async function notify(){
    try{
        let val=await admin.firestore().collection('users').where("grantStatus","==","11hs").get()
        if(!val.empty){
            let docs=val.docs
            var tokenall=[]
            for(let i=0;i<docs.length;i++){
                let token=docs[i].data().notificationToken
                if(token){
                    tokenall.push(token)
                }
            }
            console.log(tokenall)
            admin.messaging().sendToDevice(tokenall,{
                data:{
                status:"Notice uploaded",
                title:"Asim roy Choudhury"
            }}).then((res)=>{
                console.log(res)
            }).catch(err=>{
                console.log(err.message)
            })
        }
        }catch(Err){
            console.log(Err.message)
        }
}
notify()
