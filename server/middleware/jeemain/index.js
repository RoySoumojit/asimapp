const jwttoken=require('jsonwebtoken')
const {decrypt}=require('../../utils/crytography/index')
exports.extractAnswer=async(req,res,next)=>{
    try{    
        let decoded=jwttoken.verify(req.body.jwt,process.env.JWT_SECRET)
        req.uid=decoded.uid
        let answer=JSON.parse(decrypt(decoded.answer))
        req.answer=answer
        next()
    }catch(err){
        res.status(400).json({message:err.message})
    }
}
