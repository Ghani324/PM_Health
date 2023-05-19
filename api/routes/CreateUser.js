const express = require('express')
const passport = require('passport');
const router = express.Router()
const Users = require('../models/Users')
var ObjectID = require('mongodb').ObjectID
const authCheck = require('../Config/auth')
var pagination = require('pagination')
const {response} = require('express')

router.post('/createUsers', passport.authenticate("jwt", { session: false }), async (req, res) => {
  var DataSet = {
    ReportingManager: new ObjectID(req.body.reporting_manager),
    PmId: JSON.parse(req.body.pm_system),
    PracticeId: JSON.parse(req.body.practice_name),
  }

  await Users.updateOne({_id: new ObjectID(req.body.UserId)}, {$set: DataSet}, {new: true})
    .then((Usersdata) => {
      res.status(200).json({
        Response: true,
        Message: 'User Updated Successfully... !',
        Data: Usersdata,
      })
    })
    .catch((errResponse) => {
      res.status(400).json({
        Response: false,
        Message: 'Catch Error',
        Data: errResponse,
      })
    })
})

router.get('/users', passport.authenticate("jwt", { session: false }), async (req, res) => {
  Users.findOne({_id: req.query.user_id}).then((ResponseData) => {
    res.json({
      data: ResponseData,
    })
  })
})

router.get('/getUserList', passport.authenticate("jwt", { session: false }), async (req, res) => {
  var Where = {'Status.isDeleted': false}
  Users.find(Where).then((ResponseData) => {
    res.json({
      data: ResponseData,
    })
  })
})

router.get('/query', passport.authenticate("jwt", { session: false }), async (req, res) => {
  var query = {'Status.isDeleted': false}
  if (req.query.search) {
    if (req.query.search) {
      var regex = {$regex: String(req.query.search), $options: 'i'}
      Object.assign(query,  {$or: [{'FirstName' : regex}]})
    }
  }
  var paginate = Number(req.query.items_per_page)
  var page = req.query.page == 1 ? 0 : req.query.page - 1
  var TotalRecrodsFinal = await Users.countDocuments(query)
  Users.aggregate([
    { $match: query },
    {$skip: (Number(page))*Number(paginate)},
    {$limit: Number(paginate)},
    {
      $lookup: {
        from: 'users',
        localField: 'ReportingManager',
        foreignField: '_id',
        as: 'report',
      },
    },

    {
      $lookup: {
        from: 'pm_systems',
        localField: 'PmId',
        foreignField: '_id',
        as: 'pmsystem',
      },
    },
    {
      $lookup: {
        from: 'practices',
        localField: 'PracticeId',
        foreignField: '_id',
        as: 'practiceName',
      },
    },
    {
      $project: {
        _id: 0,
        Status: '$Status',
        ReportingManager: '$report.FirstName',
        ReportingManagerLastName: '$report.LastName',
        UserName: {$concat: ['$FirstName', ' ', '$LastName']},
        FirstName: '$FirstName',
        LastName: '$LastName',
        PmId: '$PmId',
        PracticeName1: '$practiceName.PracticeName',
        PmName1: '$pmsystem.PmName',
      },
    },
  ]).then((ResponseData) => {
    console.log("ResponseData",JSON.stringify(ResponseData))
    var paginator = new pagination.SearchPaginator({
      prelink: '/',
      current: req.query.page,
      rowsPerPage: 10,
      totalResult: TotalRecrodsFinal,
    })
    //console.log("sadf",paginator.getPaginationData())
    var links = []
    if (req.query.page == 1) {
      links.push({
        "url": null,
        "label": "&laquo; Previous",
        "active": false,
        "page": null,
      })
    } else {
      links.push({
        "url": null,
        "label": "&laquo; Previous",
        "active": false,
        "page": req.query.page - 1,
      })
    }
    paginator.getPaginationData().range.map((res, index) => {
      links.push({
        "url": "/?page=" + res,
        "label": String(res),
        "active": res == paginator.getPaginationData().current ? true : false,
        "page": res,
      })
    })
    if (paginator.getPaginationData().next) {
      links.push({
        "url": "/?page=" + paginator.getPaginationData().current + 1,
        "label": "Next &raquo;",
        "active": false,
        "page": paginator.getPaginationData().current + 1,
      })
    } else {
      links.push({
        "url": "/?page=2",
        "label": "Next &raquo;",
        "active": false,
      })
    }
    var payload = {
      "pagination": {
        "page": req.query.page,
        "first_page_url": "/?page=1",
        "from": paginator.getPaginationData().fromResult,
        "last_page": paginator.getPaginationData().pageCount,
        "links": links,
        "next_page_url": "/?page=" + paginator.getPaginationData().next,
        "items_per_page": "10",
        "prev_page_url": "/?page=" + paginator.getPaginationData().previous,
        "to": paginator.getPaginationData().toResult,
        "total": paginator.getPaginationData().totalResult,
      },
    }
    var FinalData = []

    ResponseData.map((res2,ind)=>{
        Object.assign(res2,{PracticeName : res2.PracticeName1.toString(" , ")})
        Object.assign(res2,{PmName :  res2.PmName1.toString(" , ")})

        FinalData.push(res2)
        if(ind == ResponseData.length - 1){
            res.json({
                data: ResponseData,
                payload: payload,
            })
        }
    })
  })
})


module.exports = router