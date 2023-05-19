const express = require('express');
const passport = require('passport');
const router = express.Router();
const moment = require("moment")
const Claim_Master = require("../models/ClaimMaster")
const Practice = require("../models/Practice")
const ARDetails = require("../models/ARDetails")
var ObjectID = require('mongodb').ObjectID;
moment.tz.setDefault("America/florida");
var MySqlDb = require('../Config/database');

async function getMonthYearString(startDate,endDate){
    var betweenMonths = [];

    if (startDate <= endDate){
        var date = startDate.startOf('month');
        while (date <= endDate.endOf('month')) {

            betweenMonths.push("'"+date.format('MMM-YY')+"'");
            date.add(1,'month');
        }
    }
    return betweenMonths;
}

async function getPracticeNameList(PracticeNameData){
    var PracticeNameList = [];
    PracticeNameData.map((res,ind)=>{
        if(res.label !== "All"){
            PracticeNameList.push("'"+res.label+"'");
        }
    })
    return PracticeNameList;
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
router.get('/GetClaimOutstanding', passport.authenticate("jwt",{session:false}), async (req, res) => {
    const UnTouchedClaims = ["Open", "Fresh-Call", "RECBILL", "HOLD", "Auto Open"]
    var PracticeName = req.query.PracticeName
    var getPracticeCoumns = await Practice.findOne({ PracticeName: PracticeName}, { PracticeName: 1,_id:1 })
    
    var query = { $and: [] }
    query.$and.push({
        PracticeId: new ObjectID(getPracticeCoumns._id),
        SystemStatus: { $in: UnTouchedClaims },
    })
    var GetDataUNTouchedCounts = await GetTotalAmountClaimBalance(query, "UntotalAmount")
    var UnToucheddays30 = 0;
    var UnToucheddays60 = 0;
    var UnToucheddays90 = 0;
    var UnToucheddays120 = 0;
    var UnToucheddays120Above = 0;
    var UnToucheddays30Count = 0;
    var UnToucheddays60Count = 0;
    var UnToucheddays90Count = 0;
    var UnToucheddays120Count = 0;
    var UnToucheddays120AboveCount = 0;
    GetDataUNTouchedCounts.map((dataGet, ind) => {
        if (dataGet.Aging >= 0 && dataGet.Aging <= 30) {
            UnToucheddays30 += Number(dataGet.ClaimBalance);
            UnToucheddays30Count++;
        } else if (dataGet.Aging >= 31 && dataGet.Aging <= 60) {
            UnToucheddays60 += Number(dataGet.ClaimBalance);
            UnToucheddays60Count++;
        } else if (dataGet.Aging >= 61 && dataGet.Aging <= 90) {
            UnToucheddays90 += Number(dataGet.ClaimBalance);
            UnToucheddays90Count++;
        } else if (dataGet.Aging >= 91 && dataGet.Aging <= 120) {
            UnToucheddays120 += Number(dataGet.ClaimBalance);
            UnToucheddays120Count++;
        } else if (dataGet.Aging >= 121) {
            UnToucheddays120Above += Number(dataGet.ClaimBalance);
            UnToucheddays120AboveCount++;
        }
    })

    delete query.$and[0].SystemStatus;
    query.$and.push({
        SystemStatus: { $nin: UnTouchedClaims }
    })
    var GetDataTouchedCounts = await GetTotalAmountClaimBalance(query, "TouchedtotalAmount")
    var days30TouchedCounts = 0;
    var days60TouchedCounts = 0;
    var days90TouchedCounts = 0;
    var days120TouchedCounts = 0;
    var days120AboveTouchedCounts = 0;

    var days30TouchedAmounts = 0;
    var days60TouchedAmounts = 0;
    var days90TouchedAmounts = 0;
    var days120TouchedAmounts = 0;
    var days120AboveTouchedAmounts = 0;

    GetDataTouchedCounts.map((dataGet, ind) => {
        if (dataGet.Aging >= 0 && dataGet.Aging <= 30) {
            days30TouchedCounts++;
            days30TouchedAmounts += Number(dataGet.ClaimBalance);
        } else if (dataGet.Aging >= 31 && dataGet.Aging <= 60) {
            days60TouchedCounts++;
            days60TouchedAmounts += Number(dataGet.ClaimBalance);
        } else if (dataGet.Aging >= 61 && dataGet.Aging <= 90) {
            days90TouchedCounts++;
            days90TouchedAmounts += Number(dataGet.ClaimBalance);
        } else if (dataGet.Aging >= 91 && dataGet.Aging <= 120) {
            days120TouchedCounts++;
            days120TouchedAmounts += Number(dataGet.ClaimBalance);
        } else if (dataGet.Aging >= 121) {
            days120AboveTouchedCounts++;
            days120AboveTouchedAmounts += Number(dataGet.ClaimBalance);
        }
    })
    var Month = moment().format('MMM-YY');
    var AgingData = [
        { 
            
            Month: Month, Aging: "0-30", TouchedCount: days30TouchedCounts, TouchedAmount: days30TouchedAmounts, UnTouchedAmount: UnToucheddays30, UnTouchedCount: UnToucheddays30Count, PracticeId: new ObjectID(getPracticeCoumns._id), created_by: new ObjectID(req.user._id), updated_by: new ObjectID(req.user._id), },
        {
            Month: Month, Aging: "30-60", TouchedCount: days60TouchedCounts, TouchedAmount: days60TouchedAmounts, UnTouchedAmount: UnToucheddays60, UnTouchedCount: UnToucheddays60Count, PracticeId: new ObjectID(getPracticeCoumns._id), created_by: new ObjectID(req.user._id), updated_by: new ObjectID(req.user._id),
        },
        {
            Month: Month, Aging: "60-90", TouchedCount: days90TouchedCounts, TouchedAmount: days90TouchedAmounts, UnTouchedAmount: UnToucheddays90, UnTouchedCount: UnToucheddays90Count, PracticeId: new ObjectID(getPracticeCoumns._id), created_by: new ObjectID(req.user._id), updated_by: new ObjectID(req.user._id),
        },
        {
            Month: Month, Aging: "90-120", TouchedCount: days120TouchedCounts, TouchedAmount: days120TouchedAmounts, UnTouchedAmount: UnToucheddays120, UnTouchedCount: UnToucheddays120Count, PracticeId: new ObjectID(getPracticeCoumns._id), created_by: new ObjectID(req.user._id), updated_by: new ObjectID(req.user._id),
        },
        {
            Month: Month, Aging: "Above 120", TouchedCount: days120AboveTouchedCounts, TouchedAmount: days120AboveTouchedAmounts, UnTouchedAmount: UnToucheddays120Above, UnTouchedCount: UnToucheddays120AboveCount, PracticeId: new ObjectID(getPracticeCoumns._id), created_by: new ObjectID(req.user._id), updated_by: new ObjectID(req.user._id),
        },
    ]
    await ARDetails.deleteMany({Month : Month,PracticeId: new ObjectID(getPracticeCoumns._id)}).then((getData)=>{
        ARDetails.insertMany(AgingData).then((getData)=>{
            res.json({
                PracticeData : getData
            })
        })
    })
})

router.get('/getPracticeDashboard',  async (req,res)=>{

    var startDate = moment(new Date(`${req.query.FromDate}-01`));
    var endDate = moment(new Date(`${req.query.ToDate}-01`));
    var betweenMonths = await getMonthYearString(startDate,endDate)
    var PracticeNameList = await getPracticeNameList(req.query.PracticeName ? JSON.parse(req.query.PracticeName) : [])
    
    var Query=`call refresh_charges_view`;
    
    MySqlDb.query(Query, function (err, Callrefresh_charges_view, fields) {
        if (err) throw err;
        var Query=`call refresh_payments_view()`;
        MySqlDb.query(Query, function (err, Callrefresh_payments_view, fields) {
            if (err) throw err;

            if(PracticeNameList.length > 0){
                var Query=`SELECT sum(charges) as charges FROM charges_view where practice_name in (${PracticeNameList.toString()}) and month_year in (${betweenMonths.toString()})`;
            }else {
                var Query=`SELECT sum(charges) as charges FROM charges_view where month_year in (${betweenMonths.toString()})`;
            }
            
            MySqlDb.query(Query, function (err, ChargesResult, fields) {
                if (err) throw err;

                if(PracticeNameList.length > 0){
                    var Query=`SELECT sum(payments) as payments FROM payments_view where practice_name in (${PracticeNameList.toString()}) and month_year in (${betweenMonths.toString()})`;
                }else {
                    var Query=`SELECT sum(payments) as payments FROM payments_view where month_year in (${betweenMonths.toString()})`;
                }
                MySqlDb.query(Query, function (err, PaymentsResult, fields) {
                    if (err) throw err;
                    res.json({
                        data : [["", "",{ role: "style" }],["Charges", ChargesResult[0].charges, "#b87333"],["Payments", PaymentsResult[0].payments, "darkblue"]]
                    })
                })
            });
        });
    });
})



router.get('/getDaysinAr',  async (req,res)=>{


    var startDate = moment(new Date(`${req.query.FromDate}-01`));
    var endDate = moment(new Date(`${req.query.ToDate}-01`));
    var betweenMonths = [];
    if (startDate <= endDate){
        var date = startDate.startOf('month');
        while (date <= endDate.endOf('month')) {
            betweenMonths.push(date.format('MMM-YY'));
            date.add(1,'month');
        }
    }
    var Where = {}
    if(req.query.FromDate){
        Object.assign(Where,{ Month : { $in : betweenMonths} })
    }
    if(req.query.PracticeName){
        var getPracticeCoumns = await Practice.findOne({ PracticeName: JSON.parse(req.query.PracticeName).label}, { PracticeName: 1,_id:1 })
        console.log("getPracticeCoumns",getPracticeCoumns)
        Object.assign(Where,{ PracticeId : new ObjectID(getPracticeCoumns._id)})
    }


    var ArData  = await ARDetails.find(Where)

    var ARGroupData = [];
    await ArData.reduce(function(res, value) {
        if (!res[value.Month]) {
            res[value.Month] = { Month: value.Month, TouchedAmount: 0 };
            ARGroupData.push(res[value.Month])
        }
        res[value.Month].TouchedAmount += (Number(value.TouchedAmount) + Number(value.UnTouchedAmount));
        return res;
    }, {});


    var startDate = moment(new Date(`${req.query.FromDate}-01`));
    var endDate = moment(new Date(`${req.query.ToDate}-01`));
    var betweenMonths = await getMonthYearString(startDate,endDate)
    var PracticeNameList = await getPracticeNameList(req.query.PracticeName ? [JSON.parse(req.query.PracticeName)] : [])
    var Query="";
    if(PracticeNameList.length > 0){
        Query=`SELECT month_year as Month,(sum(billed_amount) / 22) as billed_amount FROM charges_by_posted_date where practice_name in (${PracticeNameList.toString()}) and month_year in (${betweenMonths.toString()}) group by month_year`;
    }else {
        Query=`SELECT month_year as Month,(sum(billed_amount) / 22)  as billed_amount FROM charges_by_posted_date where month_year in (${betweenMonths.toString()}) group by month_year`;
    }

    MySqlDb.query(Query, function (err, GetCountByPosttedTable, fields) {

        res.json({
            GetCountByPosttedTable : GetCountByPosttedTable,
            ArData : ARGroupData,
        })
    });
        
})


router.get('/getNcr',  async (req,res)=>{

    var startDate = moment(new Date(`${req.query.FromDate}-01`));
    var endDate = moment(new Date(`${req.query.ToDate}-01`));
    var betweenMonths = await getMonthYearString(startDate,endDate)
    var PracticeNameList = await getPracticeNameList(req.query.PracticeName ? [JSON.parse(req.query.PracticeName)] : [])
    var Query="";

    if(PracticeNameList.length > 0){
        Query=`SELECT month_year,sum(total_paid) as total_paid,sum(adjustments) as adjustments FROM payment_adj where practice_name in (${PracticeNameList.toString()}) and month_year in (${betweenMonths.toString()}) group by month_year`;
    }else {
        Query=`SELECT month_year,sum(total_paid) as total_paid,sum(adjustments) as adjustments FROM payment_adj where month_year in (${betweenMonths.toString()}) group by month_year`;
    }
    MySqlDb.query(Query, function (err, GetCountByPosttedTable, fields) {
        console.log("GetCountByPosttedTable",GetCountByPosttedTable)
        res.json({
            NcrData : GetCountByPosttedTable,
        })
    });
        
})

router.get('/getArDetails',  async (req,res)=>{
    var startDate = moment(new Date(`${req.query.FromDate}-01`));
    var endDate = moment(new Date(`${req.query.ToDate}-01`));
    var betweenMonths = [];
    if (startDate <= endDate){
        var date = startDate.startOf('month');
        while (date <= endDate.endOf('month')) {
            betweenMonths.push(date.format('MMM-YY'));
            date.add(1,'month');
        }
    }
    var Where = {}
    if(req.query.FromDate){
        Object.assign(Where,{ Month : { $in : betweenMonths} })
    }
    if(req.query.PracticeName){
        var getPracticeCoumns = await Practice.findOne({ PracticeName: JSON.parse(req.query.PracticeName).label}, { PracticeName: 1,_id:1 })
        Object.assign(Where,{ PracticeId : new ObjectID(getPracticeCoumns._id)})
    }
    ARDetails.find(Where).then((result)=>{
     
        res.json({
            Data  : result,
            Result :1
        })
    })
})



router.get('/getPracticeName',  async (req,res)=>{
    var Query='SELECT practice_name FROM charges_view group by practice_name;';
    
    MySqlDb.query(Query, function (err, data, fields) {
        if (err) throw err;
        res.json({
            PracticeData : data
        })
    });
})
module.exports = router;