const express = require('express');
const passport = require('passport');
const router = express.Router();
const authCheck = require("../Config/auth")
const PmSystem = require('../models/PmSystem');
const Practice = require("../models/Practice")
const ClaimColumn = require("../models/ClaimColumn")
const Claim_Master = require("../models/ClaimMaster")
const ClaimStatusUpdate = require("../models/ClaimStatusUpdate")
const FileUploadLogs = require("../models/FileUploadLogs");
const moment = require("moment-timezone");
moment.tz.setDefault("America/florida");

const excel = require("exceljs");
const ClaimMasterTemp = require("../models/ClaimMasterTemp")
const AWS = require('aws-sdk');
const path = require('path');
const reader = require('xlsx')
const multer = require("multer");
var ObjectID = require('mongodb').ObjectID;
const StatusCodes = ["Open", "Fresh-Call", "RECBILL", "HOLD", "Auto Open","CALL",'RECALL']
const ColumnSkipArray = ["PracticeId", "id", "updatedAt", "_id"]


router.get('/getClaimHistory', passport.authenticate("jwt", { session: false }), async (req, res) => {
    if (req.query.ClaimId) {
        var id = new ObjectID(req.query.ClaimId)
        var GetClaimData = await Claim_Master.findOne({
            _id: id
        })

        var getPracticeData = await Practice.findOne({ _id: new ObjectID(GetClaimData.PracticeId) })
        ClaimStatusUpdate.aggregate([
            {
                $match: { ClaimId: id }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "UserId",    // field in the Opportunities collection
                    foreignField: "_id",  // From Tables coestimations
                    as: "users"
                }
            },
            {
                $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$users", 0 ] }, "$$ROOT" ] } }
            },
            {
                $project: {
                    FirstName : "$FirstName", Status: "$Status", ClaimId: '$ClaimId', UserId: '$UserId', StatusCode: '$StatusCode', DueDate: '$DueDate', Comments: '$Comments', Type: '$Type', CreatedBy: '$CreatedBy', id: "$_id", updatedAt: "$updatedAt", createdAt: "$createdAt"
                }
            },
            { $sort: { createdAt: -1 } },
        ]).then((getDatares) => {
            res.json({
                data: getDatares,
                GetClaimData: GetClaimData,
                getPracticeData: getPracticeData
            })
        })
    } else {
        res.json({
            data: [],
            GetClaimData: [],
            getPracticeData: []
        })
    }

})
var ProjectColumns = {
    Location : "$Location",
    MemberId : "$MemberId",
    PayerMix : "$PayerMix",
    IntialClaimDate : { $dateToString: { format: "%Y-%m-%d", date: "$IntialClaimDate" } },
    ClaimAdjustemnt : "$ClaimAdjustemnt",
    Stage : "$Stage",
    RoleResponsibilityCategory : "$RoleResponsibilityCategory",
    DenialReason : "$DenialReason",
    ServiceType : "$ServiceType",
    Modifier : "$Modifier",
    ProcedureCode : "$ProcedureCode", 
    FacilityName : "$FacilityName",
    PayerResponsibility : "$PayerResponsibility",
    Indication : "$Indication",
    ProcedureBalance : "$ProcedureBalance",
    FiledStatus : "$FiledStatus",
    PatientDOB : "$PatientDOB",
    AdjustmentReason : "$AdjustmentReason",
    CompanyName : "$CompanyName",
    OrginalICN : "$OrginalICN",
    Diagnosis : "$Diagnosis",
    SecondaryInsuranceCompany : "$SecondaryInsuranceCompany",
    DOE : "$DOE",
    Unit : "$Unit",
    "Aging": {
        $round: { $divide: [{ $subtract: [new Date(), '$DateOfService'] }, 86400000] }
    },
    SystemStatus: '$SystemStatus',
    DueDate: { $dateToString: { format: "%Y-%m-%d", date: "$DueDate" } },
    Comments: '$Comments',
    Bill: '$Bill',
    DateOfService: { $dateToString: { format: "%Y-%m-%d", date: "$DateOfService" } },
    PatientName: '$PatientName',
    PayerName: '$PayerName',
    ClaimStatus: '$ClaimStatus',
    ProcedureBilledAmount : { $toDouble: "$ProcedureBilledAmount" },
    ProcedurePayment : { $toDouble: "$ProcedurePayment" },
    ProcedureAdjustment : { $toDouble: "$ProcedureAdjustment" },
    ClaimBilledAmount:  { $toDouble: "$ClaimBilledAmount" },
    ClaimPayment: { $toDouble: "$ClaimPayment" },
    ClaimBalance: { $toDouble: "$ClaimBalance" },
    Account: '$Account',
    ProviderName: '$ProviderName',
    PracticeId: '$PracticeId',
    Priority: '$Priority',
    id: "$_id",
    updatedAt: { $dateToString: { format: "%Y-%m-%d", date: "$LastWorkingDate" } },
    RootCause: "$RootCause",
    CallerStatusChanged : "$CallerStatusChanged",
    PCAStatus: "$PCAStatus",
    CallerStatusChangedDate: { $dateToString: { format: "%Y-%m-%d", date: "$CallerStatusChangedDate" } }
}
function getAgingLimit(filter) {
    age = ""
    if (filter.operatorValue == "0-30") {
        age = { "Aging": { $lt: 30, $gte: 0 } }
    }
    if (filter.operatorValue == "30-60") {
        age = { "Aging": { $lt: 60, $gte: 30 } }
    }
    if (filter.operatorValue == "60-90") {
        age = { "Aging": { $lt: 90, $gte: 60 } }
    }
    if (filter.operatorValue == "90-120") {
        age = { "Aging": { $lt: 120, $gte: 90 } }
    }
    if (filter.operatorValue == "Above 120") {
        age = { "Aging": { $gte: 120 } }
    }
    if (filter.operatorValue == "0" || filter.operatorValue == "1") {
        age = { "Priority": Number(filter.operatorValue) }
    }
    return age;
}
async function getTotalCount(QueryForCount){
    var RemoveObjects = []
    QueryForCount.map((ress,ind)=>{
        if(ress){
            if(ress['$skip'] && ress['$skip'] || ress['$skip'] == 0){

            }else if(ress['$limit'] && ress['$limit']){
    
            }else {
                RemoveObjects.push(ress)
            }
        }
    })
    RemoveObjects.filter(value => Object.keys(value).length !== 0);
    var res = await Claim_Master.aggregate(RemoveObjects)
    console.log("res",JSON.stringify(res))
    return res.length
}
function getfilter(filter) {
    var Column = filter.field
    var operatorValue = filter.operator
    var value = filter.value
    var data = ""
    if (operatorValue == "0" || operatorValue == "1") {
        data = { "Priority": Number(operatorValue) }
    }
    if (value) {

        if (operatorValue == "Range") {
            var DateFilter = value.split('Split')
            if(DateFilter[1]){
                const endDate = new Date(DateFilter[1]);
                endDate.setUTCHours(23,59,59);
                data = { LastWorkingDate : { $gte: new Date(DateFilter[0]), $lte: new Date(endDate.toString()) } }
            }
        }

        if (operatorValue == "DateFilter") {
            Column = Column
            if(Column == "updatedAt"){
                Column = "LastWorkingDate"
            }
            const StartDate = new Date(value[0]);
            StartDate.setUTCHours(00,00,00);
            if(value[1]){
                const endDate = new Date(value[1]);
                endDate.setUTCHours(23,59,59);
                data = {  [Column] : { $gte: new Date(StartDate), $lte: new Date(endDate.toString()) } }
            }
        }
        if (operatorValue == "between") {
            if(value[1]){
                data = { [Column]: { $lte: Number(value[1]), $gte: Number(value[0]) } }
            }
        }
        if (operatorValue == "0" || operatorValue == "1") {
            data = { [Column]: Number(operatorValue) }
        }
        if (operatorValue == "=") {
            data = { [Column]: { $eq: Number(Number(value).toFixed(2)) } }
        }
        if (operatorValue == "!=") {
            data = { [Column]: { $ne: Number(Number(value).toFixed(2)) } }
        }
        if (operatorValue == ">") {
            data = { [Column]: { $gt: Number(Number(value).toFixed(2)) } }
        }
        if (operatorValue == ">=") {
            data = { [Column]: { $gte: Number(Number(Number(value).toFixed(2))) } }
        }
        if (operatorValue == "<") {
            data = { [Column]: { $lt: Number(Number(value).toFixed(2)) } }
        }
        if (operatorValue == "<=") {
            data = { [Column]: { $lte: Number(Number(value).toFixed(2)) } }
        }

        if (operatorValue == "is") {
            const endDate = new Date(value);
            endDate.setUTCHours(18,30,00);
            data = { [Column]: { $eq: endDate } }
        }
        if (operatorValue == "not") {
            const endDate = new Date(value);
            endDate.setUTCHours(18,30,00);
            data = { [Column]: { $ne: new Date(endDate) } }
        }
        if (operatorValue == "after") {
            const endDate = new Date(value);
            endDate.setUTCHours(18,30,00);
            data = { [Column]: { $gt: new Date(endDate) } }
        }
        if (operatorValue == "onOrAfter") {
            const endDate = new Date(value);
            endDate.setUTCHours(18,30,00);
            data = { [Column]: { $gte: new Date(endDate) } }
        }
        if (operatorValue == "before") {
            const endDate = new Date(value);
            endDate.setUTCHours(18,30,00);
            data = { [Column]: { $lt: new Date(endDate) } }
        }
        if (operatorValue == "onOrBefore") {
            const endDate = new Date(value);
            endDate.setUTCHours(18,30,00);
            data = { [Column]: { $lte: new Date(endDate) } }
        }

        if (operatorValue == "contains") {
            data = { [Column]: { $regex: value.trim(), $options: 'i' } }
        }
        if (operatorValue == "equals") {
            data = { [Column]: { $regex: value.trim(), $options: 'i' } }

        }
        if (operatorValue == "startsWith") {
            data = { [Column]: { $regex: value.trim(), $options: 'i' } }
        }
        if (operatorValue == "endsWith") {
            data = { [Column]: { $regex: value.trim(), $options: 'i' } }
        }
        if (operatorValue == "isEmpty") {
            data = { [Column]: { $eq: "" } }
        }
        if (operatorValue == "isNotEmpty") {
            data = { [Column]: { $ne: "" } }
        }
    }

    return data
}
async function GetTotalAmountClaimBalance(queryParams, type) {
    if (type == "UntotalAmount") {
        var Result = await Claim_Master.aggregate([
            { $match: queryParams },
            {
                $project: {
                    "Aging": {
                        $round: { $divide: [{ $subtract: [new Date(), '$DateOfService'] }, 86400000] }
                    },
                    ClaimBalance: '$ClaimBalance',
                }
            },
        ])
        return Result
    }
    if (type == "TouchedtotalAmount") {
        var Result = await Claim_Master.aggregate([
            { $match: queryParams },
            {
                $project: {
                    "Aging": {
                        $round: { $divide: [{ $subtract: [new Date(), '$DateOfService'] }, 86400000] }
                    },
                    ClaimBalance: '$ClaimBalance',
                }
            },
        ])
        return Result
    }

}
router.get('/GetClaimOutstanding', passport.authenticate("jwt", { session: false }), async (req, res) => {
    
    var PracticeId = JSON.parse(req.query.practicelist)
    if (Object.keys(PracticeId).length > 0) {
        
        var PraciiceData = ["Aging"]
        for (var i = 0; i < PracticeId.length; i++) {

            var getPracticeCoumns = await Practice.findOne({ _id: new ObjectID(PracticeId[i]._id) }, { PracticeName: 1 })
            PraciiceData.push(getPracticeCoumns.PracticeName)
        }
        var CahrtData = [PraciiceData]
        var CahrtDataTouched = [PraciiceData]
        var TotalAmount30 = ["0 - 30"]
        var TotalAmount60 = ["30 - 60"]
        var TotalAmount90 = ["60 - 90"]
        var TotalAmount120 = ["90 - 120"]
        var TotalAmount120Above = ["120 Above"]

        var TouchedTotalAmount30 = ["0 - 30"]
        var TouchedTotalAmount60 = ["30 - 60"]
        var TouchedTotalAmount90 = ["60 - 90"]
        var TouchedTotalAmount120 = ["90 - 120"]
        var TouchedTotalAmount120Above = ["120 Above"]

        for (var i = 0; i < PracticeId.length; i++) {

            var getPracticeCoumns = await Practice.findOne({ _id: new ObjectID(PracticeId[i]._id) }, { PracticeName: 1 })

            var query = { $and: [] }
            query.$and.push({
                PracticeId: new ObjectID(PracticeId[i]._id),
                SystemStatus: { $in: StatusCodes },
            })
            if (req.user.RoleType == "AR-Caller") {
                query.$and.push({ AssignTo: new ObjectID(req.user._id) })
            }
            var GetDataUNTouchedCounts = await GetTotalAmountClaimBalance(query, "UntotalAmount")
            
            var days30 = GetDataUNTouchedCounts.reduce(function(sum, dataGet){
                if(dataGet.Aging >= 0 && dataGet.Aging <= 30){
                    return sum + Number(dataGet.ClaimBalance);
                    } else{
                    return sum
                }; 
            }, 0)

            var days60 = GetDataUNTouchedCounts.reduce(function(sum, dataGet){
                if(dataGet.Aging >= 31 && dataGet.Aging <= 60){
                    return sum + Number(dataGet.ClaimBalance);
                    } else{
                    return sum
                }; 
            }, 0)
            var days90 = GetDataUNTouchedCounts.reduce(function(sum, dataGet){
                if(dataGet.Aging >= 61 && dataGet.Aging <= 90){
                    return sum + Number(dataGet.ClaimBalance);
                    } else{
                    return sum
                }; 
            }, 0)
            var days120 = GetDataUNTouchedCounts.reduce(function(sum, dataGet){
                if(dataGet.Aging >= 91 && dataGet.Aging <= 120){
                    return sum + Number(dataGet.ClaimBalance);
                    } else{
                    return sum
                }; 
            }, 0)
            var days120Above = GetDataUNTouchedCounts.reduce(function(sum, dataGet){
                if(dataGet.Aging >= 121){
                    return sum + Number(dataGet.ClaimBalance);
                    } else{
                    return sum
                }; 
            }, 0)
            
            TotalAmount30.push(days30)
            TotalAmount60.push(days60)
            TotalAmount90.push(days90)
            TotalAmount120.push(days120)
            TotalAmount120Above.push(days120Above)
            
            delete query.$and[0].SystemStatus;
            query.$and.push({
                SystemStatus: { $nin: StatusCodes }
            })

            var GetDataTouchedCounts = await GetTotalAmountClaimBalance(query, "TouchedtotalAmount")
           

            var days30 = GetDataTouchedCounts.reduce(function(sum, dataGet){
                if(dataGet.Aging >= 0 && dataGet.Aging <= 30){
                    return sum + Number(dataGet.ClaimBalance);
                    } else{
                    return sum
                }; 
            }, 0)

            var days60 = GetDataTouchedCounts.reduce(function(sum, dataGet){
                if(dataGet.Aging >= 31 && dataGet.Aging <= 60){
                    return sum + Number(dataGet.ClaimBalance);
                    } else{
                    return sum
                }; 
            }, 0)
            var days90 = GetDataTouchedCounts.reduce(function(sum, dataGet){
                if(dataGet.Aging >= 61 && dataGet.Aging <= 90){
                    return sum + Number(dataGet.ClaimBalance);
                    } else{
                    return sum
                }; 
            }, 0)
            var days120 = GetDataTouchedCounts.reduce(function(sum, dataGet){
                if(dataGet.Aging >= 91 && dataGet.Aging <= 120){
                    return sum + Number(dataGet.ClaimBalance);
                    } else{
                    return sum
                }; 
            }, 0)
            var days120Above = GetDataTouchedCounts.reduce(function(sum, dataGet){
                if(dataGet.Aging >= 121){
                    return sum + Number(dataGet.ClaimBalance);
                    } else{
                    return sum
                }; 
            }, 0)
            
            TouchedTotalAmount30.push(days30)
            TouchedTotalAmount60.push(days60)
            TouchedTotalAmount90.push(days90)
            TouchedTotalAmount120.push(days120)
            TouchedTotalAmount120Above.push(days120Above)
        }
        CahrtData.push(TotalAmount30,TotalAmount60,TotalAmount90,TotalAmount120,TotalAmount120Above)

        CahrtDataTouched.push(TouchedTotalAmount30,TouchedTotalAmount60,TouchedTotalAmount90,TouchedTotalAmount120,TouchedTotalAmount120Above)

        res.json({
            data: CahrtData,
            CahrtDataTouched : CahrtDataTouched,
            Message : "Data Not Found"
        })
        
    } else {
        var ResponseData = []
        res.json({
            data: ResponseData,
            CahrtDataTouched : [],
            Message : "Data Not Found"
        })
    }

})

