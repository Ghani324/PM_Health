const express = require('express');
var pagination = require('pagination');
const router = express.Router();
const Roles = require("../models/Roles");
const passport = require('passport');
var ObjectID = require('mongodb').ObjectID;

router.post('/createRole', async (req,res)=>{
    
    if(req.body.role_name){
        var ArrrayList = []
        var Id = new ObjectID(req.body.role_name)
        delete req.body.role_name
        Object.keys(req.body).map((res,ind)=>{
            ArrrayList.push({
                label : res,
                value : req.body[res]
            })
        })
        var UpdateData = {
            PermissionsList : ArrrayList
        }
        Roles.updateOne({_id : Id},UpdateData).then((ResponseData)=>{
            res.json({
                Responsedata : ResponseData,
                Result : true
            })
        })
    }  else {
        res.status(400).json({
            Response : false,
            Message : "Catch Error",
        });
    }
})

router.get('/query', async (req,res)=>{
    
    var query = { 'status.isDeleted' : false}
    if (req.query.search) {
        if (req.query.search) {
            var regex = { $regex : String(req.query.search) , $options: "i" }
            Object.assign(query, { $or: [{'role_name': regex  }] })
        }
    }
    var paginate = Number(req.query.items_per_page);
    var page = req.query.page == 1 ? 0 : req.query.page - 1;
    var TotalRecrodsFinal = await Roles.countDocuments(query)

   
    Roles.aggregate([
    { $match: query },
    {$skip: (Number(page))*Number(paginate)},
    {$limit: Number(paginate)},
    {
        $project: {
            _id: 0,
            role_name: "$role_name",
            PermissionsList : "$PermissionsList",
            id : "$_id"
        }
    },
    ]).then((ResponseData) => {
        var permissionData = [];
        ResponseData.map(async(data,ind)=>{
            
            var prstr = [];
            let permissionValues = data.PermissionsList;
            await permissionValues.map(async datas1 =>{
              prstr.push(`${datas1.value == true ? ` ${datas1.label} : <b style="color:green">Yes</b> ` : ` ${datas1.label} : <b style="color:red">No</b> ` }`)
            })
            console.log("prstr", prstr);
            permissionData.push({
                rolename: data.role_name,
                Permission : prstr.toString(" , ")
            })
            console.log("permissiondata", permissionData)
            if(ResponseData.length - 1 == ind){
                
                var paginator = new pagination.SearchPaginator({prelink:'/', current: req.query.page , rowsPerPage: 10, totalResult: TotalRecrodsFinal});
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
                    data : permissionData,
                    payload: payload
                })
            }
        })

    })
    
})

router.get('/getRole', (req,res)=>{
    Roles.find().then((ResponseData)=>{
        res.json(ResponseData)
    })
})
router.post('/UpdateRole',(req,res)=>{
   
    // const GetData = { PmName : req.body.PmId }
    // var PmId = await PMSystem.findOne(GetData)

    const PostData = {
        // ClaimLevel : req.body.ClaimLevel,
        // PmId : PmId._id,
        // UpdatedBy : req.user._id,
        // PracticeName : req.body.PracticeName

        role_name : req.body.role_name,
        description : req.body.description,
        Status : req.body.Status
    }
    Roles.updateOne({_id : req.body.id},PostData).then((ResponseData)=>{
        res.json({
            data : ResponseData
        })
    })

})

router.get('/roles', async (req,res)=>{
    Roles.findOne({_id : req.query.role_id}).then((ResponseData)=>{
        res.json({
            data : ResponseData
        })
    })

})

router.get('/getRoleList',(req,res)=>{
    var Where = { 'status.isDeleted' : false}
    Roles.find(Where).then((ResponseData)=>{
        res.json({
            data : ResponseData
        })
    })

})
router.post('/getRoleByid',(req,res)=>{
    var Where = { '_id' : new ObjectID(req.body.RoleId)}
    Roles.findOne(Where).then((ResponseData)=>{
        res.json({
            data : ResponseData
        })
    })

})

module.exports = router;