const express=require("express")
const {isUser,isExamEnable}=require('../../middleware/verification/index')
const {getAllData,getCountOfData,displayAnswerSheet} =require('../../controllers/exam/wbjee/index')
const {extractAnswer}=require('../../middleware/wbjee/index')
const {calculate}=require('../../controllers/exam/wbjee/index')
const Router=express.Router()


Router.get('/fetchAll/:jwt',isUser,isExamEnable,getAllData)
Router.get('/count/:jwt',isUser,isExamEnable,getCountOfData)
Router.post('/result',extractAnswer,calculate)
Router.get('/result/answersheet',displayAnswerSheet)


module.exports=Router