router.get('/getClaimbyUser', passport.authenticate("jwt", { session: false }), async (req, res) => {


    var QueryParams = [
        {
            $match: { 
                AssignTo: new ObjectID(req.query.UserId),
                SystemStatus : { $nin : ["Auto Close","AC"]} 
            }
        },
        {
            $project: {
                "Aging": {
                    $round: { $divide: [{ $subtract: [new Date(), '$DateOfService'] }, 86400000] }
                },
                ClaimBalance: '$ClaimBalance',
            }
        },
        {
            $match: { "Aging": { $lt: 30, $gte: 0 } }
        },
        {$sort : {TotalAmount:-1}},
        { $limit: 10 },
    ]
    var Gettotal = await Claim_Master.aggregate(QueryParams)
    console.log("Gettotal",Gettotal)
    var QueryParams = [
        {
            $match: { 
                AssignTo: new ObjectID(req.query.UserId),
                SystemStatus : { $nin : ["Auto Close","AC"]} 
            }
        },
        {
            $project: {
                "Aging": {
                    $round: { $divide: [{ $subtract: [new Date(), '$DateOfService'] }, 86400000] }
                },
                ClaimBalance: '$ClaimBalance',
            }
        },
        {
            $match: { "Aging": { $lt: 60, $gte: 30 } }
        },
        {$sort : {TotalAmount:-1}},
        { $limit: 10 },
    ]
    var Gettotal = await Claim_Master.aggregate(QueryParams)
    console.log("Gettotal",Gettotal)
    var QueryParams = [
        {
            $match: { 
                AssignTo: new ObjectID(req.query.UserId),
                SystemStatus : { $nin : ["Auto Close","AC"]} 
            }
        },
        {
            $project: {
                "Aging": {
                    $round: { $divide: [{ $subtract: [new Date(), '$DateOfService'] }, 86400000] }
                },
                ClaimBalance: '$ClaimBalance',
            }
        },
        {
            $match: { "Aging": { $lt: 90, $gte: 60 } }
        },
        {$sort : {TotalAmount:-1}},
        { $limit: 10 },
    ]
    var Gettotal = await Claim_Master.aggregate(QueryParams)
    console.log("Gettotal",Gettotal)

    var QueryParams = [
        {
            $match: { 
                AssignTo: new ObjectID(req.query.UserId),
                SystemStatus : { $nin : ["Auto Close","AC"]} 
            }
        },
        {
            $project: {
                "Aging": {
                    $round: { $divide: [{ $subtract: [new Date(), '$DateOfService'] }, 86400000] }
                },
                ClaimBalance: '$ClaimBalance',
            }
        },
        {
            $match: { "Aging": { $lt: 120, $gte: 90 } }
        },
        {$sort : {TotalAmount:-1}},
        { $limit: 10 },
    ]
    var Gettotal = await Claim_Master.aggregate(QueryParams)

    console.log("Gettotal",Gettotal)
    var QueryParams = [
        {
            $match: { 
                AssignTo: new ObjectID(req.query.UserId),
                SystemStatus : { $nin : ["Auto Close","AC"]} 
            }
        },
        {
            $project: {
                "Aging": {
                    $round: { $divide: [{ $subtract: [new Date(), '$DateOfService'] }, 86400000] }
                },
                ClaimBalance: '$ClaimBalance',
            }
        },
        {
            $match: { "Aging": {  $gte: 120 } }
        },
        {$sort : {TotalAmount:-1}},
        { $limit: 10 },
    ]
    var Gettotal = await Claim_Master.aggregate(QueryParams)


    console.log("Gettotal",Gettotal)

    var UserList = await Claim_Master.aggregate([
        {
            $match: { 
                AssignTo: new ObjectID(req.query.UserId),
                SystemStatus : { $nin : ["Auto Close","AC"]} 
            }
        },
        {
            "$group": {

                "_id": "$PayerName",
                "TotalAmount": {
                    "$sum": { '$toDouble': '$ClaimBalance' }
                },
                "count": {
                    "$sum": 1
                }
            }
        },
        {$sort : {TotalAmount:-1}},
        { $limit: 10 },
    ])


    var StatusWise = await Claim_Master.aggregate([
        {
            $match: { 
                AssignTo: new ObjectID(req.query.UserId),
                SystemStatus : { $nin : ["Auto Close","AC"]} 
            }
        },
        {
            "$group": {
                "_id": "$SystemStatus",
                "TotalAmount": {
                    "$sum": { '$toDouble': '$ClaimBalance' }
                },
                "count": {
                    "$sum": 1
                }
            }
        },
        {$sort : {TotalAmount:-1}},
        { $limit: 10 },
    ])


    var ProviderNameWise = await Claim_Master.aggregate([
        {
            $match: { 
                AssignTo: new ObjectID(req.query.UserId),
                SystemStatus : { $nin : ["Auto Close","AC"]} 
            }
        },
        {
            "$group": {
                "_id": "$ProviderName",
                "TotalAmount": {
                    "$sum": { '$toDouble': '$ClaimBalance' }
                },
                "count": {
                    "$sum": 1
                }
            }
        },
        {$sort : {TotalAmount:-1}},
        { $limit: 10 },
    ])



    var PracticeWiseData = await Claim_Master.aggregate([
        {
            $match: { 
                AssignTo: new ObjectID(req.query.UserId),
                SystemStatus : { $nin : ["Auto Close","AC"]} 
            }
        },
        {
            "$group": {
              
                "_id": "$PracticeId",
                "TotalAmount": {
                    "$sum": { '$toDouble': '$ClaimBalance' }
                },
                "count": {
                    "$sum": 1
                }
            }
        },
        {
            $project: {
                TotalAmount : "$TotalAmount",
                _id: "$_id",
            }
        },
        {$sort : {TotalAmount:-1}},
        { $limit: 10 },
        
    ])

    var PayerNameData = [["Payer Wise", "Total"]]
    var ProviderNameWiseData = [["Provider Wise", "Total"]]
    var StatusWiseData = [["Status Wise", "Total"]]
    UserList.map((res,ind)=>{
        PayerNameData.push([
            res._id,
            res.TotalAmount
        ])
    })
    
    StatusWise.map((res,ind)=>{
        StatusWiseData.push([
            res._id,
            res.TotalAmount
        ])
    })

    ProviderNameWise.map((res,ind)=>{
        ProviderNameWiseData.push([
            res._id,
            res.TotalAmount
        ])
    })
    
    var PracticeWiseChartData = [["Practice Wise", "Total"]]
    for (var i = 0; i < PracticeWiseData.length; i++) {

        var getPracticeCoumns = await Practice.findOne({ _id: new ObjectID(PracticeWiseData[i]._id) }, { PracticeName: 1 })
        if (getPracticeCoumns) {
            PracticeWiseChartData.push([
                getPracticeCoumns.PracticeName,
                PracticeWiseData[i].TotalAmount
            ])
        }
    }
    res.json({
        PayerNameData: PayerNameData,
        ProviderNameWise: ProviderNameWiseData,
        StatusWise: StatusWiseData,
        PracticeWise : PracticeWiseChartData
    })
})


