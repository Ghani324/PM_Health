const express = require('express');
const router = express.Router();
const PMSystem = require("../models/PmSystem");
const Practice = require("../models/Practice");
var pagination = require('pagination');
const passport = require('passport');
var ObjectID = require('mongodb').ObjectID;
const oauth2 = require("jsonwebtoken");
const authCheck = require("../Config/auth")

router.delete('/delete', passport.authenticate("jwt", { session: false }),async (req,res)=>{

    var UpdateData = {
        'Status.isDeleted' : true,
        UpdatedBy : req.user._id,
    }
    PMSystem.updateOne({_id : req.query.user_id},UpdateData).then(async(ResponseData)=>{
        await Practice.updateMany({PmId : req.query.user_id},UpdateData)
        res.json({
            data : ResponseData
        })
    })

})
router.get('/getClaimBasedPmList', passport.authenticate("jwt", { session: false }),async (req,res)=>{
    var Where = {ClaimLevel:1,'Status.isDeleted' : false}
    PMSystem.find(Where).then((ResponseData)=>{
        res.json({
            data : ResponseData
        })
    })

})
router.get('/getLineBasedPmList', passport.authenticate("jwt", { session: false }),async (req,res)=>{
    var Where = {ClaimLevel:2,'Status.isDeleted' : false}
    PMSystem.find(Where).then((ResponseData)=>{
        res.json({
            data : ResponseData
        })
    })

})
router.get('/getPmListById', passport.authenticate("jwt", { session: false }),async (req,res)=>{

    var Where = {
        'Status.isDeleted' : false,
        PmId : JSON.parse(req.query.Pm_id).value,
    }

    Practice.find(Where).then((ResponseData)=>{
        res.json({
            data : ResponseData
        })
    })

})
router.get('/users', passport.authenticate("jwt", { session: false }),async (req,res)=>{

    PMSystem.findOne({_id : req.query.user_id}).then((ResponseData)=>{
        res.json({
            data : ResponseData
        })
    })

})
router.get('/getPmList', passport.authenticate("jwt", { session: false }),async (req,res)=>{
    var Where = { 'Status.isDeleted' : false}
    if (req.user.RoleType != "admin") {

        var PMSystemIDs = []
        var UsersData = await Users.findOne({_id : new ObjectID(req.user._id) })
        await UsersData.PmId.map((resss,ind)=>{
            PMSystemIDs.push(new ObjectID(resss))
        })
        Object.assign(Where,{ _id : {$in : PMSystemIDs } })
    }
    PMSystem.find(Where).then((ResponseData)=>{
        res.json({
            data : ResponseData
        })
    })

})
router.get('/query', passport.authenticate("jwt", { session: false }),async (req,res)=>{
    
    var query = { 'Status.isDeleted' : false}
    if (req.user.RoleType != "admin") {
        var PMSystemIDs = []
        var UsersData = await Users.findOne({_id : new ObjectID(req.user._id) })
        await UsersData.PmId.map((resss,ind)=>{
            PMSystemIDs.push(new ObjectID(resss))
        })
        Object.assign(query,{ _id : {$in : PMSystemIDs } })
    }
    if (req.query.search) {
        if (req.query.search) {
            var regex = { $regex : String(req.query.search) , $options: "i" }
            Object.assign(query, { $or: [{'PmName': regex  }] })
        }
    }
    var paginate = Number(req.query.items_per_page);
    var page = req.query.page == 1 ? 0 : req.query.page - 1;
    var TotalRecrodsFinal = await PMSystem.countDocuments(query)

   
    PMSystem.aggregate([
    { $match: query },
    {$skip: (Number(page))*Number(paginate)},
    {$limit: Number(paginate)},
    {
        $project: {
            _id: 0,
            PmName: "$PmName",
            ClaimLevel : "$ClaimLevel",
            Status: "$Status",
            id : "$_id"
        }
    },
    ]).then((ResponseData) => {
        var paginator = new pagination.SearchPaginator({prelink:'/', current: req.query.page , rowsPerPage: 10, totalResult: TotalRecrodsFinal});
        //console.log("sadf",paginator.getPaginationData())
        var links = []
        if(req.query.page == 1){
            links.push({
                "url": null,
                "label": "&laquo; Previous",
                "active": false,
                "page": null
            })
        }else {
            links.push({
                "url": null,
                "label": "&laquo; Previous",
                "active": false,
                "page": req.query.page - 1
            })
        }
        paginator.getPaginationData().range.map((res,index)=>{
            links.push({
                "url": "\/?page="+res,
                "label": String(res),
                "active": res == paginator.getPaginationData().current ? true : false,
                "page": res
            })
        })
        if(paginator.getPaginationData().next){
            links.push({

                "url": "\/?page="+paginator.getPaginationData().current + 1,
                "label": "Next &raquo;",
                "active": false,
                "page": paginator.getPaginationData().current + 1
            })
        }else {
            links.push({
                "url": "\/?page=2",
                "label": "Next &raquo;",
                "active": false,
            })
        }
        var payload = {
            "pagination": {
                "page": req.query.page,
                "first_page_url": "\/?page=1",
                "from": paginator.getPaginationData().fromResult,
                "last_page": paginator.getPaginationData().pageCount,
                "links": links,
                "next_page_url": "\/?page="+paginator.getPaginationData().next,
                "items_per_page": "10",
                "prev_page_url": "\/?page="+paginator.getPaginationData().previous,
                "to": paginator.getPaginationData().toResult,
                "total": paginator.getPaginationData().totalResult
            }
        }
        res.json({
            data : ResponseData,
            payload: payload
        })
    })
})
router.put('/', passport.authenticate("jwt", { session: false }),async (req,res)=>{
    
    if(req.body._id){
        const PostData = {
            PmName : req.body.PmName,
            UpdatedBy : req.user._id,
            ClaimLevel : req.body.ClaimLevel,
        }
        PMSystem.findOneAndUpdate({_id : req.body._id},PostData,{new:true}).then((ResponseData)=>{
            res.json({
                data : ResponseData
            })
        })
    }else {
        const PostData = {
            PmName : req.body.PmName,
            UpdatedBy : req.user._id,
            ClaimLevel : req.body.ClaimLevel,
            'Status.isDeleted' : false
        }
        const PMSystemdata = await new PMSystem(PostData).save()
        if(PMSystemdata){
            res.status(200).json({
                Response : true,
                Message : "PMSystem posted successfully",
                Data : PMSystemdata
            })
        }else {
            res.status(404).json({
                Response : false,
                Message : "Something went wrong",
                Data : PMSystemdata
            })
        }
    }
})



