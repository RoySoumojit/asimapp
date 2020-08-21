const Cryptr=require('cryptr')
let value="jihvnkfvfvfv9938r45njfnie9furwfufhrfrfh98iof3f3f"
let cryptr=new Cryptr(value)
exports.encrypt=(text)=>{
    return cryptr.encrypt(text)
}

exports.decrypt=(enctext)=>{
    return cryptr.decrypt(enctext)
}