router.get('/getClaims', passport.authenticate("jwt", { session: false }), async (req, res) => {
    var query = { $and: [] }
    var ExcelColumns = []
    let { page, limit } = req.query
    if (!page) page = 1
    if (!limit) limit = 10
    page = parseInt(page)
    limit = parseInt(limit)
  
    var PracticeId = JSON.parse(req.query.practicelist)
    if(PracticeId.length == 0){
        res.json({
            data: [],
            total: 0
        })
        return false;
    }
    var Fitler = {}
    
    if(!req.query.filter){
        res.json({
            data: [],
            total: []
        })
        return false;
    }

    var filter = JSON.parse(req.query.filter)
    filter.map((getFilterData,ind)=>{
        Object.assign(Fitler,getfilter(getFilterData))
    })

    var SortColumns = {}
    var SortData = JSON.parse(req.query.sort)
    SortData.map((GetSort,ind)=>{
        Object.assign(SortColumns,{[GetSort.field] : GetSort.sort == "asc" ? 1 : -1})
    })
    var PracticeIDList = []

    PracticeId.map((res) => {
        PracticeIDList.push(new ObjectID(res._id))
    })
    
    query.$and.push({ PracticeId: { $in: PracticeIDList } })
    if (req.user.RoleType != "admin") {
        query.$and.push({ AssignedBy: new ObjectID(req.user._id) })
    }
    query.$and.push({ SystemStatus: { $nin : ["Atuo Close"]} })
    Object.assign(ProjectColumns,{FirstName: '$FirstName',LastName: '$LastName'})
    
    if (Object.keys(Fitler).length > 0) {

            Object.assign(Fitler, { PracticeId: { $in: PracticeIDList } })
            if (req.user.RoleType != "admin") {
                Object.assign(Fitler, { AssignedBy: new ObjectID(req.user._id) })
            }
            Object.assign(Fitler, { SystemStatus: { $nin : ["Atuo Close"]} })
            
            var AgingFilter
            if(Fitler.Aging){
                AgingFilter = {
                    $match: {Aging : Fitler.Aging}
                }
                delete Fitler.Aging
            }
            var QueryParams = [
                {   
                    "$addFields" : {
                        
                        ClaimBalance: { $toDouble: "$ClaimBalance" },
                        ProcedureBilledAmount : { $toDouble: "$ProcedureBilledAmount" },
                        ProcedurePayment : { $toDouble: "$ProcedurePayment" },
                        ProcedureAdjustment : { $toDouble: "$ProcedureAdjustment" },
                        ClaimBilledAmount:  { $toDouble: "$ClaimBilledAmount" },
                        ClaimPayment: { $toDouble: "$ClaimPayment" },
                    }},
                {
                    $match: Fitler
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "AssignTo",    // field in the Opportunities collection
                        foreignField: "_id",  // From Tables coestimations
                        as: "users"
                    }
                },
                {
                    $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$users", 0 ] }, "$$ROOT" ] } }
                },
    
                {
                    $project: ProjectColumns
                }
            ]
            if(Object.keys(SortColumns).length > 0){
                QueryParams.push({ $sort: SortColumns})
            }
            if(AgingFilter){
                QueryParams.push(AgingFilter)
            }
            QueryParams.push({ $skip: (Number(page)) * Number(limit) })
            QueryParams.push({ $limit: Number(limit) })
            
            var totalCount = await getTotalCount(QueryParams)
            if (req.query.type == "view") {
                Claim_Master.aggregate(QueryParams).then((getDatares) => {
                    res.json({
                        data: getDatares,
                        total: totalCount
                    })
                })
            }
            if (req.query.type == "download") {

                var GetSelectedColumns = await UserDatatableColumns.findOne({ 
                    UserId: new ObjectID(req.user._id) ,
                    PageType : "ViewClaims"
                })
                var ProjectSelectedColumns = {}
                var ExcelColumns = []
                if(GetSelectedColumns){
                    GetSelectedColumns.Columns.map((dd,i)=>{
                        if(Boolean(dd.value)){
                            var headerLabel = dd.label
                            if(dd.label == "updatedAt"){
                                headerLabel = "Last Worked Date"
                            }else if(dd.label == "FirstName"){
                                headerLabel = "Update By"
                            }
                            ExcelColumns.push({ header: headerLabel, key: dd.label, width: 20 })
                            if(dd.label == "updatedAt"){
                                Object.assign(ProjectSelectedColumns,{[dd.label] : { $dateToString: { format: "%Y-%m-%d", date: "$LastWorkingDate" } }})
                            }else if(dd.label == "Aging"){
                                Object.assign(ProjectSelectedColumns,{[dd.label] : {
                                    $round: { $divide: [{ $subtract: [new Date(), '$DateOfService'] }, 86400000] }
                                }})
                            }else{
                                Object.assign(ProjectSelectedColumns,{[dd.label] : `$${dd.label}`})
                            }
                        }
                    })
                }
                var QueryParams = [
                    {   
                        "$addFields" : {
                            
                            ClaimBalance: { $toDouble: "$ClaimBalance" },
                            ProcedureBilledAmount : { $toDouble: "$ProcedureBilledAmount" },
                            ProcedurePayment : { $toDouble: "$ProcedurePayment" },
                            ProcedureAdjustment : { $toDouble: "$ProcedureAdjustment" },
                            ClaimBilledAmount:  { $toDouble: "$ClaimBilledAmount" },
                            ClaimPayment: { $toDouble: "$ClaimPayment" },
                        }},
                    {
                        $match: Fitler
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "AssignTo",    // field in the Opportunities collection
                            foreignField: "_id",  // From Tables coestimations
                            as: "users"
                        }
                    },
                    {
                        $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$users", 0 ] }, "$$ROOT" ] } }
                    },
        
                    {
                        $project: ProjectSelectedColumns
                    }
                ]
                if(Object.keys(SortColumns).length > 0){
                    QueryParams.push({ $sort: SortColumns})
                }
                Claim_Master.aggregate(QueryParams).then((getDatares) => {
                    
                    let workbook = new excel.Workbook();
                    let worksheet = workbook.addWorksheet(`Claims`);
                    worksheet.columns = ExcelColumns
                    // Add Array Rows
                    worksheet.addRows(getDatares);
                    res.setHeader(
                        "Content-Type",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    );
                    res.setHeader(
                        "Content-Disposition",
                        "attachment; filename=" + `Claims-${moment().format("YYYYMMDDhms")}.xlsx`
                    );
                    return workbook.xlsx.write(res).then(function () {
                        res.status(200).end();
                    });
                        
                })
            }
        } else {

            var QueryParams = { PracticeId: { $in: PracticeIDList } }
            if (req.user.RoleType != "admin") {
                Object.assign(QueryParams, { AssignedBy: new ObjectID(req.user._id) })
            }
            
            Object.assign(QueryParams, { SystemStatus: { $nin : ["Atuo Close"]} })
            var totalCount = await Claim_Master.countDocuments(QueryParams)

            if (req.query.type == "view") {

                var Query = [
                    {   
                        "$addFields" : {
                            
                            ClaimBalance: { $toDouble: "$ClaimBalance" },
                            ProcedureBilledAmount : { $toDouble: "$ProcedureBilledAmount" },
                            ProcedurePayment : { $toDouble: "$ProcedurePayment" },
                            ProcedureAdjustment : { $toDouble: "$ProcedureAdjustment" },
                            ClaimBilledAmount:  { $toDouble: "$ClaimBilledAmount" },
                            ClaimPayment: { $toDouble: "$ClaimPayment" },
                        }},
                    {
                        $match: QueryParams
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "AssignTo",    // field in the Opportunities collection
                            foreignField: "_id",  // From Tables coestimations
                            as: "users"
                        }
                    },
                    {
                        $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$users", 0 ] }, "$$ROOT" ] } }
                    },
        
                    {
                        $project: ProjectColumns
                    },
                    
                ]
                if(Object.keys(SortColumns).length > 0){
                    Query.push({ $sort: SortColumns})
                }
                Query.push({ $skip: (Number(page)) * Number(limit) })
                Query.push({ $limit: Number(limit) })
                Claim_Master.aggregate(Query).then((getDatares) => {

                    res.json({
                        data: getDatares,
                        total: totalCount
                    })
                })
            } else {
                var GetSelectedColumns = await UserDatatableColumns.findOne({ 
                    UserId: new ObjectID(req.user._id) ,
                    PageType : "ViewClaims"
                })
                var ProjectSelectedColumns = {}
                var ExcelColumns = []
                if(GetSelectedColumns){
                    GetSelectedColumns.Columns.map((dd,i)=>{
                        if(Boolean(dd.value)){
                            var headerLabel = dd.label
                            if(dd.label == "updatedAt"){
                                headerLabel = "Last Worked Date"
                            }else if(dd.label == "FirstName"){
                                headerLabel = "Update By"
                            }
                            ExcelColumns.push({ header: headerLabel, key: dd.label, width: 20 })
                            if(dd.label == "updatedAt"){
                                Object.assign(ProjectSelectedColumns,{[dd.label] : { $dateToString: { format: "%Y-%m-%d", date: "$LastWorkingDate" } }})
                            }else if(dd.label == "Aging"){
                                Object.assign(ProjectSelectedColumns,{[dd.label] : {
                                    $round: { $divide: [{ $subtract: [new Date(), '$DateOfService'] }, 86400000] }
                                }})
                            }else{
                                Object.assign(ProjectSelectedColumns,{[dd.label] : `$${dd.label}`})
                            }
                        }
                    })
                }

                var Query = [
                    {   
                        "$addFields" : {
                            
                            ClaimBalance: { $toDouble: "$ClaimBalance" },
                            ProcedureBilledAmount : { $toDouble: "$ProcedureBilledAmount" },
                            ProcedurePayment : { $toDouble: "$ProcedurePayment" },
                            ProcedureAdjustment : { $toDouble: "$ProcedureAdjustment" },
                            ClaimBilledAmount:  { $toDouble: "$ClaimBilledAmount" },
                            ClaimPayment: { $toDouble: "$ClaimPayment" },
                        }},
                    {
                        $match: QueryParams
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "AssignTo",    // field in the Opportunities collection
                            foreignField: "_id",  // From Tables coestimations
                            as: "users"
                        }
                    },
                    {
                        $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$users", 0 ] }, "$$ROOT" ] } }
                    },
        
                    {
                        $project: ProjectSelectedColumns
                    }
                ]
                if(Object.keys(SortColumns).length > 0){
                    Query.push({ $sort: SortColumns})
                }
                Claim_Master.aggregate(Query).then((getDatares) => {
                    
                    let workbook = new excel.Workbook();
                    let worksheet = workbook.addWorksheet(`Claims`);
                    worksheet.columns = ExcelColumns
                    // Add Array Rows
                    worksheet.addRows(getDatares);
                    res.setHeader(
                        "Content-Type",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    );
                    res.setHeader(
                        "Content-Disposition",
                        "attachment; filename=" + `Claims-${moment().format("YYYYMMDDhms")}.xlsx`
                    );
                    return workbook.xlsx.write(res).then(function () {
                        res.status(200).end();
                    });
                        
                })
            }
        }
    

})

