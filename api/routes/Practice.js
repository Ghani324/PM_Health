var port = process.env.PORT || 5000;
var cCPUs = require('os').cpus().length;
const cluster = require("cluster");
const { Router } = require("express");
const express = require('express');
const { appendFile } = require('fs');
//const express = Router
const router = express.Router();
const path = require('path');
const PmSystem = require('../models/PmSystem');
const Practice = require("../models/Practice");
const Users = require("../models/Users")
const arScenario = require("../models/arScenario")
var ObjectID = require('mongodb').ObjectID;
const jwt = require("jsonwebtoken");
const passport = require('passport');
var pagination = require('pagination');
const authCheck = require("../Config/auth")
const excel = require("exceljs");
router.delete('/delete',passport.authenticate("jwt", { session: false }),async (req,res)=>{

    var UpdateData = {
        'Status.isDeleted' : true,
        UpdatedBy : req.user._id,
    }
    Practice.updateOne({_id : req.query.user_id},UpdateData).then((ResponseData)=>{
        res.json({
            data : ResponseData
        })
    })

})

router.get('/getpracticeByName', passport.authenticate("jwt", { session: false }), async (req,res)=>{
    const PostData = {
        PracticeName : req.query.PracticeName
    }
    await Practice.findOne(PostData).then((getData)=>{
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
router.get('/query',passport.authenticate("jwt", { session: false }),async (req,res)=>{
    console.log("req.user",req.user)
    var query = { 'Status.isDeleted' : false}

    if (req.user.RoleType != "admin") {
        var Practice_nameIDs = []
        var UsersData = await Users.findOne({_id : new ObjectID(req.user._id) })
        await UsersData.PracticeId.map((resss,ind)=>{
            Practice_nameIDs.push(new ObjectID(resss))
        })
        Object.assign(query,{ _id : {$in : Practice_nameIDs } })
    }
    if (req.query.search) {
        if (req.query.search) {
            var regex = { $regex : String(req.query.search) , $options: "i" }
            Object.assign(query, { $or: [{'PracticeName': regex  }] })
        }
    }
    var paginate = Number(req.query.items_per_page);
    var page = req.query.page == 1 ? 0 : req.query.page - 1;
    var TotalRecrodsFinal = await Practice.countDocuments(query)

   
    Practice.aggregate([
    { $match: query },
    {$skip: (Number(page))*Number(paginate)},
    {$limit: Number(paginate)},
    {
        $lookup: {
            from: "pm_systems",
            localField: "PmId",    // field in the Opportunities collection
            foreignField: "_id",  // From Tables coestimations
            as: "pmsystem"
        }
    },
    {
        $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$pmsystem", 0 ] }, "$$ROOT" ] } }
    },
    {$unwind: "$pmsystem"},
    {
        $project: {
            _id: 0,
            PracticeName: "$PracticeName",
            PmId: "$PmId",
            PmName: "$PmName",
            Status: "$Status",
            id : "$_id",
            ClaimLevel : "$ClaimLevel"
        }
    },
    ]).then((ResponseData) => {
        //console.log("ResponseData",JSON.stringify(ResponseData))
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
router.post('/',passport.authenticate("jwt", { session: false }),async (req,res)=>{

    if(req.body.id){
        const PostData = {
            PmId : req.body.PmId,
            UpdatedBy : req.user._id,
            PracticeName : req.body.PracticeName,
            DisplayNames : []
        }
    
        var DisplayNamesData = []
        req.body.ClaimColumns.map((res,index)=>{
            DisplayNamesData.push({
                value : res.value,
                label : req.body[res.value]
            })
        })
        PostData.DisplayNames = DisplayNamesData
    
        Practice.updateOne({_id : req.body.id},PostData).then((ResponseData)=>{
            res.json({
                data : ResponseData
            })
        })
    }else {
        var DataSet  = {
            PmId : req.body.PmId,
            PracticeName : req.body.PracticeName,
            'Status.isDeleted' : false,
            CreatedBy : req.user._id,
            DisplayNames : []
        }
    
        var DisplayNamesData = []
        req.body.ClaimColumns.map((res,index)=>{
            DisplayNamesData.push({
                value : res.value,
                label : req.body[res.label]
            })
        })
        DataSet.DisplayNames = DisplayNamesData
    
        const Practicedata = await new Practice(DataSet).save()
        if(Practicedata){
    
            await PMSystem.findOne({_id : req.body.PmId}).exec(function(err,book) {
                book.Practice.push( Practicedata._id );
                book.save();
            });
            res.status(200).json({
                Response : true,
                Message : "Practice Created successfully",
                Data : Practicedata
            })
        }else {
            res.status(400).json({
                Response : false,
                Message : "Something went wrong",
                Data : Practicedata
            })
        }
    }
})

router.get('/users',passport.authenticate("jwt", { session: false }),async (req,res)=>{
    var ObjectID = require('mongodb').ObjectID;
    
    Practice.aggregate([
        { $match: {_id : new ObjectID(req.query.user_id) } },
        {
            $lookup: {
                from: "pm_systems",
                localField: "PmId",    // field in the Opportunities collection
                foreignField: "_id",  // From Tables coestimations
                as: "pmsystem"
            }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$pmsystem", 0 ] }, "$$ROOT" ] } }
        },
        {$unwind: "$pmsystem"},
        {
            $project: {
                _id: 0,
                PracticeName: "$PracticeName",
                PmId: "$pmsystem._id",
                PmName: "$PmName",
                Status: "$Status",
                id : "$_id",
                ClaimLevel : "$ClaimLevel",
                DisplayNames : "$DisplayNames"
            }
        },
    ])
    .then((ResponseData)=>{
        //console.log("ResponseData",ResponseData)
        res.json({
            data : ResponseData[0]
        })
    })

})

router.post('/getPracticeList',passport.authenticate("jwt", { session: false }),async (req,res)=>{
   
    const GetData = { PmId : { $in : req.body.PostData},'Status.isDeleted' : false}
    await Practice.find(GetData).then((ResponseData)=>{
        res.json({
            data : ResponseData
        })
    })

})

router.post('/getPracticeListByMultipleID',passport.authenticate("jwt", { session: false }),async (req,res)=>{

    var PracticeId = JSON.parse(req.body.PostData)
    var IDS = []
    PracticeId.map((res,ind)=>{
        IDS.push(new ObjectID(res.value))
    })
    Practice.aggregate([
        { 
            $match: { 
                PmId:  { $in : IDS },
                'Status.isDeleted' : false 
            }
        },
        {
            $project: {
                label: "$PracticeName",
                PmName: "$PmName",
                // Status: "$Status",
                value : "$_id",
                ClaimLevel : "$ClaimLevel",
                // DisplayNames : "$DisplayNames"
            }
        },
    ]).then((ResponseData)=>{
        res.json({
            data : ResponseData
        })
    })
})
router.post('/getPracticeListById',passport.authenticate("jwt", { session: false }),async (req,res)=>{
   
    var Where = {
        'Status.isDeleted' : false,
        PmId : new ObjectID(req.body.PostData),
    }
    if (req.user.RoleType != "admin") {
        var PmData = await Practice.find({PmId : new ObjectID(req.body.PostData)})
        var PracticeIds = []
        var UsersData = await Users.findOne({_id : new ObjectID(req.user._id) })
        await PmData.map((resss,ind)=>{
            if(UsersData.PracticeId.includes(resss._id)){
                PracticeIds.push(new ObjectID(resss._id))
            }
        })
        Object.assign(Where,{ _id : {$in : PracticeIds } })
    }
    Practice.aggregate([
        { 
            $match: Where
        },
        {
            $project: {
                label: "$PracticeName",
                PmName: "$PmName",
                // Status: "$Status",
                value : "$_id",
                ClaimLevel : "$ClaimLevel",
                // DisplayNames : "$DisplayNames"
            }
        },
    ]).then((ResponseData)=>{
        res.json({
            data : ResponseData
        })
    })
})

router.get('/templateDownlaod',passport.authenticate("jwt", { session: false }),async (req,res)=>{

    var RulesTableData = await Practice.findOne({_id :req.query.practice_id}).sort({'DisplayNames.value':-1})
    var DisplayNames = RulesTableData.DisplayNames
    var ExcelColumns = []
    DisplayNames.map(async(ress,inde)=>{
        // console.log("de",DisplayNames)
        // if(DisplayNames >= 0)
        // {
        //     res.status(200).json({
                
        //         Response : true,
        //         Message : "columns created",
        //         Data : DisplayNames
        //     })
        // }else
        // {
        //     res.status(400).json({
        //         Response : false,
        //         Message : "No columns selected",
        //         Data : DisplayNames
        //     })
        // }
        ExcelColumns.push({ header: ress.label, key: ress.value, width: 20 })
        // console.log("de",ress.label)
        if(inde === DisplayNames.length - 1){

            //let tutorials = ;
            let workbook = new excel.Workbook();
            let worksheet = workbook.addWorksheet(`${RulesTableData.PracticeName}`);
            worksheet.columns = ExcelColumns
            // Add Array Rows
            //worksheet.addRows(tutorials);
            var statuscode = await arScenario.find({type: {$in: ['statuscode']}})

            var  worksheetForstatuscode = workbook.addWorksheet(`Acceptable Status Codes`);
            worksheetForstatuscode.columns = [{header: "Status Codes", key: "value", width: 20 },{header: "Description", key: "label", width: 92.36 }]

            worksheetForstatuscode.addRows(statuscode);

            var RootCauseCodes = await arScenario.find({type: {$in: ['RootCauseCodes']}})
            var  worksheetForRootCause = workbook.addWorksheet(`Acceptable Root Cause`);
            worksheetForRootCause.columns = [{header: "Root Cause", key: "value", width: 20 },{header: "Description", key: "label", width: 20 }]

            worksheetForRootCause.addRows(RootCauseCodes);
            
            res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
            "Content-Disposition",
            "attachment; filename=" + `SampleTemplate_${RulesTableData.PracticeName}.xlsx`
            );
            return workbook.xlsx.write(res).then(function () {
            res.status(200).end();
            });
        }
    });

})

router.post('/UpdatePractice',passport.authenticate("jwt", { session: false }),async (req,res)=>{
   
    const PostData = {
        PmId : req.body.PmId,
        UpdatedBy : req.user._id,
        PracticeName : req.body.PracticeName,
        DisplayNames : []
    }

    var DisplayNamesData = []
    req.body.ClaimColumns.map((res,index)=>{
        DisplayNamesData.push({
            value : res.value,
            label : req.body[res.value]
        })
    })
    PostData.DisplayNames = DisplayNamesData

    Practice.updateOne({_id : req.body.id},PostData).then((ResponseData)=>{
        res.json({
            data : ResponseData
        })
    })

})

router.get('/getPractice', (req,res)=>{
    Practice.find().then((ResponseData)=>{
        res.json(ResponseData)
    })
})

module.exports = router;