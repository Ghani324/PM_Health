const express = require('express');
const passport = require('passport');
const router = express.Router();
const ClaimandLine = require('../models/ClaimColumn');


router.post('/createClaimandLine',async (req,res)=>{
    const PostData = {
        ColumnName : req.body.ColumnName,
        isActive : req.body.isActive,
        ClaimLevel : req.body.ClaimLevel
    }
    
    const Claimandlinedata = await new ClaimandLine(PostData).save()
    if(Claimandlinedata){
        res.status(200).json({
            Response : true,
            Message : "Claimandline posted successfully",
            Data : Claimandlinedata
        })
    }else {
        res.status(404).json({
            Response : false,
            Message : "Something went wrong",
            Data : Claimandlinedata
        })
    }
})

router.get('/getClaimandline', (req, res)=>{
    ClaimandLine.find().then((ResponseData)=>{
        if(ResponseData){
            res.status(200).json({
                Response : true,
                Message : "Claimandline Details Get Successfully",
                Data : ResponseData
            })
        }
        else{
            res.status(422).json({
                Response : false,
                Message : "Something went wrong",
                Data : ResponseData
            })
        }
    })
})






module.exports = router;