router.get('/GetClaimOutstandingbyid', passport.authenticate("jwt", { session: false }), async (req, res) => {

    var query = { $and: [] }
    var Params = JSON.parse(req.query.account)

    if (Params.PracticeId) {
        var PracticeIDList = [new ObjectID(Params.PracticeId)]

        var PraciiceData = ["Aging"]
        for (var i = 0; i < PracticeId.length; i++) {

            var getPracticeCoumns = await Practice.findOne({ _id: new ObjectID(Params.PracticeId) }, { PracticeName: 1 })
            PraciiceData.push(getPracticeCoumns.PracticeName)
        }
        var CahrtData = [PraciiceData]
        var CahrtDataTouched = [PraciiceData]
        var TotalAmount30 = ["0 - 30"]
        var TotalAmount60 = ["30 - 60"]
        var TotalAmount90 = ["60 - 90"]
        var TotalAmount120 = ["90 - 120"]
        var TotalAmount120Above = ["120 Above"]

        var TouchedTotalAmount30 = ["0 - 30"]
        var TouchedTotalAmount60 = ["30 - 60"]
        var TouchedTotalAmount90 = ["60 - 90"]
        var TouchedTotalAmount120 = ["90 - 120"]
        var TouchedTotalAmount120Above = ["120 Above"]
        
        query.$and.push({
            PracticeId: { $in: PracticeIDList },
            SystemStatus: { $in: StatusCodes },
            [Params.Type]: Params.data
        })
        if (req.user.RoleType == "AR-Caller") {
            query.$and.push({ AssignTo: new ObjectID(req.user._id) })
            query.$and.push({ SystemStatus: { $in: StatusCodes } })
        }

        var GetDataUNTouchedCounts = await GetTotalAmountClaimBalance(query, "UntotalAmount")
            
        var days30 = GetDataUNTouchedCounts.reduce(function(sum, dataGet){
            if(dataGet.Aging >= 0 && dataGet.Aging <= 30){
                return sum + Number(dataGet.ClaimBalance);
                } else{
                return sum
            }; 
        }, 0)

        var days60 = GetDataUNTouchedCounts.reduce(function(sum, dataGet){
            if(dataGet.Aging >= 31 && dataGet.Aging <= 60){
                return sum + Number(dataGet.ClaimBalance);
                } else{
                return sum
            }; 
        }, 0)
        var days90 = GetDataUNTouchedCounts.reduce(function(sum, dataGet){
            if(dataGet.Aging >= 61 && dataGet.Aging <= 90){
                return sum + Number(dataGet.ClaimBalance);
                } else{
                return sum
            }; 
        }, 0)
        var days120 = GetDataUNTouchedCounts.reduce(function(sum, dataGet){
            if(dataGet.Aging >= 91 && dataGet.Aging <= 120){
                return sum + Number(dataGet.ClaimBalance);
                } else{
                return sum
            }; 
        }, 0)
        var days120Above = GetDataUNTouchedCounts.reduce(function(sum, dataGet){
            if(dataGet.Aging >= 121){
                return sum + Number(dataGet.ClaimBalance);
                } else{
                return sum
            }; 
        }, 0)
        
        TotalAmount30.push(days30)
        TotalAmount60.push(days60)
        TotalAmount90.push(days90)
        TotalAmount120.push(days120)
        TotalAmount120Above.push(days120Above)

        delete query.$and[0].SystemStatus;
        query.$and.push({
            SystemStatus: { $nin: StatusCodes }
        })

        var GetDataTouchedCounts = await GetTotalAmountClaimBalance(query, "TouchedtotalAmount")
        

        var days30 = GetDataTouchedCounts.reduce(function(sum, dataGet){
            if(dataGet.Aging >= 0 && dataGet.Aging <= 30){
                return sum + Number(dataGet.ClaimBalance);
                } else{
                return sum
            }; 
        }, 0)

        var days60 = GetDataTouchedCounts.reduce(function(sum, dataGet){
            if(dataGet.Aging >= 31 && dataGet.Aging <= 60){
                return sum + Number(dataGet.ClaimBalance);
                } else{
                return sum
            }; 
        }, 0)
        var days90 = GetDataTouchedCounts.reduce(function(sum, dataGet){
            if(dataGet.Aging >= 61 && dataGet.Aging <= 90){
                return sum + Number(dataGet.ClaimBalance);
                } else{
                return sum
            }; 
        }, 0)
        var days120 = GetDataTouchedCounts.reduce(function(sum, dataGet){
            if(dataGet.Aging >= 91 && dataGet.Aging <= 120){
                return sum + Number(dataGet.ClaimBalance);
                } else{
                return sum
            }; 
        }, 0)
        var days120Above = GetDataTouchedCounts.reduce(function(sum, dataGet){
            if(dataGet.Aging >= 121){
                return sum + Number(dataGet.ClaimBalance);
                } else{
                return sum
            }; 
        }, 0)
        
        TouchedTotalAmount30.push(days30)
        TouchedTotalAmount60.push(days60)
        TouchedTotalAmount90.push(days90)
        TouchedTotalAmount120.push(days120)
        TouchedTotalAmount120Above.push(days120Above)
        
        CahrtData.push(TotalAmount30,TotalAmount60,TotalAmount90,TotalAmount120,TotalAmount120Above)

        CahrtDataTouched.push(TouchedTotalAmount30,TouchedTotalAmount60,TouchedTotalAmount90,TouchedTotalAmount120,TouchedTotalAmount120Above)

        res.json({
            data: CahrtData,
            CahrtDataTouched : CahrtDataTouched,
            Message : "Data Not Found"
        })
    } else {
        res.json({
            data: []
        })
    }
})