router.get('/getPmSystemByName', passport.authenticate("jwt", { session: false }), async (req,res)=>{
    const PostData = {
        PmName : req.query.PmName
    }
    await PMSystem.findOne(PostData).then((getData)=>{
        if(getData){
            res.status(200).json({
                Response : true,
                Message : "PMSystem Already Exists"
            })
        }else {
            res.status(200).json({
                Response : false,
                Message : "PM System not Match"
            })
        }
    })
})
router.post('/createPmSystem', passport.authenticate("jwt", { session: false }), async (req,res)=>{
    const PostData = {
        PmName : req.body.PmName
    }
    
    const PMSystemdata = await new PMSystem(PostData).save()
    if(PMSystemdata){
        res.status(200).json({
            Response : true,
            Message : "PMSystem posted successfully",
            Data : PMSystemdata
        })
    }else {
        res.status(404).json({
            Response : false,
            Message : "Something went wrong",
            Data : PMSystemdata
        })
    }
})
router.get('/getPmSystem', passport.authenticate("jwt", { session: false }),(req,res)=>{
    PMSystem.find().then((ResponseData)=>{
        res.json(ResponseData)
    })
})

router.get('/deleteAllRecords', (req,res)=>{
    PMSystem.deleteMany().then((ResponseData)=>{
        res.json(ResponseData)
    })
})

module.exports = router;