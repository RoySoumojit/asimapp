
exports.getDbAccess=(str)=>{
    if(str==="joint11"){
        return "11joint"
    }else if(str==="joint12"){
        return "12joint"
    }else if(str==="joint11and12"){
        return "11and12joint"
    }else if(str==="hs11"){
        return "11hs"
    }
    else if(str==="hs12"){
        return "12hs"
    }
    else{
        return "None"
    }
}