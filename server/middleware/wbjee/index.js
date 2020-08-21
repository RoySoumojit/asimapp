const jwttoken=require('jsonwebtoken')
const {decrypt}=require('../../utils/crytography/index')
exports.extractAnswer=async(req,res,next)=>{
    try{    
        let decoded=jwttoken.verify(req.body.jwt,process.env.JWT_SECRET)
        req.uid=decoded.uid
        let answer1=JSON.parse(decrypt(decoded.answer1))
        let answer2=JSON.parse(decrypt(decoded.answer2))
        let answer3=JSON.parse(decrypt(decoded.answer3))
        req.answer={
            answer1,
            answer2,
            answer3
        }
        next()
    }catch(err){
        res.status(400).json({message:err.message})
    }
}
