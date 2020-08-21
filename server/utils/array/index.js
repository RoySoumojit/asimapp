exports.randomArrayWb=(arr)=>{
    let catagory1=[]
    let catagory2=[]
    let catagory3=[]
    let answer1=[]
    let answer2=[]
    let answer3=[]
    while(arr.length!==0){
        let random=Math.floor(Math.random()*arr.length)
        let temp={
            catagory:arr[random].catagory,
            id:arr[random].id,
            image:arr[random].image,
            text:arr[random].text,
            answer:[]
        }
        if(temp.catagory===1){
            catagory1.push(temp)
            answer1.push({id:arr[random].id,answer:arr[random].answer})
        }else if(temp.catagory===2){
            catagory2.push(temp)
            answer2.push({id:arr[random].id,answer:arr[random].answer})
        }else{
            catagory3.push(temp)
            answer3.push({id:arr[random].id,answer:arr[random].answer})
        }
        arr.splice(random,1)
    }
    
    return{
        answer1,
        answer2,
        answer3,
        catagory1,
        catagory2,
        catagory3
    }
}

exports.randomArrayJe=(arr)=>{
    let array=[]
    let answer=[]
    while(arr.length!==0){
        let random=Math.floor(Math.random()*arr.length)
        let temp={
            id:arr[random].id,
            image:arr[random].image,
            text:arr[random].text,
            answer:[]
        }
        array.push(temp)
        answer.push({id:arr[random].id,answer:arr[random].answer})
        arr.splice(random,1)
    }
    return{
        question:array,
        answer
    }
}