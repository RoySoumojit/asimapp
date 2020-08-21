const express=require('express')
const {isUser,isExamEnable}=require('../../middleware/verification/index')
const {getAllData,calculate,displayAnswerSheet}=require('../../controllers/exam/jeemain/index')
const {extractAnswer}=require('../../middleware/jeemain')
const Router=express.Router()

Router.get('/fetchAll/:jwt',isUser,isExamEnable,getAllData)
Router.post('/result',extractAnswer,calculate)
Router.get('/result/answersheet',displayAnswerSheet)

module.exports=Router