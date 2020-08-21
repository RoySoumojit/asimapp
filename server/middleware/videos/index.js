exports.checkVisibility=(req,res,next)=>{
    if(req.session.videoview){
        next()
    }else{
        res.redirect(`/video/show/login/${req.params.id}`)
    }
}