router.post("/PostComments", passport.authenticate("jwt", { session: false }), async (req, res) => {
    var ClaimLines = JSON.parse(req.body.ClaimLines)
    var ClaimHistory = []
    for (var i = 0; i < ClaimLines.length; i++) {
        var UpdateData = { updated_by: req.user._id }

        if (req.body.Comments) {
            Object.assign(UpdateData, { Comments: req.body.Comments })
        }
        await Claim_Master.updateOne({ _id: ClaimLines[i]._id }, UpdateData)
        Object.assign(UpdateData, { UserId: req.user._id })
        Object.assign(UpdateData, { CreatedBy: req.user._id })
        Object.assign(UpdateData, { ClaimId: ClaimLines[i]._id })
        var GetClaimData = await Claim_Master.findOne({ _id: new ObjectID(ClaimLines[i]._id) },{PracticeId:1})
        Object.assign(UpdateData, { ClaimPracticeId: GetClaimData.PracticeId })
        ClaimHistory.push(UpdateData)

        if (ClaimLines.length - 1 == i) {
            ClaimStatusUpdate.insertMany(ClaimHistory).then((getData) => {
                res.json({
                    data: getData,
                    Result: true,
                })
            })
        }
    }
})


router.post("/AssignClaimUser", passport.authenticate("jwt", { session: false }), async (req, res) => {
    var ClaimLines = JSON.parse(req.body.ClaimLines)

    for (var i = 0; i < ClaimLines.length; i++) {

        var UpdateData = {
            AssignedBy: new ObjectID(req.user._id),
            AssignTo: new ObjectID(req.body.UserName),
            Priority: Number(req.body.Priority),
            AssignDate : moment().format("YYYY-MM-DD")
        }
        await Claim_Master.updateOne({ _id: ClaimLines[i]._id }, UpdateData)

        if (ClaimLines.length - 1 == i) {
            res.json({
                data: "User Assign Success..",
                Result: true,
            })
        }
    }
})

