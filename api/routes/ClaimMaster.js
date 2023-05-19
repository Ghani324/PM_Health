const express = require('express');
const passport = require('passport');
const router = express.Router();
const authCheck = require("../Config/auth")
const PmSystem = require('../models/PmSystem');
const Practice = require("../models/Practice")
const ClaimColumn = require("../models/ClaimColumn")
const Claim_Master = require("../models/ClaimMaster")
const UserDatatableColumns = require("../models/UserDatatableColumns")
const ClaimStatusUpdate = require("../models/ClaimStatusUpdate")
const FileUploadLogs = require("../models/FileUploadLogs");
const arScenario = require("../models/arScenario")
const ClaimUploadlog = require("../Config/ClaimUploadlog")
const moment = require("moment-timezone");
moment.tz.setDefault("America/florida");
const fs = require('fs');
const excel = require("exceljs");
const ClaimMasterTemp = require("../models/ClaimMasterTemp")
const AWS = require('aws-sdk');
const path = require('path');
const reader = require('xlsx')
const multer = require("multer");
var storageSinfleFile = multer.memoryStorage()
const uploadSinfleFile = multer({ storage: storageSinfleFile })
var ObjectID = require('mongodb').ObjectID;
const StatusCodes = ["Open", "Fresh-Call", "RECBILL", "HOLD", "Auto Open","CALL",'RECALL','MRV']
const ColumnSkipArray = ["PracticeId", "id", "updatedAt", "_id"]
const s3Client = new AWS.S3({
    accessKeyId: 'AKIAR7HUOMYCU45WU3CD',
    secretAccessKey: '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',
    region: 'ap-northeast-1'
});
const uploadParams = {
    Bucket: 'scio-ar-tracking',
    Key: "", // pass key
    Body: null, // pass file body
};

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
                $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$users", 0] }, "$$ROOT"] } }
            },
            {
                $project: {
                    FirstName: "$FirstName", Status: "$Status", ClaimId: '$ClaimId', UserId: '$UserId', StatusCode: '$StatusCode', DueDate: '$DueDate', Comments: '$Comments', Type: '$Type', CreatedBy: '$CreatedBy', id: "$_id", updatedAt: "$updatedAt", createdAt: "$createdAt"
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
    IntialClaimDate : "$IntialClaimDate",
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
    ProcedureBilledAmount : { $toDouble: "$ProcedureBilledAmount" },
    ProcedurePayment : { $toDouble: "$ProcedurePayment" },
    ProcedureAdjustment : { $toDouble: "$ProcedureAdjustment" },
    ClaimBilledAmount:  { $toDouble: "$ClaimBilledAmount" },
    ClaimPayment: { $toDouble: "$ClaimPayment" },
    ClaimBalance: { $toDouble: "$ClaimBalance" },
    Aging: {
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
    Account: '$Account',
    ProviderName: '$ProviderName',
    PracticeId: '$PracticeId',
    Priority: '$Priority',
    id: "$_id",
    updatedAt: { $dateToString: { format: "%Y-%m-%d", date: "$LastWorkingDate" } },
    updated_by : "$updated_by",
    RootCause: "$RootCause",
    CallerStatusChanged : "$CallerStatusChanged",
    PCAStatus: "$PCAStatus",
    CallerStatusChangedDate: { $dateToString: { format: "%Y-%m-%d", date: "$CallerStatusChangedDate" } }
}
Object.assign(ProjectColumns,{FirstName: '$FirstName',LastName: '$LastName'})
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

    var PayerNameData = [["Payer Wise", "Claim Balance"]]
    var PayerNameDataForClaim = [["Payer Wise", "No of Claims"]]
    var StatusWiseData = [["Status Wise", "Claim Balance"]]
    var StatusWiseDataForClaim = [["Status Wise", "No of Claims"]]
    var ProviderNameWiseData = [["Provider Wise", "Claim Balance"]]
    var ProviderNameWiseDataForClaim = [["Provider Wise", "No of Claims"]]
    var RootCauseData = [["RootCause Wise", "Claim Balance"]]
    var RootCauseDataForClaim = [["RootCause Wise", "No of Claims"]]
    var PracticeWiseData = [["Practice Wise", "Claim Balance"]]
    var PracticeWiseDataForClaim = [["Practice Wise", "No of Claims"]]
    var AgeingWiseChartData = [["Ageing Wise", "Claim Balance"]]
    var AgeingWiseChartDataForClaim = [["Ageing Wise", "No of Claims"]]


    var PayerNameDataTable = []
    var StatusWiseTableData = []
    var ProviderWiseTableData = []
    var RootCauseWiseTableData = []
    var PracticeWiseTableData = []
    var AgeingWiseTableData = []


const radio=req.query.radio;
const UserId=new ObjectID(req.query.UserId)

var QueryParms= {
    $match: {
        AssignTo:{"$in":[UserId]},
        // PracticeId: { $in: PracticeIdsList },
        SystemStatus: { $nin: ["Auto Close"] },
    }
}


if (radio === "PAYER WISE") {
    if (req.query.FromDate && req.query.ToDate) {
        const endDate = new Date(req.query.ToDate);
        endDate.setUTCHours(23, 59, 59);
        var QueryParmsForDate = {
            $match: {
                createdAt: { $gte: new Date(req.query.FromDate), $lte: new Date(endDate.toString()) },
                // PracticeId: { $in: PracticeIdsList },
                AssignTo:{"$in":[UserId]},
                SystemStatus: { $nin: ["Auto Close"] },

            }
        }
        var UserListAging=await Claim_Master.aggregate([
            QueryParmsForDate,
            {
        '$lookup': {
        from: 'claimstatusupdates',
        localField: '_id',
        foreignField: 'ClaimId',
        as: 'claimstatusupdates',
        pipeline: [
            { $match: { UserId: { $in: [UserId] } } },
        { $sort: { updatedAt: -1 } }, { $limit: 1 }],
        }
        },
        {
        '$project': {
        "ClaimBalance": "$ClaimBalance",
        DateOfService: '$DateOfService',
        PayerName: '$PayerName',
        Aging: {
        $round: { $divide: [{ $subtract: [{ '$arrayElemAt': ['$claimstatusupdates.updatedAt', 0] }, '$DateOfService'] }, 86400000] },
        },
        }
        },
        {
            "$match":{
                "Aging":{
                    "$nin":[null]
                }
            }
        } 
       
        ])




        var days60 = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging >= 0 && dataGet.Aging <= 60) {

                const { PayerName, ClaimBalance } = dataGet
                if (!sum[PayerName]) {
                    sum[PayerName] = { PayerName, TotalAmount60: 0, Count60: 0 }
                }
                sum[PayerName].TotalAmount60 += Number(ClaimBalance)
                sum[PayerName].Count60 += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer60 = days60 ? Object.values(days60) : []

        
        var days120 = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging > 60 && dataGet.Aging <= 120) {

                const { PayerName, ClaimBalance } = dataGet
                if (!sum[PayerName]) {
                    sum[PayerName] = { PayerName, TotalAmount120: 0, Count120: 0 }
                }
                sum[PayerName].TotalAmount120 += Number(ClaimBalance)
                sum[PayerName].Count120 += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer120 = days120 ? Object.values(days120) : []

      
        var days120plus = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging > 120) {

                const { PayerName, ClaimBalance } = dataGet
                if (!sum[PayerName]) {
                    sum[PayerName] = { PayerName, TotalAmount120plus: 0, Count120plus: 0 }
                }
                sum[PayerName].TotalAmount120plus += Number(ClaimBalance)
                sum[PayerName].Count120plus += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer120plus = days120plus ? Object.values(days120plus) : []

       
        const mergedArray = [payer60, payer120, payer120plus].reduce((result, arr) => {
            arr.forEach(obj => {
              if (Object.keys(obj).length !== 0) {
                const matchingObj = result.find(item => item.PayerName === obj.PayerName);
                if (matchingObj) {
                  Object.assign(matchingObj, obj);
                } else {
                  result.push({...obj});
                }
              }
            });
            return result;
          }, []);
      


        for (let i = 0; i < mergedArray.length; i++) {
            let obj = mergedArray[i];
            let totalAmount = 0;
            let count = 0;

            if (obj.TotalAmount60) totalAmount += obj.TotalAmount60;
            if (obj.Count60) count += obj.Count60;
            if (obj.TotalAmount120) totalAmount += obj.TotalAmount120;
            if (obj.Count120) count += obj.Count120;
            if (obj.TotalAmount120plus) totalAmount += obj.TotalAmount120plus;
            if (obj.Count120plus) count += obj.Count120plus;

            obj.TotalAmount = totalAmount;
            obj.Count = count;
        }

        mergedArray.map((res, ind) => {
            PayerNameData.push([
                res.PayerName,
                res.TotalAmount
            ])
            PayerNameDataForClaim.push([
                res.PayerName,
                res.Count
            ])
            PayerNameDataTable.push({
                lookUpName: res.PayerName,
                TotalAmount: res.TotalAmount,
                Count: res.Count,
                TotalAmount60: res.TotalAmount60,
                Count60: res.Count60,
                TotalAmount90: res.TotalAmount90,
                Count90: res.Count90,
                TotalAmount120: res.TotalAmount120,
                Count120: res.Count120,
                TotalAmount120plus: res.TotalAmount120plus,
                Count120plus: res.Count120plus,
            })

        })
        return res.json({
            Result: true,
            Message: "",
            PayerNameData: PayerNameData.slice(0, 10),
            PayerNameDataForClaim: PayerNameDataForClaim.slice(0, 10),
            PayerNameDataTable: PayerNameDataTable,
            Radio: radio
        })

    }
    else {

        var UserListAging = await Claim_Master.aggregate([
           QueryParms,
            {
                '$lookup':
                {
                    from: 'users',
                    localField: 'updated_by',
                    foreignField: '_id',
                    as: 'users'
                }
            },

            {
                '$lookup': {
                    from: 'claimstatusupdates',
                    localField: '_id',
                    foreignField: 'ClaimId',
                    as: 'claimstatusupdates',
                    pipeline: [
                        { $match: { UserId: { $in: [UserId] } } },
                        { $sort: { updatedAt: -1 } }, { $limit: 1 }],
                }
            },
            {
                '$project': {
                    DateOfService: '$DateOfService',
                    "PayerName": "$PayerName",
                    "ClaimBalance": "$ClaimBalance",
                    Aging: {
                        $round: { $divide: [{ $subtract: [{ '$arrayElemAt': ['$claimstatusupdates.updatedAt', 0] }, '$DateOfService'] }, 86400000] },
                    },
                }
            }, {
                "$match": {
                    "Aging": { "$nin": [null] }
                }
            }, 

        ])

        var days60 = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging >= 0 && dataGet.Aging <= 60) {

                const { PayerName, ClaimBalance } = dataGet
                if (!sum[PayerName]) {
                    sum[PayerName] = { PayerName, TotalAmount60: 0, Count60: 0 }
                }
                sum[PayerName].TotalAmount60 += Number(ClaimBalance)
                sum[PayerName].Count60 += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer60 = days60 ? Object.values(days60) : []

               var days120 = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging > 60 && dataGet.Aging <= 120) {

                const { PayerName, ClaimBalance } = dataGet
                if (!sum[PayerName]) {
                    sum[PayerName] = { PayerName, TotalAmount120: 0, Count120: 0 }
                }
                sum[PayerName].TotalAmount120 += Number(ClaimBalance)
                sum[PayerName].Count120 += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer120 = days120 ? Object.values(days120) : []

              var days120plus = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging > 120) {

                const { PayerName, ClaimBalance } = dataGet
                if (!sum[PayerName]) {
                    sum[PayerName] = { PayerName, TotalAmount120plus: 0, Count120plus: 0 }
                }
                sum[PayerName].TotalAmount120plus += Number(ClaimBalance)
                sum[PayerName].Count120plus += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer120plus = days120plus ? Object.values(days120plus) : []
        const mergedArray = [payer60, payer120, payer120plus].reduce((result, arr) => {
            arr.forEach((obj) => {
              if (Object.keys(obj).length !== 0) {
                const matchingObj = result.find((item) => item.PayerName === obj.PayerName)
                if (matchingObj) {
                  Object.assign(matchingObj, obj)
                } else {
                  result.push({...obj})
                }
              }
            })
            return result
          }, [])
  
          for (let i = 0; i < mergedArray.length; i++) {
            let obj = mergedArray[i]
            let totalAmount = 0
            let count = 0
  
            if (obj.TotalAmount60) totalAmount += obj.TotalAmount60
            if (obj.Count60) count += obj.Count60
            if (obj.TotalAmount120) totalAmount += obj.TotalAmount120
            if (obj.Count120) count += obj.Count120
            if (obj.TotalAmount120plus) totalAmount += obj.TotalAmount120plus
            if (obj.Count120plus) count += obj.Count120plus
  
            obj.TotalAmount = totalAmount
            obj.Count = count
          }

        mergedArray.map((res, ind) => {
            PayerNameData.push([
                res.PayerName,
                res.TotalAmount
            ])
            PayerNameDataForClaim.push([
                res.PayerName,
                res.Count
            ])
            PayerNameDataTable.push({
                lookUpName: res.PayerName,
                TotalAmount: res.TotalAmount,
                Count: res.Count,
                TotalAmount60: res.TotalAmount60,
                Count60: res.Count60,
                TotalAmount90: res.TotalAmount90,
                Count90: res.Count90,
                TotalAmount120: res.TotalAmount120,
                Count120: res.Count120,
                TotalAmount120plus: res.TotalAmount120plus,
                Count120plus: res.Count120plus,
            })

        })
        return res.json({
            Result: true,
            Message: "",
            PayerNameData: PayerNameData.slice(0, 10),
            PayerNameDataForClaim: PayerNameDataForClaim.slice(0, 10),
            PayerNameDataTable: PayerNameDataTable,
            Radio: radio
        })

    }

}

if (radio === "STATUS WISE") {
    if (req.query.FromDate && req.query.ToDate) {
        const endDate = new Date(req.query.ToDate);
        endDate.setUTCHours(23, 59, 59);
        var QueryParmsForDate = {
            $match: {
                createdAt: { $gte: new Date(req.query.FromDate), $lte: new Date(endDate.toString()) },
                // PracticeId: { $in: PracticeIdsList },
                AssignTo:{"$in":[UserId]},
                SystemStatus: { $nin: ["Auto Close"] },

            }
        }

        var UserListAging=await Claim_Master.aggregate([
            QueryParmsForDate,
            {
        '$lookup': {
        from: 'claimstatusupdates',
        localField: '_id',
        foreignField: 'ClaimId',
        as: 'claimstatusupdates',
        pipeline: [
            { $match: { UserId: { $in: [UserId] } } },
        { $sort: { updatedAt: -1 } }, { $limit: 1 }],
        }
        },
        {
        '$project': {
        "ClaimBalance": "$ClaimBalance",
        DateOfService: '$DateOfService',
        SystemStatus: '$SystemStatus',
        Aging: {
        $round: { $divide: [{ $subtract: [{ '$arrayElemAt': ['$claimstatusupdates.updatedAt', 0] }, '$DateOfService'] }, 86400000] },
        },
        }
        },
        {
            "$match":{
                "Aging":{
                    "$nin":[null]
                }
            }
        } 
       
        ])




        var days60 = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging >= 0 && dataGet.Aging <= 60) {

                const { SystemStatus, ClaimBalance } = dataGet
                if (!sum[SystemStatus]) {
                    sum[SystemStatus] = { SystemStatus, TotalAmount60: 0, Count60: 0 }
                }
                sum[SystemStatus].TotalAmount60 += Number(ClaimBalance)
                sum[SystemStatus].Count60 += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer60 = days60 ? Object.values(days60) : []

        
        var days120 = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging > 60 && dataGet.Aging <= 120) {

                const { SystemStatus, ClaimBalance } = dataGet
                if (!sum[SystemStatus]) {
                    sum[SystemStatus] = { SystemStatus, TotalAmount120: 0, Count120: 0 }
                }
                sum[SystemStatus].TotalAmount120 += Number(ClaimBalance)
                sum[SystemStatus].Count120 += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer120 = days120 ? Object.values(days120) : []

      
        var days120plus = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging > 120) {

                const { SystemStatus, ClaimBalance } = dataGet
                if (!sum[SystemStatus]) {
                    sum[SystemStatus] = { SystemStatus, TotalAmount120plus: 0, Count120plus: 0 }
                }
                sum[SystemStatus].TotalAmount120plus += Number(ClaimBalance)
                sum[SystemStatus].Count120plus += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer120plus = days120plus ? Object.values(days120plus) : []

       
        const mergedArray = [payer60, payer120, payer120plus].reduce((result, arr) => {
            arr.forEach(obj => {
              if (Object.keys(obj).length !== 0) {
                const matchingObj = result.find(item => item.SystemStatus === obj.SystemStatus);
                if (matchingObj) {
                  Object.assign(matchingObj, obj);
                } else {
                  result.push({...obj});
                }
              }
            });
            return result;
          }, []);
      


        for (let i = 0; i < mergedArray.length; i++) {
            let obj = mergedArray[i];
            let totalAmount = 0;
            let count = 0;

            if (obj.TotalAmount60) totalAmount += obj.TotalAmount60;
            if (obj.Count60) count += obj.Count60;
            if (obj.TotalAmount120) totalAmount += obj.TotalAmount120;
            if (obj.Count120) count += obj.Count120;
            if (obj.TotalAmount120plus) totalAmount += obj.TotalAmount120plus;
            if (obj.Count120plus) count += obj.Count120plus;

            obj.TotalAmount = totalAmount;
            obj.Count = count;
        }

        mergedArray.map((res, ind) => {
            StatusWiseData.push([
                res.SystemStatus,
                res.TotalAmount
            ])
            StatusWiseDataForClaim.push([
                res.SystemStatus,
                res.Count
            ])
            StatusWiseTableData.push({
                lookUpName: res.SystemStatus,
                TotalAmount: res.TotalAmount,
                Count: res.Count,
                TotalAmount60: res.TotalAmount60,
                Count60: res.Count60,
                TotalAmount90: res.TotalAmount90,
                Count90: res.Count90,
                TotalAmount120: res.TotalAmount120,
                Count120: res.Count120,
                TotalAmount120plus: res.TotalAmount120plus,
                Count120plus: res.Count120plus,
            })

        })
        return res.json({
            Result: true,
            Message: "",
            StatusWiseData: StatusWiseData.slice(0, 10),
            StatusWiseDataForClaim: StatusWiseDataForClaim.slice(0, 10),
            StatusWiseTableData: StatusWiseTableData,
            Radio: radio
        })

    }
    else {

        var UserListAging = await Claim_Master.aggregate([
           QueryParms,
            {
                '$lookup':
                {
                    from: 'users',
                    localField: 'updated_by',
                    foreignField: '_id',
                    as: 'users'
                }
            },

            {
                '$lookup': {
                    from: 'claimstatusupdates',
                    localField: '_id',
                    foreignField: 'ClaimId',
                    as: 'claimstatusupdates',
                    pipeline: [
                        { $match: { UserId: { $in: [UserId] } } },
                        { $sort: { updatedAt: -1 } }, { $limit: 1 }],
                }
            },
            {
                '$project': {
                    DateOfService: '$DateOfService',
                    "SystemStatus": "$SystemStatus",
                    "ClaimBalance": "$ClaimBalance",
                    Aging: {
                        $round: { $divide: [{ $subtract: [{ '$arrayElemAt': ['$claimstatusupdates.updatedAt', 0] }, '$DateOfService'] }, 86400000] },
                    },
                }
            }, {
                "$match": {
                    "Aging": { "$nin": [null] }
                }
            }

        ])

        var days60 = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging >= 0 && dataGet.Aging <= 60) {

                const { SystemStatus, ClaimBalance } = dataGet
                if (!sum[SystemStatus]) {
                    sum[SystemStatus] = { SystemStatus, TotalAmount60: 0, Count60: 0 }
                }
                sum[SystemStatus].TotalAmount60 += Number(ClaimBalance)
                sum[SystemStatus].Count60 += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer60 = days60 ? Object.values(days60) : []

               var days120 = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging > 60 && dataGet.Aging <= 120) {

                const { SystemStatus, ClaimBalance } = dataGet
                if (!sum[SystemStatus]) {
                    sum[SystemStatus] = { SystemStatus, TotalAmount120: 0, Count120: 0 }
                }
                sum[SystemStatus].TotalAmount120 += Number(ClaimBalance)
                sum[SystemStatus].Count120 += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer120 = days120 ? Object.values(days120) : []

              var days120plus = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging > 120) {

                const { SystemStatus, ClaimBalance } = dataGet
                if (!sum[SystemStatus]) {
                    sum[SystemStatus] = { SystemStatus, TotalAmount120plus: 0, Count120plus: 0 }
                }
                sum[SystemStatus].TotalAmount120plus += Number(ClaimBalance)
                sum[SystemStatus].Count120plus += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer120plus = days120plus ? Object.values(days120plus) : []

        const mergedArray = [payer60, payer120, payer120plus].reduce((result, arr) => {
            arr.forEach((obj) => {
              if (Object.keys(obj).length !== 0) {
                const matchingObj = result.find((item) => item.SystemStatus === obj.SystemStatus)
                if (matchingObj) {
                  Object.assign(matchingObj, obj)
                } else {
                  result.push({...obj})
                }
              }
            })
            return result
          }, [])
  
          for (let i = 0; i < mergedArray.length; i++) {
            let obj = mergedArray[i]
            let totalAmount = 0
            let count = 0
  
            if (obj.TotalAmount60) totalAmount += obj.TotalAmount60
            if (obj.Count60) count += obj.Count60
            if (obj.TotalAmount120) totalAmount += obj.TotalAmount120
            if (obj.Count120) count += obj.Count120
            if (obj.TotalAmount120plus) totalAmount += obj.TotalAmount120plus
            if (obj.Count120plus) count += obj.Count120plus
  
            obj.TotalAmount = totalAmount
            obj.Count = count
          }

        mergedArray.map((res, ind) => {
            StatusWiseData.push([
                res.SystemStatus,
                res.TotalAmount
            ])
            StatusWiseDataForClaim.push([
                res.SystemStatus,
                res.Count
            ])
            StatusWiseTableData.push({
                lookUpName: res.SystemStatus,
                TotalAmount: res.TotalAmount,
                Count: res.Count,
                TotalAmount60: res.TotalAmount60,
                Count60: res.Count60,
                TotalAmount90: res.TotalAmount90,
                Count90: res.Count90,
                TotalAmount120: res.TotalAmount120,
                Count120: res.Count120,
                TotalAmount120plus: res.TotalAmount120plus,
                Count120plus: res.Count120plus,
            })

        })
        return res.json({
            Result: true,
            Message: "",
            StatusWiseData: StatusWiseData.slice(0, 10),
            StatusWiseDataForClaim: StatusWiseDataForClaim.slice(0, 10),
            StatusWiseTableData: StatusWiseTableData,
            Radio: radio
        })

    }

}

if (radio === "PROVIDER WISE") {
    if (req.query.FromDate && req.query.ToDate) {
        const endDate = new Date(req.query.ToDate);
        endDate.setUTCHours(23, 59, 59);
        var QueryParmsForDate = {
            $match: {
                createdAt: { $gte: new Date(req.query.FromDate), $lte: new Date(endDate.toString()) },
                // PracticeId: { $in: PracticeIdsList },
                AssignTo:{"$in":[UserId]},
                SystemStatus: { $nin: ["Auto Close"] },

            }
        }

        var UserListAging=await Claim_Master.aggregate([
            QueryParmsForDate,
            {
        '$lookup': {
        from: 'claimstatusupdates',
        localField: '_id',
        foreignField: 'ClaimId',
        as: 'claimstatusupdates',
        pipeline: [
            { $match: { UserId: { $in: [UserId] } } },
        { $sort: { updatedAt: -1 } }, { $limit: 1 }],
        }
        },
        {
        '$project': {
        "ClaimBalance": "$ClaimBalance",
        DateOfService: '$DateOfService',
        ProviderName: '$ProviderName',
        Aging: {
        $round: { $divide: [{ $subtract: [{ '$arrayElemAt': ['$claimstatusupdates.updatedAt', 0] }, '$DateOfService'] }, 86400000] },
        },
        }
        },
        {
            "$match":{
                "Aging":{
                    "$nin":[null]
                }
            }
        } 
       
        ])


        var days60 = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging >= 0 && dataGet.Aging <= 60) {

                const { ProviderName, ClaimBalance } = dataGet
                if (!sum[ProviderName]) {
                    sum[ProviderName] = { ProviderName, TotalAmount60: 0, Count60: 0 }
                }
                sum[ProviderName].TotalAmount60 += Number(ClaimBalance)
                sum[ProviderName].Count60 += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer60 = days60 ? Object.values(days60) : []

        
        var days120 = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging > 60 && dataGet.Aging <= 120) {

                const { ProviderName, ClaimBalance } = dataGet
                if (!sum[ProviderName]) {
                    sum[ProviderName] = { ProviderName, TotalAmount120: 0, Count120: 0 }
                }
                sum[ProviderName].TotalAmount120 += Number(ClaimBalance)
                sum[ProviderName].Count120 += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer120 = days120 ? Object.values(days120) : []

      
        var days120plus = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging > 120) {

                const { ProviderName, ClaimBalance } = dataGet
                if (!sum[ProviderName]) {
                    sum[ProviderName] = { ProviderName, TotalAmount120plus: 0, Count120plus: 0 }
                }
                sum[ProviderName].TotalAmount120plus += Number(ClaimBalance)
                sum[ProviderName].Count120plus += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer120plus = days120plus ? Object.values(days120plus) : []

       
        const mergedArray = [payer60, payer120, payer120plus].reduce((result, arr) => {
            arr.forEach(obj => {
              if (Object.keys(obj).length !== 0) {
                const matchingObj = result.find(item => item.ProviderName === obj.ProviderName);
                if (matchingObj) {
                  Object.assign(matchingObj, obj);
                } else {
                  result.push({...obj});
                }
              }
            });
            return result;
          }, []);
      


        for (let i = 0; i < mergedArray.length; i++) {
            let obj = mergedArray[i];
            let totalAmount = 0;
            let count = 0;

            if (obj.TotalAmount60) totalAmount += obj.TotalAmount60;
            if (obj.Count60) count += obj.Count60;
            if (obj.TotalAmount120) totalAmount += obj.TotalAmount120;
            if (obj.Count120) count += obj.Count120;
            if (obj.TotalAmount120plus) totalAmount += obj.TotalAmount120plus;
            if (obj.Count120plus) count += obj.Count120plus;

            obj.TotalAmount = totalAmount;
            obj.Count = count;
        }

        mergedArray.map((res, ind) => {
            ProviderNameWiseData.push([
                res.ProviderName,
                res.TotalAmount
            ])
            ProviderNameWiseDataForClaim.push([
                res.ProviderName,
                res.Count
            ])
            ProviderWiseTableData.push({
                lookUpName: res.ProviderName,
                TotalAmount: res.TotalAmount,
                Count: res.Count,
                TotalAmount60: res.TotalAmount60,
                Count60: res.Count60,
                TotalAmount90: res.TotalAmount90,
                Count90: res.Count90,
                TotalAmount120: res.TotalAmount120,
                Count120: res.Count120,
                TotalAmount120plus: res.TotalAmount120plus,
                Count120plus: res.Count120plus,
            })

        })
        return res.json({
            Result: true,
            Message: "",
            ProviderNameWiseData: ProviderNameWiseData.slice(0, 10),
            ProviderNameWiseDataForClaim: ProviderNameWiseDataForClaim.slice(0, 10),
            ProviderWiseTableData: ProviderWiseTableData,
            Radio: radio
        })

    }
    else {

        var UserListAging = await Claim_Master.aggregate([
            QueryParms,
            {
                '$lookup':
                {
                    from: 'users',
                    localField: 'updated_by',
                    foreignField: '_id',
                    as: 'users'
                }
            },

            {
                '$lookup': {
                    from: 'claimstatusupdates',
                    localField: '_id',
                    foreignField: 'ClaimId',
                    as: 'claimstatusupdates',
                    pipeline: [
                        { $match: { UserId: { $in: [UserId] } } },
                        { $sort: { updatedAt: -1 } }, { $limit: 1 }],
                }
            },
            {
                '$project': {
                    DateOfService: '$DateOfService',
                    "ProviderName": "$ProviderName",
                    "ClaimBalance": "$ClaimBalance",
                    Aging: {
                        $round: { $divide: [{ $subtract: [{ '$arrayElemAt': ['$claimstatusupdates.updatedAt', 0] }, '$DateOfService'] }, 86400000] },
                    },
                }
            }, {
                "$match": {
                    "Aging": { "$nin": [null] }
                }
            }

        ])

        var days60 = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging >= 0 && dataGet.Aging <= 60) {

                const { ProviderName, ClaimBalance } = dataGet
                if (!sum[ProviderName]) {
                    sum[ProviderName] = { ProviderName, TotalAmount60: 0, Count60: 0 }
                }
                sum[ProviderName].TotalAmount60 += Number(ClaimBalance)
                sum[ProviderName].Count60 += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer60 = days60 ? Object.values(days60) : []

               var days120 = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging > 60 && dataGet.Aging <= 120) {

                const { ProviderName, ClaimBalance } = dataGet
                if (!sum[ProviderName]) {
                    sum[ProviderName] = { ProviderName, TotalAmount120: 0, Count120: 0 }
                }
                sum[ProviderName].TotalAmount120 += Number(ClaimBalance)
                sum[ProviderName].Count120 += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer120 = days120 ? Object.values(days120) : []

              var days120plus = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging > 120) {

                const { ProviderName, ClaimBalance } = dataGet
                if (!sum[ProviderName]) {
                    sum[ProviderName] = { ProviderName, TotalAmount120plus: 0, Count120plus: 0 }
                }
                sum[ProviderName].TotalAmount120plus += Number(ClaimBalance)
                sum[ProviderName].Count120plus += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer120plus = days120plus ? Object.values(days120plus) : []

        const mergedArray = [payer60, payer120, payer120plus].reduce((result, arr) => {
            arr.forEach((obj) => {
              if (Object.keys(obj).length !== 0) {
                const matchingObj = result.find((item) => item.ProviderName === obj.ProviderName)
                if (matchingObj) {
                  Object.assign(matchingObj, obj)
                } else {
                  result.push({...obj})
                }
              }
            })
            return result
          }, [])
  
          for (let i = 0; i < mergedArray.length; i++) {
            let obj = mergedArray[i]
            let totalAmount = 0
            let count = 0
  
            if (obj.TotalAmount60) totalAmount += obj.TotalAmount60
            if (obj.Count60) count += obj.Count60
            if (obj.TotalAmount120) totalAmount += obj.TotalAmount120
            if (obj.Count120) count += obj.Count120
            if (obj.TotalAmount120plus) totalAmount += obj.TotalAmount120plus
            if (obj.Count120plus) count += obj.Count120plus
  
            obj.TotalAmount = totalAmount
            obj.Count = count
          }

        mergedArray.map((res, ind) => {
            ProviderNameWiseData.push([
                res.ProviderName,
                res.TotalAmount
            ])
            ProviderNameWiseDataForClaim.push([
                res.ProviderName,
                res.Count
            ])
            ProviderWiseTableData.push({
                lookUpName: res.ProviderName,
                TotalAmount: res.TotalAmount,
                Count: res.Count,
                TotalAmount60: res.TotalAmount60,
                Count60: res.Count60,
                TotalAmount90: res.TotalAmount90,
                Count90: res.Count90,
                TotalAmount120: res.TotalAmount120,
                Count120: res.Count120,
                TotalAmount120plus: res.TotalAmount120plus,
                Count120plus: res.Count120plus,
            })

        })
        return res.json({
            Result: true,
            Message: "",
            ProviderNameWiseData: ProviderNameWiseData.slice(0, 10),
            ProviderNameWiseDataForClaim: ProviderNameWiseDataForClaim.slice(0, 10),
            ProviderWiseTableData: ProviderWiseTableData,
            Radio: radio
        })

    }

}

if (radio === "ROOTCAUSE WISE") {
    if (req.query.FromDate && req.query.ToDate) {
        const endDate = new Date(req.query.ToDate);
        endDate.setUTCHours(23, 59, 59);
        var QueryParmsForDate = {
            $match: {
                createdAt: { $gte: new Date(req.query.FromDate), $lte: new Date(endDate.toString()) },
                // PracticeId: { $in: PracticeIdsList },
                AssignTo:{"$in":[UserId]},
                SystemStatus: { $nin: ["Auto Close"] },

            }
        }

        var UserListAging=await Claim_Master.aggregate([
            QueryParmsForDate,
            {
        '$lookup': {
        from: 'claimstatusupdates',
        localField: '_id',
        foreignField: 'ClaimId',
        as: 'claimstatusupdates',
        pipeline: [
            { $match: { UserId: { $in: [UserId] } } },
        { $sort: { updatedAt: -1 } }, { $limit: 1 }],
        }
        },
        {
        '$project': {
        "ClaimBalance": "$ClaimBalance",
        DateOfService: '$DateOfService',
        RootCause: '$RootCause',
        Aging: {
        $round: { $divide: [{ $subtract: [{ '$arrayElemAt': ['$claimstatusupdates.updatedAt', 0] }, '$DateOfService'] }, 86400000] },
        },
        }
        },
        {
            "$match":{
                "Aging":{
                    "$nin":[null]
                }
            }
        } 
       
        ])


        var days60 = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging >= 0 && dataGet.Aging <= 60) {

                const { RootCause, ClaimBalance } = dataGet
                if (!sum[RootCause]) {
                    sum[RootCause] = { RootCause, TotalAmount60: 0, Count60: 0 }
                }
                sum[RootCause].TotalAmount60 += Number(ClaimBalance)
                sum[RootCause].Count60 += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer60 = days60 ? Object.values(days60) : []

        
        var days120 = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging > 60 && dataGet.Aging <= 120) {

                const { RootCause, ClaimBalance } = dataGet
                if (!sum[RootCause]) {
                    sum[RootCause] = { RootCause, TotalAmount120: 0, Count120: 0 }
                }
                sum[RootCause].TotalAmount120 += Number(ClaimBalance)
                sum[RootCause].Count120 += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer120 = days120 ? Object.values(days120) : []

      
        var days120plus = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging > 120) {

                const { RootCause, ClaimBalance } = dataGet
                if (!sum[RootCause]) {
                    sum[RootCause] = { RootCause, TotalAmount120plus: 0, Count120plus: 0 }
                }
                sum[RootCause].TotalAmount120plus += Number(ClaimBalance)
                sum[RootCause].Count120plus += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer120plus = days120plus ? Object.values(days120plus) : []

       
        const mergedArray = [payer60, payer120, payer120plus].reduce((result, arr) => {
            arr.forEach(obj => {
              if (Object.keys(obj).length !== 0) {
                const matchingObj = result.find(item => item.RootCause === obj.RootCause);
                if (matchingObj) {
                  Object.assign(matchingObj, obj);
                } else {
                  result.push({...obj});
                }
              }
            });
            return result;
          }, []);
      


        for (let i = 0; i < mergedArray.length; i++) {
            let obj = mergedArray[i];
            let totalAmount = 0;
            let count = 0;

            if (obj.TotalAmount60) totalAmount += obj.TotalAmount60;
            if (obj.Count60) count += obj.Count60;
            if (obj.TotalAmount120) totalAmount += obj.TotalAmount120;
            if (obj.Count120) count += obj.Count120;
            if (obj.TotalAmount120plus) totalAmount += obj.TotalAmount120plus;
            if (obj.Count120plus) count += obj.Count120plus;

            obj.TotalAmount = totalAmount;
            obj.Count = count;
        }

        mergedArray.map((res, ind) => {
            RootCauseData.push([
                res.RootCause,
                res.TotalAmount
            ])
            RootCauseDataForClaim.push([
                res.RootCause,
                res.Count
            ])
            RootCauseWiseTableData.push({
                lookUpName: res.RootCause,
                TotalAmount: res.TotalAmount,
                Count: res.Count,
                TotalAmount60: res.TotalAmount60,
                Count60: res.Count60,
                TotalAmount90: res.TotalAmount90,
                Count90: res.Count90,
                TotalAmount120: res.TotalAmount120,
                Count120: res.Count120,
                TotalAmount120plus: res.TotalAmount120plus,
                Count120plus: res.Count120plus,
            })

        })
        return res.json({
            Result: true,
            Message: "",
            RootCauseData: RootCauseData.slice(0, 10),
            RootCauseDataForClaim: RootCauseDataForClaim.slice(0, 10),
            RootCauseWiseTableData: RootCauseWiseTableData,
            Radio: radio
        })

    }
    else {

        var UserListAging = await Claim_Master.aggregate([
            QueryParms,
            {
                '$lookup':
                {
                    from: 'users',
                    localField: 'updated_by',
                    foreignField: '_id',
                    as: 'users'
                }
            },

            {
                '$lookup': {
                    from: 'claimstatusupdates',
                    localField: '_id',
                    foreignField: 'ClaimId',
                    as: 'claimstatusupdates',
                    pipeline: [
                        { $match: { UserId: { $in: [UserId] } } },
                        { $sort: { updatedAt: -1 } }, { $limit: 1 }],
                }
            },
            {
                '$project': {
                    DateOfService: '$DateOfService',
                    "RootCause": "$RootCause",
                    "ClaimBalance": "$ClaimBalance",
                    Aging: {
                        $round: { $divide: [{ $subtract: [{ '$arrayElemAt': ['$claimstatusupdates.updatedAt', 0] }, '$DateOfService'] }, 86400000] },
                    },
                }
            }, {
                "$match": {
                    "Aging": { "$nin": [null] }
                }
            }

        ])

        var days60 = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging >= 0 && dataGet.Aging <= 60) {

                const { RootCause, ClaimBalance } = dataGet
                if (!sum[RootCause]) {
                    sum[RootCause] = { RootCause, TotalAmount60: 0, Count60: 0 }
                }
                sum[RootCause].TotalAmount60 += Number(ClaimBalance)
                sum[RootCause].Count60 += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer60 = days60 ? Object.values(days60) : []

               var days120 = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging > 60 && dataGet.Aging <= 120) {

                const { RootCause, ClaimBalance } = dataGet
                if (!sum[RootCause]) {
                    sum[RootCause] = { RootCause, TotalAmount120: 0, Count120: 0 }
                }
                sum[RootCause].TotalAmount120 += Number(ClaimBalance)
                sum[RootCause].Count120 += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer120 = days120 ? Object.values(days120) : []

              var days120plus = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging > 120) {

                const { RootCause, ClaimBalance } = dataGet
                if (!sum[RootCause]) {
                    sum[RootCause] = { RootCause, TotalAmount120plus: 0, Count120plus: 0 }
                }
                sum[RootCause].TotalAmount120plus += Number(ClaimBalance)
                sum[RootCause].Count120plus += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer120plus = days120plus ? Object.values(days120plus) : []

        const mergedArray = [payer60, payer120, payer120plus].reduce((result, arr) => {
            arr.forEach((obj) => {
              if (Object.keys(obj).length !== 0) {
                const matchingObj = result.find((item) => item.RootCause === obj.RootCause)
                if (matchingObj) {
                  Object.assign(matchingObj, obj)
                } else {
                  result.push({...obj})
                }
              }
            })
            return result
          }, [])
  
          for (let i = 0; i < mergedArray.length; i++) {
            let obj = mergedArray[i]
            let totalAmount = 0
            let count = 0
  
            if (obj.TotalAmount60) totalAmount += obj.TotalAmount60
            if (obj.Count60) count += obj.Count60
            if (obj.TotalAmount120) totalAmount += obj.TotalAmount120
            if (obj.Count120) count += obj.Count120
            if (obj.TotalAmount120plus) totalAmount += obj.TotalAmount120plus
            if (obj.Count120plus) count += obj.Count120plus
  
            obj.TotalAmount = totalAmount
            obj.Count = count
          }

        mergedArray.map((res, ind) => {
            RootCauseData.push([
                res.RootCause,
                res.TotalAmount
            ])
            RootCauseDataForClaim.push([
                res.RootCause,
                res.Count
            ])
            RootCauseWiseTableData.push({
                lookUpName: res.RootCause,
                TotalAmount: res.TotalAmount,
                Count: res.Count,
                TotalAmount60: res.TotalAmount60,
                Count60: res.Count60,
                TotalAmount90: res.TotalAmount90,
                Count90: res.Count90,
                TotalAmount120: res.TotalAmount120,
                Count120: res.Count120,
                TotalAmount120plus: res.TotalAmount120plus,
                Count120plus: res.Count120plus,
            })

        })
        return res.json({
            Result: true,
            Message: "",
            RootCauseData: RootCauseData.slice(0, 10),
            RootCauseDataForClaim: RootCauseDataForClaim.slice(0, 10),
            RootCauseWiseTableData: RootCauseWiseTableData,
            Radio: radio
        })

    }

}

if (radio === "PRACTICE WISE") {
    if (req.query.FromDate && req.query.ToDate) {
        const endDate = new Date(req.query.ToDate);
        endDate.setUTCHours(23, 59, 59);
        var QueryParmsForDate = {
            $match: {
                createdAt: { $gte: new Date(req.query.FromDate), $lte: new Date(endDate.toString()) },
                // PracticeId: { $in: PracticeIdsList },
                AssignTo:{"$in":[UserId]},
                SystemStatus: { $nin: ["Auto Close"] },

            }
        }

        var UserListAging=await Claim_Master.aggregate([
            QueryParmsForDate,
            {
        '$lookup': {
        from: 'claimstatusupdates',
        localField: '_id',
        foreignField: 'ClaimId',
        as: 'claimstatusupdates',
        pipeline: [
            { $match: { UserId: { $in: [UserId] } } },
        { $sort: { updatedAt: -1 } }, { $limit: 1 }],
        }
        },
        {
        '$project': {
        "ClaimBalance": "$ClaimBalance",
        DateOfService: '$DateOfService',
        PracticeId: '$PracticeId',
        Aging: {
        $round: { $divide: [{ $subtract: [{ '$arrayElemAt': ['$claimstatusupdates.updatedAt', 0] }, '$DateOfService'] }, 86400000] },
        },
        }
        },
        {
            "$match":{
                "Aging":{
                    "$nin":[null]
                }
            }
        } 
       
        ])


        var days60 = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging >= 0 && dataGet.Aging <= 60) {

                const { PracticeId, ClaimBalance } = dataGet
                if (!sum[PracticeId]) {
                    sum[PracticeId] = { PracticeId, TotalAmount60: 0, Count60: 0 }
                }
                sum[PracticeId].TotalAmount60 += Number(ClaimBalance)
                sum[PracticeId].Count60 += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer60 = days60 ? Object.values(days60) : []

        
        var days120 = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging > 60 && dataGet.Aging <= 120) {

                const { PracticeId, ClaimBalance } = dataGet
                if (!sum[PracticeId]) {
                    sum[PracticeId] = { PracticeId, TotalAmount120: 0, Count120: 0 }
                }
                sum[PracticeId].TotalAmount120 += Number(ClaimBalance)
                sum[PracticeId].Count120 += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer120 = days120 ? Object.values(days120) : []

      
        var days120plus = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging > 120) {

                const { PracticeId, ClaimBalance } = dataGet
                if (!sum[PracticeId]) {
                    sum[PracticeId] = { PracticeId, TotalAmount120plus: 0, Count120plus: 0 }
                }
                sum[PracticeId].TotalAmount120plus += Number(ClaimBalance)
                sum[PracticeId].Count120plus += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer120plus = days120plus ? Object.values(days120plus) : []

       
        const mergedArray = [payer60, payer120, payer120plus].reduce((result, arr) => {
            arr.forEach(obj => {
              if (Object.keys(obj).length !== 0) {
                const matchingObj = result.find(item => item.PracticeId === obj.PracticeId);
                if (matchingObj) {
                  Object.assign(matchingObj, obj);
                } else {
                  result.push({...obj});
                }
              }
            });
            return result;
          }, []);
      


        for (let i = 0; i < mergedArray.length; i++) {
            let obj = mergedArray[i];
            let totalAmount = 0;
            let count = 0;

            if (obj.TotalAmount60) totalAmount += obj.TotalAmount60;
            if (obj.Count60) count += obj.Count60;
            if (obj.TotalAmount120) totalAmount += obj.TotalAmount120;
            if (obj.Count120) count += obj.Count120;
            if (obj.TotalAmount120plus) totalAmount += obj.TotalAmount120plus;
            if (obj.Count120plus) count += obj.Count120plus;

            obj.TotalAmount = totalAmount;
            obj.Count = count;
        }
        for (var i = 0; i < mergedArray.length; i++) {
            var getPracticeCoumns = await Practice.findOne(
              {_id: new ObjectID(mergedArray[i].PracticeId)},
              {PracticeName: 1, _id: 0}
            )
            if (getPracticeCoumns) {
              mergedArray[i].PracticeName = getPracticeCoumns.PracticeName
            }
          }

          mergedArray.map((res, ind) => {
            PracticeWiseData.push([
                res.PracticeName,
                res.TotalAmount
            ])
            PracticeWiseDataForClaim.push([
                res.PracticeName,
                res.Count
            ])
            PracticeWiseTableData.push({
                lookUpName: res.PracticeName,
                TotalAmount: res.TotalAmount,
                Count: res.Count,
                TotalAmount60: res.TotalAmount60,
                Count60: res.Count60,
                TotalAmount90: res.TotalAmount90,
                Count90: res.Count90,
                TotalAmount120: res.TotalAmount120,
                Count120: res.Count120,
                TotalAmount120plus: res.TotalAmount120plus,
                Count120plus: res.Count120plus,
            })

        })
        return res.json({
            Result: true,
            Message: "",
            PracticeWiseData: PracticeWiseData.slice(0, 10),
            PracticeWiseDataForClaim: PracticeWiseDataForClaim.slice(0, 10),
            PracticeWiseTableData: PracticeWiseTableData,
            Radio: radio
        })

    }
    else {

        var UserListAging = await Claim_Master.aggregate([
            QueryParms,
            {
                '$lookup':
                {
                    from: 'users',
                    localField: 'updated_by',
                    foreignField: '_id',
                    as: 'users'
                }
            },

            {
                '$lookup': {
                    from: 'claimstatusupdates',
                    localField: '_id',
                    foreignField: 'ClaimId',
                    as: 'claimstatusupdates',
                    pipeline: [
                        { $match: { UserId: { $in: [UserId] } } },
                        { $sort: { updatedAt: -1 } }, { $limit: 1 }],
                }
            },
            {
                '$project': {
                    DateOfService: '$DateOfService',
                    "PracticeId": "$PracticeId",
                    "ClaimBalance": "$ClaimBalance",
                    Aging: {
                        $round: { $divide: [{ $subtract: [{ '$arrayElemAt': ['$claimstatusupdates.updatedAt', 0] }, '$DateOfService'] }, 86400000] },
                    },
                }
            }, {
                "$match": {
                    "Aging": { "$nin": [null] }
                }
            }

        ])

        var days60 = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging >= 0 && dataGet.Aging <= 60) {

                const { PracticeId, ClaimBalance } = dataGet
                if (!sum[PracticeId]) {
                    sum[PracticeId] = { PracticeId, TotalAmount60: 0, Count60: 0 }
                }
                sum[PracticeId].TotalAmount60 += Number(ClaimBalance)
                sum[PracticeId].Count60 += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer60 = days60 ? Object.values(days60) : []

               var days120 = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging > 60 && dataGet.Aging <= 120) {

                const { PracticeId, ClaimBalance } = dataGet
                if (!sum[PracticeId]) {
                    sum[PracticeId] = { PracticeId, TotalAmount120: 0, Count120: 0 }
                }
                sum[PracticeId].TotalAmount120 += Number(ClaimBalance)
                sum[PracticeId].Count120 += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer120 = days120 ? Object.values(days120) : []

              var days120plus = UserListAging.reduce(function (sum, dataGet) {
            if (dataGet.Aging > 120) {

                const { PracticeId, ClaimBalance } = dataGet
                if (!sum[PracticeId]) {
                    sum[PracticeId] = { PracticeId, TotalAmount120plus: 0, Count120plus: 0 }
                }
                sum[PracticeId].TotalAmount120plus += Number(ClaimBalance)
                sum[PracticeId].Count120plus += 1
                return sum
            } else {
                return sum
            }

        }, {})
        var payer120plus = days120plus ? Object.values(days120plus) : []

        const mergedArray = [payer60, payer120, payer120plus].reduce((result, arr) => {
            arr.forEach((obj) => {
              if (Object.keys(obj).length !== 0) {
                const matchingObj = result.find((item) => item.PracticeId === obj.PracticeId)
                if (matchingObj) {
                  Object.assign(matchingObj, obj)
                } else {
                  result.push({...obj})
                }
              }
            })
            return result
          }, [])
  
          for (let i = 0; i < mergedArray.length; i++) {
            let obj = mergedArray[i]
            let totalAmount = 0
            let count = 0
  
            if (obj.TotalAmount60) totalAmount += obj.TotalAmount60
            if (obj.Count60) count += obj.Count60
            if (obj.TotalAmount120) totalAmount += obj.TotalAmount120
            if (obj.Count120) count += obj.Count120
            if (obj.TotalAmount120plus) totalAmount += obj.TotalAmount120plus
            if (obj.Count120plus) count += obj.Count120plus
  
            obj.TotalAmount = totalAmount
            obj.Count = count
          }

          for (var i = 0; i < mergedArray.length; i++) {
            var getPracticeCoumns = await Practice.findOne(
              {_id: new ObjectID(mergedArray[i].PracticeId)},
              {PracticeName: 1, _id: 0}
            )
            if (getPracticeCoumns) {
              mergedArray[i].PracticeName = getPracticeCoumns.PracticeName
            }
          }

        mergedArray.map((res, ind) => {
            PracticeWiseData.push([
                res.PracticeName,
                res.TotalAmount
            ])
            PracticeWiseDataForClaim.push([
                res.PracticeName,
                res.Count
            ])
            PracticeWiseTableData.push({
                lookUpName: res.PracticeName,
                TotalAmount: res.TotalAmount,
                Count: res.Count,
                TotalAmount60: res.TotalAmount60,
                Count60: res.Count60,
                TotalAmount90: res.TotalAmount90,
                Count90: res.Count90,
                TotalAmount120: res.TotalAmount120,
                Count120: res.Count120,
                TotalAmount120plus: res.TotalAmount120plus,
                Count120plus: res.Count120plus,
            })

        })
        return res.json({
            Result: true,
            Message: "",
            PracticeWiseData: PracticeWiseData.slice(0, 10),
            PracticeWiseDataForClaim: PracticeWiseDataForClaim.slice(0, 10),
            PracticeWiseTableData: PracticeWiseTableData,
            Radio: radio
        })

    }

}

if (radio === 'AGING WISE') {
      
    var AgeingWiseLoop = [
      {Query: {$lt: 30, $gte: 0}, Label: '0-30'},
      {Query: {$lt: 60, $gte: 30}, Label: '30-60'},
      {Query: {$lt: 90, $gte: 60}, Label: '60-90'},
      {Query: {$lt: 120, $gte: 90}, Label: '120-90'},
      {Query: {$gte: 120}, Label: '120 Above'},
    ]
      if (req.query.FromDate && req.query.ToDate) {
        const endDate = new Date(req.query.ToDate)
        endDate.setUTCHours(23, 59, 59)
        var QueryParmsForDate = {
          $match: {
            createdAt: {$gte: new Date(req.query.FromDate), $lte: new Date(endDate.toString())},
            AssignTo:{"$in":[UserId]},
            SystemStatus: {$nin: ['Auto Close', 'AC']},
          },
        }

        async function AgeingWiseQueryExecute(QueryParmsForDate, Query) {
          var AgeingWiseDataQuery = [
            QueryParmsForDate,
            {
              $lookup: {
                from: 'claimstatusupdates',
                localField: '_id',
                foreignField: 'ClaimId',
                as: 'claimstatusupdates',
                pipeline: [
                  {$match: {UserId: {$in: [UserId]}}},
                  {$sort: {updatedAt: -1}},
                  {$limit: 1},
                ],
              },
            },
            {
              $project: {
                DateOfService: '$DateOfService',
                ClaimBalance: '$ClaimBalance',
                Aging: {
                  $round: {
                    $divide: [
                      {
                        $subtract: [
                          {$arrayElemAt: ['$claimstatusupdates.updatedAt', 0]},
                          '$DateOfService',
                        ],
                      },
                      86400000,
                    ],
                  },
                },
              },
            },
            {
              $match: {Aging: Query},
            },
          ]

          var AgeingWiseData = await Claim_Master.aggregate(AgeingWiseDataQuery)
          return AgeingWiseData
        }
        Array.prototype.sum = function (prop) {
          var total = 0
          for (var i = 0, _len = this.length; i < _len; i++) {
            total += Number(this[i][prop])
          }
          return total
        }

        for (var i = 0; i < AgeingWiseLoop.length; i++) {
          var Data = await AgeingWiseQueryExecute(QueryParmsForDate, AgeingWiseLoop[i].Query)

          AgeingWiseTableData.push({
            lookUpName: AgeingWiseLoop[i].Label,
            TotalAmount: Number(Number(Data.sum('ClaimBalance')).toFixed(2)),
            Count: Data.length,
          })
          AgeingWiseChartData.push([
            AgeingWiseLoop[i].Label,
            Number(Number(Data.sum('ClaimBalance')).toFixed(2)),
          ])
          AgeingWiseChartDataForClaim.push([AgeingWiseLoop[i].Label, Data.length])
        }

        return res.json({
          Result: true,
          Message: '',
          AgeingWiseTableData: AgeingWiseTableData,
          AgeingWiseChartData: AgeingWiseChartData,
          AgeingWiseChartDataForClaim: AgeingWiseChartDataForClaim,
          Radio: radio,
        })
      }
      else {
        async function AgeingWiseQueryExecute(QueryParms, Query) {
          var AgeingWiseDataQuery = [
            QueryParms,
            {
              $lookup: {
                from: 'claimstatusupdates',
                localField: '_id',
                foreignField: 'ClaimId',
                as: 'claimstatusupdates',
                pipeline: [
                  {$match: {UserId: {$in: [UserId]}}},
                  {$sort: {updatedAt: -1}},
                  {$limit: 1},
                ],
              },
            },
            {
              $project: {
                DateOfService: '$DateOfService',
                ClaimBalance: '$ClaimBalance',
                Aging: {
                  $round: {
                    $divide: [
                      {
                        $subtract: [
                          {$arrayElemAt: ['$claimstatusupdates.updatedAt', 0]},
                          '$DateOfService',
                        ],
                      },
                      86400000,
                    ],
                  },
                },
              },
            },
            {
              $match: {Aging: Query},
            },
          ]
          var AgeingWiseData = await Claim_Master.aggregate(AgeingWiseDataQuery)
          return AgeingWiseData
        }
        Array.prototype.sum = function (prop) {
          var total = 0
          for (var i = 0, _len = this.length; i < _len; i++) {
            total += Number(this[i][prop])
          }
          return total
        }
  
        for (var i = 0; i < AgeingWiseLoop.length; i++) {
          var Data = await AgeingWiseQueryExecute(QueryParms, AgeingWiseLoop[i].Query)
  
          AgeingWiseTableData.push({
            lookUpName: AgeingWiseLoop[i].Label,
            TotalAmount: Number(Number(Data.sum('ClaimBalance')).toFixed(2)),
            Count: Data.length,
          })
          AgeingWiseChartData.push([
            AgeingWiseLoop[i].Label,
            Number(Number(Data.sum('ClaimBalance')).toFixed(2)),
          ])
          AgeingWiseChartDataForClaim.push([AgeingWiseLoop[i].Label, Data.length])
        }
  
        return res.json({
          Result: true,
          Message: '',
          AgeingWiseTableData: AgeingWiseTableData,
          AgeingWiseChartData: AgeingWiseChartData,
          AgeingWiseChartDataForClaim: AgeingWiseChartDataForClaim,
          Radio: radio,
        })
      }
    } 

})
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
  
    return res.length
}
router.get('/getCompletedClaims', passport.authenticate("jwt", { session: false }), async (req, res) => {
    var query = { $and: [] }
    var ExcelColumns = []
    
    let { page, limit } = req.query
    if (!page) page = 1
    if (!limit) limit = 10
    page = parseInt(page)
    limit = parseInt(limit)

    var PracticeId = JSON.parse(req.query.practicelist)
    if (PracticeId.length == 0) {
        res.json({
            data: [],
            total: 0
        })
        return false;
    }
    var Fitler = {}

    if (!req.query.filter) {
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
    
    if (req.user.RoleType == "AR-Caller") {
        query.$and.push({ AssignTo: new ObjectID(req.user._id) })
    }
    query.$and.push({ SystemStatus: { $nin: StatusCodes } })

        if (Fitler) {

            Object.assign(Fitler, { PracticeId: { $in: PracticeIDList } })
            if (req.user.RoleType == "AR-Caller") {
                Object.assign(Fitler, { AssignTo: new ObjectID(req.user._id) })
            }
            Object.assign(Fitler, { SystemStatus: { $nin: StatusCodes } })
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
                        localField: "updated_by",    // field in the Opportunities collection
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
                            localField: "updated_by",    // field in the Opportunities collection
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
            if (req.user.RoleType == "AR-Caller") {
                Object.assign(QueryParams, { AssignTo: new ObjectID(req.user._id) })
            }
            Object.assign(QueryParams, { SystemStatus: { $nin: StatusCodes } })
            
            var totalCount = await Claim_Master.countDocuments(QueryParams)

            if (req.query.type == "view") {

                var Query  = [
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
                            localField: "updated_by",    // field in the Opportunities collection
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
                            localField: "updated_by",    // field in the Opportunities collection
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
router.get('/getClaims', passport.authenticate("jwt", { session: false }), async (req, res) => {
    var query = { $and: [] }
    var ExcelColumns = []
    let { page, limit } = req.query
    if (!page) page = 1
    if (!limit) limit = 10
    page = parseInt(page)
    limit = parseInt(limit)

    var PracticeId = JSON.parse(req.query.practicelist)
    if (PracticeId.length == 0) {
        res.json({
            data: [],
            total: 0
        })
        return false;
    }
    var Fitler = {}

    if (!req.query.filter) {
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
    
    if (req.user.RoleType == "AR-Caller") {
        query.$and.push({ AssignTo: new ObjectID(req.user._id) })
        query.$and.push({ SystemStatus: { $in: StatusCodes } })
    }else {
        query.$and.push({ SystemStatus: { $nin: ["Auto Close"] } })
    }
    console.log("Object.key(Fitler).length",Object.keys(Fitler).length)
    if (Object.keys(Fitler).length > 0) {
        console.log("Fitler Yes",Fitler)
        Object.assign(Fitler, { PracticeId: { $in: PracticeIDList } })
        if (req.user.RoleType == "AR-Caller") {
            Object.assign(Fitler, { AssignTo: new ObjectID(req.user._id) })
            if(!Fitler.SystemStatus){
                Object.assign(Fitler, { SystemStatus: { $in: StatusCodes } }) 
            }
        }else {
            if(!Fitler.SystemStatus){
                Object.assign(Fitler, { SystemStatus: { $nin: ["Auto Close"] } })
            }
        }
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
                    localField: "updated_by",    // field in the Opportunities collection
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
                    total: totalCount,
                    Message : "With Filter Data"
                })
            })
        }
        if (req.query.type == "download") {
            var GetSelectedColumns = await UserDatatableColumns.findOne({ 
                UserId: new ObjectID(req.user._id) ,
                PageType : "ViewClaims"
            })
            var ProjectSelectedColumns = {}
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
                        localField: "updated_by",    // field in the Opportunities collection
                        foreignField: "_id",  // From Tables coestimations
                        as: "users"
                    }
                },
                {
                    $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$users", 0 ] }, "$$ROOT" ] } }
                },
                {
                    $project: ProjectSelectedColumns
                },
                // {
                //     $match: Fitler
                // },
            ]
            if(Object.keys(SortColumns).length > 0){
                QueryParams.push({ $sort: SortColumns})
            }
            if(AgingFilter){
                QueryParams.push(AgingFilter)
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
        if (req.user.RoleType == "AR-Caller") {
            Object.assign(QueryParams, { AssignTo: new ObjectID(req.user._id) })
            Object.assign(QueryParams, { SystemStatus: { $in: StatusCodes } })
        }else {
            Object.assign(QueryParams, { SystemStatus: { $nin: ["Auto Close"] } })
        }
        

        var totalCount = await Claim_Master.countDocuments(QueryParams)

        if (req.query.type == "view") {

            var Query = [
                {
                    $match: QueryParams
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "updated_by",    // field in the Opportunities collection
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
                    total: totalCount,
                    Message : "With Out Filter Data"
                })
            })
        } else {
            
            var GetSelectedColumns = await UserDatatableColumns.findOne({ 
                UserId: new ObjectID(req.user._id) ,
                PageType : "ViewClaims"
            })
            var ProjectSelectedColumns = {}
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
                    $match: QueryParams
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "updated_by",    // field in the Opportunities collection
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

router.get('/getClaimsbyid', passport.authenticate("jwt", { session: false }), async (req, res) => {
    var query = { $and: [] }
    var ExcelColumns = []
    let { page, limit } = req.query
    if (!page) page = 1
    if (!limit) limit = 10
    page = parseInt(page)
    limit = parseInt(limit)

    var filter = JSON.parse(req.query.filter)
    var Fitler = {}
    filter.map((getFilterData,ind)=>{
        Object.assign(Fitler,getfilter(getFilterData))
    })
    var SortColumns = {}
    var SortData = JSON.parse(req.query.sort)
    SortData.map((GetSort,ind)=>{
        Object.assign(SortColumns,{[GetSort.field] : GetSort.sort == "asc" ? 1 : -1})
    })
    var Params = JSON.parse(req.query.account)

    if (Params.PracticeId) {
        var PracticeIDList = [new ObjectID(Params.PracticeId)]
        
        if (Object.keys(Fitler).length > 0) {

                Object.assign(Fitler, {
                    PracticeId: { $in: PracticeIDList },
                })
                Object.assign(Fitler, {
                    [Params.Type]: Params.data,
                })
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
                            localField: "updated_by",    // field in the Opportunities collection
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
                                localField: "updated_by",    // field in the Opportunities collection
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

                if (req.query.type == "view") {

                    var totalCount = await Claim_Master.countDocuments({ PracticeId: { $in: PracticeIDList }, [Params.Type]: Params.data })

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
                            $match: {
                                PracticeId: { $in: PracticeIDList },
                                [Params.Type]: Params.data
                            }
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "updated_by",    // field in the Opportunities collection
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
                            $match: {
                                PracticeId: { $in: PracticeIDList },
                                [Params.Type]: Params.data
                            }
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "updated_by",    // field in the Opportunities collection
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
        
    } else {
        res.json({
            data: [],
            total: 0
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
        if (req.user.RoleType == "AR-Caller") {
            Object.assign(UpdateData, { CallerStatusChanged: "Yes" })
            Object.assign(UpdateData, { CallerStatusChangedDate: moment().format("YYYY-MM-DD") })
        }
        if (req.body.ChangeRootCause) {
            Object.assign(UpdateData, { RootCause: req.body.ChangeRootCause.value })
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


router.post("/DeleteClaimHistoryById", passport.authenticate("jwt", { session: false }), async (req, res) => {

    var ClaimHistory = await ClaimStatusUpdate.findOne({ _id: new ObjectID(req.body.ClaimHistoryId) })
    if (ClaimHistory) {
        await ClaimStatusUpdate.deleteOne({ _id: new ObjectID(req.body.ClaimHistoryId) })
        var UpdateData = { updated_by: req.user._id }

        var GetClaimLatest = await ClaimStatusUpdate.find({ ClaimId: new ObjectID(ClaimHistory.ClaimId) }).sort({ updatedAt: -1 })

        if (Object.keys(GetClaimLatest).length > 0) {
            if (GetClaimLatest[0].StatusCode) {
                Object.assign(UpdateData, { SystemStatus: GetClaimLatest[0].StatusCode })
            }
            if (GetClaimLatest[0].Comments) {
                Object.assign(UpdateData, { Comments: GetClaimLatest[0].Comments })
            }
            if (GetClaimLatest[0].DueDate) {
                Object.assign(UpdateData, { DueDate: moment(GetClaimLatest[0].DueDate).format("YYYY-MM-DD") })
            }
            await Claim_Master.updateOne({ _id: new ObjectID(ClaimHistory.ClaimId) }, UpdateData)
            res.json({
                data: UpdateData,
                Result: true,
            })
        } else {
            Object.assign(UpdateData, { SystemStatus: "Auto Open" })
            Object.assign(UpdateData, { Comments: "" })
            Object.assign(UpdateData, { DueDate: "" })
            await Claim_Master.updateOne({ _id: new ObjectID(ClaimHistory.ClaimId) }, UpdateData)
            res.json({
                data: UpdateData,
                Result: true,
            })
        }

    } else {
        res.json({
            data: [],
            Result: false,
        })
    }

})
router.post("/ClaimUpdate", passport.authenticate("jwt", { session: false }), async (req, res) => {

    if (req.body.ClaimHistoryId) {
        var ClaimHistory = await ClaimStatusUpdate.findOne({ _id: new ObjectID(req.body.ClaimHistoryId) })
        if (ClaimHistory) {
            
            var UpdateData = { updated_by: req.user._id }

            Object.assign(UpdateData, { LastWorkingDate:  moment().format("YYYY-MM-DD") })
            
            if (req.body.StatusCode) {
                Object.assign(UpdateData, { SystemStatus: req.body.StatusCode.value })
                Object.assign(UpdateData, { StatusCode: req.body.StatusCode.value })

            }
            if (req.body.ChangeRootCause) {
                Object.assign(UpdateData, { RootCause: req.body.ChangeRootCause.value })
            }
            if (req.user.RoleType == "AR-Caller") {
                Object.assign(UpdateData, { CallerStatusChanged: "Yes" })
                Object.assign(UpdateData, { CallerStatusChangedDate: moment().format("YYYY-MM-DD") })
                Object.assign(UpdateData, { PCAStatus: "No" })
                Object.assign(UpdateData, { PCAStatusDate: moment().format("YYYY-MM-DD") })
            }
            if(req.body.PageType == "PCA"){
                Object.assign(UpdateData, { PCAStatus: "Yes" })
                Object.assign(UpdateData, { PCAStatusDate: moment().format("YYYY-MM-DD") })
            }
            if (req.body.Comments) {
                Object.assign(UpdateData, { Comments: req.body.Comments })
            }
            if (req.body.duedate) {
                Object.assign(UpdateData, { DueDate: moment(req.body.duedate).format("YYYY-MM-DD") })
            }
            await Claim_Master.updateOne({ _id: new ObjectID(ClaimHistory.ClaimId) }, UpdateData)
            if (req.user.RoleType == "AR-Caller") {
                await Claim_Master.updateOne({ _id: new ObjectID(ClaimHistory.ClaimId),AssignTo : {$eq : null} }, {...UpdateData,AssignTo: new ObjectID(req.user._id),AssignedBy: new ObjectID(req.user._id),Priority: 0,AssignDate : moment().format("YYYY-MM-DD") })
            }
            Object.assign(UpdateData, { UserId: req.user._id })
            Object.assign(UpdateData, { CreatedBy: req.user._id })
            await ClaimStatusUpdate.updateOne({ _id: new ObjectID(req.body.ClaimHistoryId) }, UpdateData)

            res.json({
                data: UpdateData,
                Result: true,
            })
        } else {
            res.json({
                data: [],
                Result: false,
            })
        }

    } else {
        var ClaimLines = JSON.parse(req.body.ClaimLines)
        var ClaimHistory = []
        for (var i = 0; i < ClaimLines.length; i++) {
            var UpdateData = { updated_by: req.user._id }
            Object.assign(UpdateData, { LastWorkingDate:  moment().format("YYYY-MM-DD") })
            if (req.body.StatusCode) {
                Object.assign(UpdateData, { SystemStatus: req.body.StatusCode.value })
                Object.assign(UpdateData, { StatusCode: req.body.StatusCode.value })

            }
            if (req.user.RoleType == "AR-Caller") {
                Object.assign(UpdateData, { CallerStatusChanged: "Yes" })
                Object.assign(UpdateData, { CallerStatusChangedDate: moment().format("YYYY-MM-DD") })
                Object.assign(UpdateData, { PCAStatus: "No" })
                Object.assign(UpdateData, { PCAStatusDate: moment().format("YYYY-MM-DD") })
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
            if (req.body.ChangeRootCause) {
                Object.assign(UpdateData, { RootCause: req.body.ChangeRootCause.value })
            }
            await Claim_Master.updateOne({ _id: ClaimLines[i]._id }, UpdateData)
            if (req.user.RoleType == "AR-Caller") {
                await Claim_Master.updateOne({ _id: ClaimLines[i]._id ,AssignTo : {$eq : null} }, {...UpdateData,AssignTo: new ObjectID(req.user._id),AssignedBy: new ObjectID(req.user._id),Priority: 0,AssignDate : moment().format("YYYY-MM-DD") })
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

var reqPath = path.join(__dirname, '../../public/ClaimsUpload');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, reqPath)
    },
    // filename: function (req, file, cb) {
    //     var datetimestamp = Date.now();
    //     cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    // }
});
var uploads = multer({
    storage: storage,
    fileFilter: function (req, file, callback) { //file filter

        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
            return callback(new Error('Wrong extension type'));
        }
        callback(null, true);
    }
}).array('ClaimFiles');

const downloadFile = (filePath, bucketName, key) => {
    const params = {
        Bucket: bucketName,
        Key: key
    };
    s3Client.getObject(params, (err, data) => {
        if (err) console.error(err);
        fs.writeFileSync(filePath, data.Body.toString());
        console.log(`${filePath} has been created!`);
    });
};
router.put('/s3download', async (req, res, next) => {
    
    const filePath = reqPath + "/rootkey.csv";
    const bucketName = 'scio-ar-tracking';
    const key = 'rootkey.csv';

    downloadFile(filePath, bucketName, key);
})
router.post('/upload', uploadSinfleFile.single('file'), (req, res) => {

    uploadParams.Key = moment("DDMMYYYY")+"/"+req.file.originalname;
    uploadParams.Body = req.file.buffer;

    s3Client.upload(uploadParams, (err, data) => {
        if (err) {
            res.status(500).json({ error: "Error -> " + err });
        }
        res.json({
            message: 'File uploaded successfully',
            filename: req.file.originalname,
            location: data.Location
        });
    });

});

async function ProcessFiles(req, res, callback) {

    uploads(req, res, async function (err) {
        const FilesSuccessData = []
        const Errors = { filePath: [], MismatchTemplates: [], DataNoFound: [] }
        const SuccessFileNames = []
        const getDBColumns = []

        const Claim_MasterUpdateAlreayExists = []
        const Claim_MasterTempMasterStatusTrue = []
        const AtuoReopenClaim_MasterUpdateAlreayExists = []
        const AtuoReopenClaim_MasterTempMasterStatusTrue = []

        const getPracticeCoumns = await Practice.findOne({ _id: JSON.parse(req.body.PracticeId).value }, { DisplayNames: 1, PmId: 1, _id: 1 })

        const GetPmSystem = await PmSystem.findOne({_id : new ObjectID(getPracticeCoumns.PmId)},{ClaimLevel:1})
        /** Get Practice Columns Start */
        if (getPracticeCoumns) {
            for (var getColumns = 0; getColumns < getPracticeCoumns.DisplayNames.length; getColumns++) {
                getDBColumns.push(getPracticeCoumns.DisplayNames[getColumns].label)
            }
        }
        /** Get Practice Columns End */

        /** Check Frist Time Uplaod Practice Start */
        var CheckPracticeIdClaimMaster = await Claim_Master.findOne({ PracticeId: getPracticeCoumns._id, })
        /** Check Frist Time Uplaod Practice End */
        try {
            //ClaimUploadlog.info(`Claim Upload Start ${req.user._id} ${JSON.stringify(req.files)}`)
            //for (var i = 0; i < req.files.length; i++) {
            var i = 0;
            //ClaimUploadlog.info(`Claim Upload Start Loop Count ${i} ${req.user._id} ${JSON.stringify(req.files)}`)
            try {
                // Need these settings in readFile options
                const readOpts = {
                    cellText: false,
                    cellDates: true
                };
                const jsonOpts = {
                    raw: false,
                    dateNF: 'YYYY"-"MM"-"DD'
                    // Need dateNF in sheet_to_json options (note the escape chars)
                }
                var file = await reader.readFile(`${req.files[i].path}`, readOpts)

                // Get Excel Sheet Data
                var temp = await reader.utils.sheet_to_json(file.Sheets[file.SheetNames[0]], jsonOpts)

                var temp = await temp.map((user) => ({
                    ...user,
                    PmId: getPracticeCoumns.PmId,
                    PracticeId: getPracticeCoumns._id,
                    created_by: req.user._id,
                }));

                var ErrorLogData = {
                    PmId: getPracticeCoumns.PmId,
                    PracticeId: getPracticeCoumns._id,
                    UserId: req.user._id,
                    FileName: req.files[i].originalname,
                    TotalNumOfRecords: temp.length,
                    SuccessRecords: "",
                    FailedRecords: "",
                    CreatedBy: req.user._id,
                    ErrorMsg: ""
                }
                // Get Excel Column Names
                var columnsExcelHeadersArray = await reader.utils.sheet_to_json(file.Sheets[file.SheetNames[0]], { header: 1 })[0];

                // First Check Equal Columns and Column Names and push Success Files
                if (columnsExcelHeadersArray.length == getDBColumns.length) {

                    var CheckColumns = columnsExcelHeadersArray.filter(d => !getDBColumns.includes(d))

                    if (CheckColumns.length > 0) {

                        var ErrorMessage = `${req.files[i].originalname} Header Names Mismatch : ${CheckColumns.join(" , ")}`

                        Errors.MismatchTemplates.push(ErrorMessage)
                        ErrorLogData.ErrorMsg = ErrorMessage
                        new FileUploadLogs(ErrorLogData).save()

                    } else {
                        if (Object.keys(temp).length > 0) {

                            var JSONStringtemp = JSON.stringify(JSON.stringify(temp))

                            for (getD = 0; getD < getPracticeCoumns.DisplayNames.length; getD++) {
                                var value = getPracticeCoumns.DisplayNames[getD].value
                                var label = getPracticeCoumns.DisplayNames[getD].label
                                JSONStringtemp = JSONStringtemp.replaceAll('\\"' + String(label) + '\\":', '\\"' + String(value) + '\\":');
                            }
                            if (CheckPracticeIdClaimMaster) {
                                try {
                                    await ClaimMasterTemp.deleteMany({ PracticeId: new ObjectID(getPracticeCoumns._id)})
                                    await ClaimMasterTemp.insertMany(JSON.parse(JSON.parse(JSONStringtemp))).then(async (GetInsterData) => {
                                        SuccessFileNames.push(`${req.files[i].originalname} Total Success Records ${GetInsterData.length}`)
                                        
                                        await Claim_Master.find({
                                            PracticeId: getPracticeCoumns._id,
                                            SystemStatus: { $nin: ["Auto Close"] }
                                        }).then(async (GetMasterData) => {
                                            
                                            await GetMasterData.map(async (doc, ind) => {
                                                var ress = "";
                                                if(GetPmSystem.ClaimLevel == "1"){
                                                    ress = await ClaimMasterTemp.findOne({
                                                        PracticeId: new ObjectID(doc.PracticeId),
                                                        created_by: new ObjectID(doc.created_by),
                                                        Bill: doc.Bill
                                                    })
                                                }else {
                                                    var DateOfService = new Date(doc.DateOfService);
                                                    DateOfService.setUTCHours(00,00,00)
                                                    ress = await ClaimMasterTemp.findOne({
                                                        PracticeId: new ObjectID(doc.PracticeId),
                                                        created_by: new ObjectID(doc.created_by),
                                                        DateOfService: DateOfService,
                                                        //PayerName: doc.PayerName,
                                                        Account : doc.Account,
                                                        ProcedureCode : doc.ProcedureCode
                                                    })
                                                }

                                                if (ress) {

                                                    var Data = JSON.parse(JSON.stringify(ress))
                                                    delete Data._id
                                                    Claim_MasterUpdateAlreayExists.push({
                                                        updateOne: {
                                                            filter: { _id: doc._id },
                                                            update: { $set: Data }
                                                        }
                                                    });
                                                    Claim_MasterTempMasterStatusTrue.push({
                                                        updateOne: {
                                                            filter: { _id: ress._id },
                                                            update: { $set: { MatchedStatus: true } }
                                                        }
                                                    })
                                                } else {
                                                    Claim_MasterUpdateAlreayExists.push({
                                                        updateOne: {
                                                            filter: { _id: doc._id },
                                                            update: { $set: { SystemStatus: "Auto Close" } }
                                                        }
                                                    });
                                                }
                                                if (GetMasterData.length - 1 == ind) {

                                                    try {
                                                        let result = await new Promise(async (resolve, reject) => {

                                                            await Claim_Master.bulkWrite(Claim_MasterUpdateAlreayExists, { IsOrdered: false }, (err, r) => {
                                                                if (err) reject(err);
                                                                resolve(r);
                                                            });
                                                        });
                                                        console.log("Object.keys(result).length", Object.keys(result).length)
                                                        let result2 = await new Promise(async (resolve, reject) => {

                                                            await ClaimMasterTemp.bulkWrite(Claim_MasterTempMasterStatusTrue, { IsOrdered: false }, (err, r) => {
                                                                if (err) reject(err);
                                                                resolve(r);
                                                            });
                                                        });

                                                        if (Object.keys(result).length > 0 && Object.keys(result2).length > 0) {
                                                            await Claim_Master.find({ PracticeId: new ObjectID(getPracticeCoumns._id), SystemStatus: { $in: ["Auto Close"] } }).then(async (GetMasterData) => {

                                                                if (GetMasterData.length == 0) {
                                                                    console.log("un matched get length is empty")
                                                                    await ClaimMasterTemp.aggregate([
                                                                        {
                                                                            $match: {
                                                                                MatchedStatus: false,
                                                                                PracticeId: getPracticeCoumns._id,
                                                                                created_by: req.user._id
                                                                            }
                                                                        }
                                                                    ]).then(async (ress) => {
                                                                        var temp = await ress.map((user) => ({
                                                                            ...user,
                                                                            SystemStatus: "Auto Open",
                                                                            PmId: getPracticeCoumns.PmId,
                                                                            PracticeId: getPracticeCoumns._id,
                                                                            created_by: req.user._id,
                                                                        }));

                                                                        await Claim_Master.insertMany(temp).then(async(getData) => {
                                                                            
                                                                            SuccessFileNames.push(`${req.files[i].originalname} New Claims Records Counts ${getData.length}`)
                                                                        })
                                                                    })
                                                                    
                                                                } else {
                                                                    await GetMasterData.map(async (doc, ind) => {

                                                                        var ress = "";
                                                                        if(GetPmSystem.ClaimLevel == "1"){
                                                                            ress = await ClaimMasterTemp.findOne({
                                                                                PracticeId: new ObjectID(doc.PracticeId),
                                                                                created_by: new ObjectID(doc.created_by),
                                                                                Bill: doc.Bill
                                                                            })
                                                                        }else {
                                                                            var DateOfService = new Date(doc.DateOfService);
                                                                            DateOfService.setUTCHours(00,00,00)
                                                                            ress = await ClaimMasterTemp.findOne({
                                                                                PracticeId: new ObjectID(doc.PracticeId),
                                                                                created_by: new ObjectID(doc.created_by),
                                                                                DateOfService: DateOfService,
                                                                                //PayerName: doc.PayerName,
                                                                                Account : doc.Account,
                                                                                ProcedureCode : doc.ProcedureCode
                                                                            })
                                                                        }
                                
                                                                        if (ress) {

                                                                            Object.assign(ress, { SystemStatus: "Auto Re Open" })
                                                                            delete ress._id

                                                                            AtuoReopenClaim_MasterUpdateAlreayExists.push({
                                                                                updateOne: {
                                                                                    filter: { _id: new ObjectID(doc._id) },
                                                                                    update: { $set: ress }
                                                                                }
                                                                            });
                                                                            AtuoReopenClaim_MasterTempMasterStatusTrue.push({
                                                                                updateOne: {
                                                                                    filter: { _id: new ObjectID(ress._id) },
                                                                                    update: { $set: { MatchedStatus: true } }
                                                                                }
                                                                            })

                                                                        }

                                                                        if (GetMasterData.length - 1 == ind) {
                                                                            console.log("loop in end in status")
                                                                            try {
                                                                                let result = await new Promise(async (resolve, reject) => {

                                                                                    await Claim_Master.bulkWrite(AtuoReopenClaim_MasterUpdateAlreayExists, { IsOrdered: false }, (err, r) => {
                                                                                        if (err) reject(err);
                                                                                        resolve(r);
                                                                                    });
                                                                                });
                                                                                let result2 = await new Promise(async (resolve, reject) => {

                                                                                    await ClaimMasterTemp.bulkWrite(AtuoReopenClaim_MasterTempMasterStatusTrue, { IsOrdered: false }, (err, r) => {
                                                                                        if (err) reject(err);
                                                                                        resolve(r);
                                                                                    });
                                                                                });
                                                                                if (Object.keys(result).length > 0 && Object.keys(result2).length > 0) {
                                                                                    await ClaimMasterTemp.aggregate([
                                                                                        {
                                                                                            $match: {
                                                                                                MatchedStatus: false,
                                                                                                PracticeId: getPracticeCoumns._id,
                                                                                                created_by: req.user._id
                                                                                            }
                                                                                        }
                                                                                    ]).then(async (res) => {
                                                                                        var temp = await res.map((user) => ({
                                                                                            ...user,
                                                                                            SystemStatus: "Auto Open",
                                                                                            PmId: getPracticeCoumns.PmId,
                                                                                            PracticeId: getPracticeCoumns._id,
                                                                                            created_by: req.user._id,
                                                                                        }));
                                                                                        await Claim_Master.insertMany(temp).then(async(getData) => {
                                                                                            
                                                                                            SuccessFileNames.push(`${req.files[i].originalname} New Claims Records Counts ${getData.length}`)
                                                                                        })
                                                                                    })
                                                                                    
                                                                                }


                                                                            } catch (e) {
                                                                                console.log("Failed:");
                                                                                console.log(e);
                                                                            }
                                                                        }

                                                                    })
                                                                }

                                                            })
                                                        }




                                                    } catch (e) {
                                                        console.log("Failed:");
                                                        console.log(e);
                                                    }
                                                }

                                            })
                                        })
                                    })
                                } catch (e) {
                                    console.log("e", e)
                                }
                            } else {
                                await Claim_Master.insertMany(JSON.parse(JSON.parse(JSONStringtemp))).then((getData) => {
                                    SuccessFileNames.push(`${req.files[i].originalname} Total Success Records ${getData.length}`)
                                })
                            }
                        } else {
                            var ErrorMessage = `${req.files[i].originalname} Data Not found`
                            Errors.DataNoFound.push(ErrorMessage)
                            ErrorLogData.ErrorMsg = ErrorMessage
                            new FileUploadLogs(ErrorLogData).save()
                        }
                    }
                    // Check Greater than Uploaded Excel
                } else if (columnsExcelHeadersArray.length > getDBColumns.length) {

                    var CheckColumns = columnsExcelHeadersArray.filter(d => !getDBColumns.includes(d))

                    if (CheckColumns.length > 0) {
                        var ErrorMessage = `${req.files[i].originalname} Header Mismatch - Extra Columns found : ${CheckColumns.join(" , ")}`

                        Errors.MismatchTemplates.push(ErrorMessage)
                        ErrorLogData.ErrorMsg = ErrorMessage
                        new FileUploadLogs(ErrorLogData).save()
                    }

                    // Check Less than Uploaded Excel
                } else if (columnsExcelHeadersArray.length < getDBColumns.length) {
                    var CheckColumns = getDBColumns.filter(d => !columnsExcelHeadersArray.includes(d))
                    if (CheckColumns.length > 0) {
                        var ErrorMessage = `${req.files[i].originalname} Header Mismatch - Columns Missing : ${CheckColumns.join(" , ")}`

                        Errors.MismatchTemplates.push(ErrorMessage)
                        ErrorLogData.ErrorMsg = ErrorMessage
                        new FileUploadLogs(ErrorLogData).save()
                    }
                }
                if (req.files.length - 1 == i) {

                    callback(null, {
                        Errors: Errors,
                        SuccessFileNames: SuccessFileNames,
                    });
                }
            } catch (e) {
                console.log("e", e)
            }
            //}
        } catch (e) {
            console.log("e", e)
            callback(null, {
                Errors: e
            });
        }
    })
}
router.put('/UplodClaims', passport.authenticate("jwt", { session: false }), async (req, res, next) => {
    await ProcessFiles(req, res, function (err, Result) {
        res.json(Result)
    })
})



async function ClaimsDumpUpload(req, res, callback) {

    uploads(req, res, async function (err) {
        
        const Errors = { filePath: [], MismatchTemplates: [], DataNoFound: [] }
        const SuccessFileNames = []
        const getDBColumns = []

        const getPracticeCoumns = await Practice.findOne({ _id: JSON.parse(req.body.PracticeId).value }, { DisplayNames: 1, PmId: 1, _id: 1 })

        /** Get Practice Columns Start */
        if (getPracticeCoumns) {
            for (var getColumns = 0; getColumns < getPracticeCoumns.DisplayNames.length; getColumns++) {
                getDBColumns.push(getPracticeCoumns.DisplayNames[getColumns].label)
            }
        }
        /** Get Practice Columns End */

        try {
            ClaimUploadlog.info(`Dump Claim Upload Start ${req.user._id} ${JSON.stringify(req.files)}`)
            for (var i = 0; i < req.files.length; i++) {
                ClaimUploadlog.info(`Dump Claim Upload Start Loop Count ${i} ${req.user._id} ${JSON.stringify(req.files)}`)
                try {
                    // Need these settings in readFile options
                    const readOpts = {
                        cellText: false,
                        cellDates: true
                    };
                    const jsonOpts = {
                        raw: false,
                        dateNF: 'YYYY"-"MM"-"DD'
                    }
                    var file = await reader.readFile(`${req.files[i].path}`, readOpts)

                    // Get Excel Sheet Data
                    var temp = await reader.utils.sheet_to_json(file.Sheets[file.SheetNames[0]], jsonOpts)

                    var temp = await temp.map((user) => ({
                        ...user,
                        SystemStatus : user.Status ? user.Status : "Auto Open",
                        PmId: getPracticeCoumns.PmId,
                        PracticeId: getPracticeCoumns._id,
                        created_by: req.user._id,
                    }));

                    const UniqueSystemStatus = [...new Set(temp.map(item => item.SystemStatus))]
                    const UniqueRootCause = [...new Set(temp.map(item => item.RootCause))].filter(function(value) {return value !== undefined;});;

                    var CheckStatusCodes  = await arScenario.countDocuments({ value: { $in: UniqueSystemStatus },type:"statuscode" })
                    var CheckRootCause  = await  arScenario.countDocuments({ value: { $in: UniqueRootCause },type:"RootCauseCodes" })
                    console.log("CheckStatusCodes.length != CheckStatusCodes",CheckStatusCodes.length,CheckStatusCodes)

                    console.log("UniqueRootCause",UniqueRootCause.length,UniqueSystemStatus.length,CheckRootCause,CheckStatusCodes)

                    if(UniqueSystemStatus.length != CheckStatusCodes){
                        var ErrorMessage = `Status Codes Mismtach`
                        Errors.MismatchTemplates.push(ErrorMessage)
                        callback(null, {
                            Errors: Errors,
                            SuccessFileNames: SuccessFileNames,
                        });
                        console.log("Errors",Errors)
                        return false;
                    }
                    if(UniqueRootCause.length != CheckRootCause){
                        var ErrorMessage = `RootCause Codes Mismtach`
                        Errors.MismatchTemplates.push(ErrorMessage)
                        callback(null, {
                            Errors: Errors,
                            SuccessFileNames: SuccessFileNames,
                        });
                        return false;
                    }
                    
                    var ErrorLogData = {
                        PmId: getPracticeCoumns.PmId,
                        PracticeId: getPracticeCoumns._id,
                        UserId: req.user._id,
                        FileName: req.files[i].originalname,
                        TotalNumOfRecords: temp.length,
                        SuccessRecords: "",
                        FailedRecords: "",
                        CreatedBy: req.user._id,
                        ErrorMsg: ""
                    }
                    
                    if (Object.keys(temp).length > 0) {

                        var JSONStringtemp = JSON.stringify(JSON.stringify(temp))

                        for (getD = 0; getD < getPracticeCoumns.DisplayNames.length; getD++) {
                            var value = getPracticeCoumns.DisplayNames[getD].value
                            var label = getPracticeCoumns.DisplayNames[getD].label
                            JSONStringtemp = JSONStringtemp.replaceAll('\\"' + String(label) + '\\":', '\\"' + String(value) + '\\":');
                        }

                        try {
                            
                            ClaimUploadlog.info(`Dump Claim Upload Delete Start`)
                            await Claim_Master.deleteMany({ PracticeId : new ObjectID(getPracticeCoumns._id)})
                            await ClaimStatusUpdate.deleteMany({ ClaimPracticeId : new ObjectID(getPracticeCoumns._id)})
                            ClaimUploadlog.info(`Dump Claim Upload Delete End`)
                            await Claim_Master.insertMany(JSON.parse(JSON.parse(JSONStringtemp))).then(async(getData) => {
                                var ClaimStatusUpdateChild = []
                                await getData.map(async (doc,ind)=>{

                                    ClaimStatusUpdateChild.push({ 
                                        RootCause : doc.RootCause,
                                        StatusCode: doc.SystemStatus,
                                        Comments: doc.Comments,
                                        UserId: new ObjectID(req.user._id),
                                        ClaimId : new ObjectID(doc._id),
                                        CreatedBy: new ObjectID(req.user._id),
                                        ClaimPracticeId : new ObjectID(doc.PracticeId)
                                    })
                                    if(getData.length - 1 == ind){
                                        await ClaimStatusUpdate.insertMany(ClaimStatusUpdateChild).then((getDataChild) => {
                                            ClaimUploadlog.info(`Dump Claim Child Data Done ${getDataChild.length}`)
                                        })
                                    }
                                })
                                SuccessFileNames.push(`${req.files[i].originalname} Total Success Records ${getData.length}`)
                            })
                            
                        } catch (e) {
                            console.log("e", e)
                        }

                    } else {

                        var ErrorMessage = `${req.files[i].originalname} Data Not found`
                        Errors.DataNoFound.push(ErrorMessage)
                        ErrorLogData.ErrorMsg = ErrorMessage
                        new FileUploadLogs(ErrorLogData).save()

                    }
                    if (req.files.length - 1 == i) {

                        callback(null, {
                            Errors: Errors,
                            SuccessFileNames: SuccessFileNames,
                        });
                    }
                } catch (e) {
                    console.log("e", e)
                }
            }
        } catch (e) {
            console.log("e", e)
            callback(null, {
                Errors: e
            });
        }
    })
}
router.put('/ClaimsDumpUpload', passport.authenticate("jwt", { session: false }), async (req, res, next) => {
    await ClaimsDumpUpload(req, res, function (err, Result) {
        res.json(Result)
    })
})
router.post('/RemovePracticeId', (req, res, next) => {

    Claim_Master.deleteMany({ PracticeId : new ObjectID(req.body.PracticeId)}).then((ress)=>{
        res.json({
            ress : ress
        })
    }).catch((err)=>{
        console.log("test",err)
    })
})

router.post('/GetPracticeWiseData', async(req, res, next) => {

    var test = [
        {
            $group: {
                _id: "$PracticeId",
                "count": {
                    "$sum": 1
                }
            }
        },
        {
            $lookup: {
                from: "practices",
                localField: "_id",
                foreignField: "_id",
                as: "practices"
            }
        },
        {
            $unwind: "$practices"
        },
        // {
        //     $lookup: {
        //         from: "pm_systems",
        //         localField: "PmId",
        //         foreignField: "practices.PmId",
        //         as: "pm_systems"
        //     }
        // },
        // {
        //     $unwind: "$pm_systems"
        // },
        {
            $project: {
                PracticeId: "$_id",
                ClaimCount: "$count",
                PracticeName: "$practices.PracticeName",
                // ClaimLevel: "$pm_systems.ClaimLevel",
                // PmName : "$pm_systems.PmName",
            }
        },

    ]
    await Claim_Master.aggregate(test).then((ress)=>{
        res.json({
            ress : ress
        })
    }).catch((err)=>{
        console.log("test",err)
    })
})


router.get("/getColumnsByUser",passport.authenticate("jwt", { session: false }), async(req, res, next) => {

    UserDatatableColumns.findOne({ 
        UserId: new ObjectID(req.user._id) ,
        PageType : req.query.PageType
    }).then((ress)=>{
        if(ress){
            var ProjectSelectedColumns = {}
            
            ress.Columns.map((dd,i)=>{
                Object.assign(ProjectSelectedColumns,{[dd.label] : dd.value})
            })
            console.log("ProjectSelectedColumns",ProjectSelectedColumns)
            res.json({
                data : ProjectSelectedColumns
            })
        }else {
            res.json({
                data : ""
            })
        }
    }).catch((err)=>{
        console.log("test",err)
    })
})
router.post("/UpdateColumnsByUser", passport.authenticate("jwt", { session: false }),async(req, res, next) => {
    var data = JSON.parse(req.body.Columns)[0]
    
    var keys = Object.keys(data);
    var ClaimData = []
    keys.map((resss,ind)=>{
        if(resss != "__check__"){
            ClaimData.push({
                value : Boolean(data[resss]),
                label : resss
            })
        }
    })
    UserDatatableColumns.findOneAndUpdate({ 
        UserId: new ObjectID(req.user._id) ,
        PageType : req.body.PageType
    }, { $set: {
        UserId: new ObjectID(req.user._id) ,
        Columns : ClaimData,
        PageType : req.body.PageType
    } }, { upsert: true, new: true }).then((ress)=>{
        res.json({
            ress : ress
        })
    }).catch((err)=>{
        console.log("test",err)
    })

})
router.post('/UpdatePracticeUpdatedDate', (req, res, next) => {

    Claim_Master.find({ PracticeId : new ObjectID(req.body.PracticeId)}).then((ress)=>{
        ress.map(async (resd,ind)=>{
            await Claim_Master.updateOne({_id : new ObjectID(resd._id)},{$set : 
                {
                    PatientDOB : resd.PatientDOB ? moment(resd.PatientDOB).format("YYYY-MM-DD") : null,
                    IntialClaimDate : resd.IntialClaimDate ? moment(resd.IntialClaimDate).format("YYYY-MM-DD") : null

                },
                }).then((updatedDAta)=>{
                console.log("resd",resd.Bill)
                console.log("updatedDAta",updatedDAta)
            })
        })
    }).catch((err)=>{
        console.log("test",err)
    })
})

router.post('/UplodClaims', passport.authenticate("jwt", { session: false }), (req, res, next) => {

    uploads(req, res, async function (err) {

        //ClaimUploadlog.info(`Claim Upload Start ${req.user._id} ${JSON.stringify(req.files)}`)
        var getDBColumns = []
        var getPracticeCoumns = await Practice.findOne({ _id: JSON.parse(req.body.PracticeId).value }, { DisplayNames: 1, PmId: 1 })
        //ClaimUploadlog.info(`Start Loop 1 ${req.user._id} `)

        if (getPracticeCoumns) {
            getPracticeCoumns.DisplayNames.map(async (res) => {
                getDBColumns.push(res.label)
            })
        }
        //ClaimUploadlog.info(`Start Loop 2 ${req.user._id} `)
        if (err instanceof multer.MulterError) {
            res.status(500).send({ error: { message: `Multer uploading error: ${err.message}` } }).end();
            return;
        } else if (err) {
            if (err.name == 'ExtensionError') {
                res.status(413).send({ error: { message: err.message } }).end();
            } else {
                res.status(500).send({ error: { message: `unknown uploading error: ${err.message}` } }).end();
            }
            return;
        }
        var FilesSuccessData = []
        var Errors = { filePath: [], MismatchTemplates: [], DataNoFound: [] }
        var SuccessFileNames = []
        //ClaimUploadlog.info(`Start Loop 3 ${req.user._id} `)
        try {
            for (var i = 0; i < req.files.length; i++) {

                //ClaimUploadlog.info(`Start Loop 4 ${req.user._id} `)
                //console.log("req.files[i].path", req.files[i].path)
                try {
                    var file = await reader.readFile(`${req.files[i].path}`)

                    //ClaimUploadlog.info(`Start Loop 5 ${req.user._id} `)
                    // Get Excel Sheet Data
                    const temp = await reader.utils.sheet_to_json(file.Sheets[file.SheetNames[0]], {
                        raw: false, header: getDBColumns, dateNF: 'yyyy-mm-dd'
                    })
                    //ClaimUploadlog.info(`Start Loop 6 ${req.user._id} `)
                    // Get Excel Column Names
                    var columnsExcelHeadersArray = await reader.utils.sheet_to_json(file.Sheets[file.SheetNames[0]], { header: 1 })[0];

                    //ClaimUploadlog.info(`Start Loop 7 ${req.user._id} `)

                    // First Check Equal Columns and Column Names and push Success Files
                    if (columnsExcelHeadersArray.length == getDBColumns.length) {
                        //ClaimUploadlog.info(`Start Loop 8 ${req.user._id} `)
                        var CheckColumns = columnsExcelHeadersArray.filter(d => !getDBColumns.includes(d))
                        //ClaimUploadlog.info(`Start Loop 9 ${req.user._id} `)
                        //console.log("req.files[i].originalname",req.files[i].originalname)

                        if (CheckColumns.length > 0) {
                            //ClaimUploadlog.info(`Start Loop 10 ${req.user._id} `)
                            Errors.MismatchTemplates.push(`${req.files[i].originalname} Header Names Mismatch : ${CheckColumns.join(" , ")}`)
                            //ClaimUploadlog.info(`Start Loop 11 ${req.user._id} `)
                        } else {

                            if (Object.keys(temp).length > 0) {
                                //ClaimUploadlog.info(`Start Loop 12 ${req.user._id} `)
                                SuccessFileNames.push(req.files[i].originalname)
                                var JSONStringtemp = JSON.stringify(JSON.stringify(temp))

                                getPracticeCoumns.DisplayNames.map((res) => {

                                    JSONStringtemp = JSONStringtemp.replaceAll('\\"' + String(res.label) + '\\":', '\\"' + String(res.value) + '\\":');

                                })
                                //ClaimUploadlog.info(`Start Loop 13 ${req.user._id} `)
                                FilesSuccessData.push({
                                    [req.files[i].filename]: JSON.parse(JSONStringtemp)
                                })
                                //ClaimUploadlog.info(`Start Loop 14 ${req.user._id} `)
                            } else {
                                //ClaimUploadlog.info(`Start Loop 15 ${req.user._id} `)
                                Errors.DataNoFound.push(`${req.files[i].originalname} Data Not found`)
                                //ClaimUploadlog.info(`Start Loop 16 ${req.user._id} `)
                            }

                        }
                        // Check Greater than Uploaded Excel
                    } else if (columnsExcelHeadersArray.length > getDBColumns.length) {
                        //ClaimUploadlog.info(`Start Loop 17 ${req.user._id} `)
                        var CheckColumns = columnsExcelHeadersArray.filter(d => !getDBColumns.includes(d))
                        //ClaimUploadlog.info(`Start Loop 18 ${req.user._id} `)
                        if (CheckColumns.length > 0) {
                            Errors.MismatchTemplates.push(`${req.files[i].originalname} Header Mismatch - Extra Columns found : ${CheckColumns.join(" , ")}`)
                        }
                        // Check Less than Uploaded Excel
                    } else if (columnsExcelHeadersArray.length < getDBColumns.length) {
                        //ClaimUploadlog.info(`Start Loop 19 ${req.user._id} `)
                        var CheckColumns = getDBColumns.filter(d => !columnsExcelHeadersArray.includes(d))
                        //ClaimUploadlog.info(`Start Loop 20 ${req.user._id} `)
                        if (CheckColumns.length > 0) {
                            Errors.MismatchTemplates.push(`${req.files[i].originalname} Header Mismatch - Columns Missing : ${CheckColumns.join(" , ")}`)
                        }
                    }


                    if (req.files.length - 1 == i) {
                        if (Object.keys(FilesSuccessData).length > 0) {

                            for (j = 0; j < FilesSuccessData.length; j++) {

                                for (const [Fileame, FileData] of Object.entries(FilesSuccessData[j])) {

                                    console.log(`Here is key ${Fileame} and here is value ${JSON.stringify(FileData)}`);
                                }
                            }
                            //ClaimUploadlog.info(`Start Loop 22 ${req.user._id} `)
                        }
                        res.status(200).json({
                            Errors: Errors,
                            SuccessFileNames: SuccessFileNames,
                        });
                    }
                } catch (e) {
                    console.log("Find File error", e)
                }
            }
        } catch (e) {
            console.log("e", e)
            res.status(500).json({
                Errors: e
            });
        }

    })
})
router.post('/claimsdetails', passport.authenticate("jwt", { session: false }), uploadSinfleFile.single('file'), async (req, res, next) => {



    uploadParams.Key = moment("DDMMYYYY") + "/" + req.file.originalname;
    uploadParams.Body = req.file.buffer;

    s3Client.upload(uploadParams, (err, data) => {
        if (err) {
            res.status(500).json({ error: "Error -> " + err });
        }
        res.json({
            message: 'File uploaded successfully',
            filename: req.file.originalname,
            location: data.Location
        });
    });

    const file = req.file.filename
    console.log(req.body)
    console.log(file)

    const claimsdocument = await new claimDocument({ ProviderName: req.body.ProviderName, PatientName: req.body.PatientName, PayerName: req.body.PayerName, ClaimId: req.body.ClaimId, FileName: req.body.FileName })
    await claimsdocument.save()

    res.json({
        msg: 'sucess'
    })
})
module.exports = router;