router.post("/ClaimUpdate", passport.authenticate("jwt", { session: false }), async (req, res) => {

    if(req.body.ClaimHistoryId){
        var ClaimHistory = await ClaimStatusUpdate.findOne({_id : new ObjectID(req.body.ClaimHistoryId)})
        if(ClaimHistory){

            var UpdateData = { updated_by: req.user._id }
            Object.assign(UpdateData, { LastWorkingDate:  moment().format("YYYY-MM-DD") })
            if (req.body.StatusCode) {
                Object.assign(UpdateData, { SystemStatus: req.body.StatusCode.value })
                Object.assign(UpdateData, { StatusCode: req.body.StatusCode.value })
    
            }
            if (req.body.ChangeRootCause) {
                Object.assign(UpdateData, { RootCause: req.body.ChangeRootCause.value })
            }
            if (req.body.Comments) {
                Object.assign(UpdateData, { Comments: req.body.Comments })
            }
            if (req.body.duedate) {
                Object.assign(UpdateData, { DueDate: moment(req.body.duedate).format("YYYY-MM-DD") })
            }
            if(req.body.PageType == "PCA"){
                Object.assign(UpdateData, { PCAStatus: "Yes" })
                Object.assign(UpdateData, { PCAStatusDate: moment().format("YYYY-MM-DD") })
            }
            await Claim_Master.updateOne({ _id: new ObjectID(ClaimHistory.ClaimId) }, UpdateData)
            if (req.user.RoleType == "AR-Caller") {
                await Claim_Master.updateOne({ _id: new ObjectID(ClaimHistory.ClaimId) ,AssignTo : {$eq : null} }, {...UpdateData,AssignTo: req.user._id,AssignedBy: new ObjectID(req.user._id),Priority: 0,AssignDate : moment().format("YYYY-MM-DD") })
            }
            Object.assign(UpdateData, { UserId: req.user._id })
            Object.assign(UpdateData, { CreatedBy: req.user._id })
            await ClaimStatusUpdate.updateOne({_id : new ObjectID(req.body.ClaimHistoryId)}, UpdateData)

            res.json({
                data: UpdateData,
                Result: true,
            })
        }else {
            res.json({
                data: [],
                Result: false,
            })
        }
        
    }else {
        var ClaimLines = JSON.parse(req.body.ClaimLines)
        var ClaimHistory = []
        for (var i = 0; i < ClaimLines.length; i++) {
            var UpdateData = { updated_by: req.user._id }
            Object.assign(UpdateData, { LastWorkingDate:  moment().format("YYYY-MM-DD") })
            if (req.body.StatusCode) {
                Object.assign(UpdateData, { SystemStatus: req.body.StatusCode.value })
                Object.assign(UpdateData, { StatusCode: req.body.StatusCode.value })
    
            }
            if (req.body.ChangeRootCause) {
                Object.assign(UpdateData, { RootCause: req.body.ChangeRootCause.value })
            }
            if (req.body.Comments) {
                Object.assign(UpdateData, { Comments: req.body.Comments })
            }
            if (req.body.duedate) {
                Object.assign(UpdateData, { DueDate: moment(req.body.duedate).format("YYYY-MM-DD") })
            }
            if(req.body.PageType == "PCA"){
                Object.assign(UpdateData, { PCAStatus: "Yes" })
                Object.assign(UpdateData, { PCAStatusDate: moment().format("YYYY-MM-DD") })
            }
            await Claim_Master.updateOne({ _id: ClaimLines[i]._id }, UpdateData)
            if (req.user.RoleType == "AR-Caller") {
                await Claim_Master.updateOne({ _id: ClaimLines[i]._id ,AssignTo : {$eq : null} }, {...UpdateData,AssignTo: req.user._id,AssignedBy: new ObjectID(req.user._id),Priority: 0,AssignDate : moment().format("YYYY-MM-DD") })
            }
            Object.assign(UpdateData, { UserId: req.user._id })
            Object.assign(UpdateData, { CreatedBy: req.user._id })
            Object.assign(UpdateData, { ClaimId: ClaimLines[i]._id })
            var GetClaimData = await Claim_Master.findOne({ _id: new ObjectID(ClaimLines[i]._id) },{PracticeId:1})
            Object.assign(UpdateData, { ClaimPracticeId: GetClaimData.PracticeId })
            ClaimHistory.push(UpdateData)
    
            if (ClaimLines.length - 1 == i) {
                ClaimStatusUpdate.insertMany(ClaimHistory).then((getData) => {
                    res.json({
                        data: getData,
                        Result: true,
                    })
                })
            }
        }
    }
    
})

router.post('/GetClaimColumns', passport.authenticate("jwt", { session: false }), async (req, res) => {

    PmSystem.findOne({ _id: req.body.PostData }).then((getData) => {
        ClaimColumn.find({ ClaimLevel: getData.ClaimLevel }).then((getDatares) => {
            var data = []
            getDatares.map((ress, index) => {
                data.push({
                    label: ress.ColumnName,
                    value: ress.ColumnName
                })
                if (index == getDatares.length - 1) {
                    res.json({
                        Data: data
                    })
                }
            })
        })
    })
});

module.exports = router;