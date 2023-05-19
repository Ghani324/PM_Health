const express = require('express')
const router = express.Router()
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

router.get('/getRejectionRate',  async (req,res)=>{
    var RejectionRateChart = [["Month", "Rejection Rate"]]
var RejectionRateTable=[]


    var startDate = moment(new Date(`${req.query.FromDate}-01`));
    var endDate = moment(new Date(`${req.query.ToDate}-01`));
    var betweenMonths = await getMonthYearString(startDate,endDate)
      var PracticeNameList = await getPracticeNameList(req.query.PracticeName ? JSON.parse(req.query.PracticeName) : [])

      var Query=`
      SELECT practice_name,month_year,SUM(trizetto_error_charges) AS Trizetto_Error_Charges,SUM(payer_error_charges) AS Payer_Error_Charges,SUM(trizetto_error_charges)+SUM(payer_error_charges) AS Total_Rejects,SUM(total_charges) AS Total_Charges,
      ROUND((SUM(trizetto_error_charges)+SUM(payer_error_charges))/SUM(total_charges)*100,1) AS Reject_Percentage
      FROM claim_submission_report
      WHERE practice_name IN (${PracticeNameList.toString()}) and month_year in (${betweenMonths.toString()})
      GROUP BY month_year
    `;
    
    await MySqlDb.query(Query, function (err, data,fields) {
        if (err) throw err;
        data.map((_res, ind) => {
            RejectionRateChart.push([
                _res.month_year,
               _res.Reject_Percentage 
            ])
            RejectionRateTable.push({
                "Month_Wise":_res.month_year,
                "Total_Rejects":_res.Total_Rejects,
                "Total_Charges":_res.Total_Charges,
                "Reject_Percentage":_res.Reject_Percentage
            })
    })
    res.json({
        data :RejectionRateChart,
        table:RejectionRateTable
    })
})
})


router.get('/getCleanClaimRatio',  async (req,res)=>{
    var CleanClaimChart = [["Month", "Clean Claim Ratio"]]
var CleanClaimTable=[]


    var startDate = moment(new Date(`${req.query.FromDate}-01`));
    var endDate = moment(new Date(`${req.query.ToDate}-01`));
    var betweenMonths = await getMonthYearString(startDate,endDate)
      var PracticeNameList = await getPracticeNameList(req.query.PracticeName ? JSON.parse(req.query.PracticeName) : [])

      var Query=`
      SELECT practice_name,month_year,SUM(trizetto_error_charges) AS Trizetto_Error_Charges,SUM(payer_error_charges) AS Payer_Error_Charges,SUM(trizetto_error_charges)+SUM(payer_error_charges) AS Total_Rejects,SUM(total_charges) AS Total_Charges,
      (SUM(total_charges)-(SUM(trizetto_error_charges)+SUM(payer_error_charges))) AS Clean_Claim,
      ROUND((SUM(total_charges)-(SUM(trizetto_error_charges)+SUM(payer_error_charges)))/SUM(total_charges)*100,1) AS Clean_Claim_Rate
      FROM claim_submission_report
      WHERE practice_name IN (${PracticeNameList.toString()}) and month_year in (${betweenMonths.toString()})
      GROUP BY month_year
    `;
    
    await MySqlDb.query(Query, function (err, data,fields) {
        if (err) throw err;
 
        data.map((_res, ind) => {
            CleanClaimChart.push([
                _res.month_year,
               _res.Clean_Claim_Rate
            ])
            CleanClaimTable.push({
                "Month_Wise":_res.month_year,
                "Total_Charges":_res.Total_Charges,
                 "Clean_Claim":_res.Clean_Claim,
                "Clean_Claim_Rate":_res.Clean_Claim_Rate
            })
    })
    console.log("CleanClaimChart",CleanClaimChart)
    res.json({
        data :CleanClaimChart,
        table:CleanClaimTable
    })
})
})


router.get('/getDenialRate',  async (req,res)=>{
    var DenialChart = [["Month", "Denial Rate"]]
var DenialTable=[]


    var startDate = moment(new Date(`${req.query.FromDate}-01`));
    var endDate = moment(new Date(`${req.query.ToDate}-01`));
    var betweenMonths = await getMonthYearString(startDate,endDate)
      var PracticeNameList = await getPracticeNameList(req.query.PracticeName ? JSON.parse(req.query.PracticeName) : [])

      var Query=`
      SELECT c.month_year,SUM(c.total_charges) AS Total_Charges,SUM(d.balance) AS Denial_Charges,ROUND((SUM(d.balance)/SUM(c.total_charges))*100,1)  AS Denial_Rate
FROM claim_submission_report c
JOIN denial_report d
ON c.practice_id=d.practice_id
WHERE d.practice_name IN (${PracticeNameList.toString()}) and c.month_year in (${betweenMonths.toString()})
GROUP BY c.month_year
    `;
    
    await MySqlDb.query(Query, function (err, data,fields) {
        if (err) throw err;
 
        data.map((_res, ind) => {
            DenialChart.push([
                _res.month_year,
               _res.Denial_Rate
            ])
            DenialTable.push({
                "Month_Wise":_res.month_year,
                "Total_Charges":_res.Total_Charges,
                 "Denial_Charges":_res.Denial_Charges,
                "Denial_Rate":_res.Denial_Rate
            })
    })
    res.json({
        data :DenialChart,
        table:DenialTable
    })
})
})


router.get('/getBenchMark',  async (req,res)=>{
var BenchMarkTable=[]
var BenchMarkChart=[['Month', 'Charge Lag', 'NCR', 'Denial Rate',"Clean Claim Rate","AR Days Above 90","AR Days Above 120","GCR"]]
    var startDate = moment(new Date(`${req.query.ChooseDate}-01`));
    // var endDate = moment(new Date(`${req.query.ToDate}-01`));
    var betweenMonths = [];
    if (startDate){
        var date = startDate.startOf('month');
        betweenMonths.push(date.format('MMM-YY'));
     date.add(1,'month');
    }
 
    var Where = {}
    if(req.query.ChooseDate){
        Object.assign(Where,{ Month : { $in : betweenMonths} })
    }
    if(req.query.PracticeName){
        var getPracticeCoumns = await Practice.findOne({ PracticeName: JSON.parse(req.query.PracticeName).label}, { PracticeName: 1,_id:1 })
        Object.assign(Where,{ PracticeId : new ObjectID(getPracticeCoumns._id)})
    }


    var ArData  = await ARDetails.find(Where)
    var AgeArDetails=await ARDetails.find(Where)
  

    var TotalAmount120=0;
var TotalAmount90=0;
var TotalAmount=0;

      const filteredValues=AgeArDetails.map((res,ind)=>{
   
            if( res.Aging==="Above 120"){
 
                 TotalAmount120+=Number(res.TouchedAmount)+Number(res.UnTouchedAmount)
                 
            }
            if( res.Aging==="90-120" ){
                 TotalAmount90+=Number(res.TouchedAmount)+Number(res.UnTouchedAmount)
               
            }
            if(res.Aging!=="Above 120" && res.Aging!=="90-120"){
                TotalAmount+=Number(res.TouchedAmount)+Number(res.UnTouchedAmount)
            }
    })

    var FinalTotalAmount120=TotalAmount120
    var FinalTotalAmount90=TotalAmount90+TotalAmount120
    var FinalTotalAmount=TotalAmount+FinalTotalAmount120+FinalTotalAmount90
    
var Final120Rate=Math.round((FinalTotalAmount120/FinalTotalAmount)*100)
var Final90Rate=Math.round((FinalTotalAmount90/FinalTotalAmount)*100)

    var ARGroupData = [];
    await ArData.reduce(function(res, value) {
        if (!res[value.Month]) {
            res[value.Month] = { Month: value.Month, TouchedAmount: 0 };
            ARGroupData.push(res[value.Month])
        }
        res[value.Month].TouchedAmount += (Number(value.TouchedAmount) + Number(value.UnTouchedAmount));
        return res;
    }, {});


    var startDate = moment(new Date(`${req.query.ChooseDate}-01`));
    // var endDate = moment(new Date(`${req.query.ToDate}-01`));
    // var betweenMonths = await getMonthYearString(startDate,endDate)
    var PracticeNameList = await getPracticeNameList(req.query.PracticeName ? [JSON.parse(req.query.PracticeName)] : [])
    var Query="";
  var QueryDC=""
var QueryNCR=""
var QueryGCRPay=''
var QueryGCRChar=''
    if(PracticeNameList.length > 0){
        Query=`SELECT month_year as Month,(sum(billed_amount) / 22) as billed_amount FROM charges_by_posted_date where practice_name in (${PracticeNameList.toString()}) and month_year ='${betweenMonths}' group by month_year`;

        QueryDC=`
        SELECT c.month_year,ROUND((SUM(c.total_charges)-(SUM(c.trizetto_error_charges)+SUM(c.payer_error_charges)))/SUM(c.total_charges)*100,1) AS Clean_Claim_Rate,ROUND((SUM(d.balance)/SUM(c.total_charges))*100,1)  AS Denial_Rate
FROM claim_submission_report AS c
JOIN denial_report AS d
ON c.practice_id=d.practice_id
WHERE c.practice_name in (${PracticeNameList.toString()}) AND c.month_year ='${betweenMonths}'
GROUP BY c.month_year
        `;

        QueryNCR=`SELECT month_year,sum(total_paid) as total_paid,sum(adjustments) as adjustments FROM payment_adj where practice_name in (${PracticeNameList.toString()}) and 
        month_year ='${betweenMonths}'
        group by month_year`;

        QueryGCRPay=`
        SELECT month_year,sum(total_paid) as Total_Paid
 FROM payment_adj 
 where practice_name in (${PracticeNameList.toString()}) AND month_year ='${betweenMonths}'
 group by month_year
        `;
        QueryGCRChar=`
        SELECT month_year,sum(billed_amount) as Billed_amount
 FROM charges_by_posted_date 
 where practice_name in (${PracticeNameList.toString()}) AND month_year ='${betweenMonths}'
 group by month_year
        `

    }
    
    // else {

    //     Query=`SELECT month_year as Month,(sum(billed_amount) / 22)  as billed_amount FROM charges_by_posted_date where month_year in (${startDate.toString()}) group by month_year`;
    // }
var FinalCharges;
var FinalChargesAR;
var TotalGCR;

    MySqlDb.query(Query, function (err, GetCountByPosttedTable, fields) {
        if(err) throw err;

        GetCountByPosttedTable.map((res, _inde) => {
            const FilterDataCountClaims = ARGroupData.filter((x)=> x.Month == res.Month)
          
            if(FilterDataCountClaims.length > 0){
               FinalChargesAR = FilterDataCountClaims[0].TouchedAmount / res.billed_amount
        
            }
          })
  
    MySqlDb.query(QueryNCR, function (err, GetDataQueryNCR, fields) {
        if(err) throw err;

        GetDataQueryNCR.map((res, _inde) => {
            var TotalCharges = Number(Number(res.total_paid) + Number(res.adjustments))
             FinalCharges = res.total_paid / (TotalCharges) * 100
           
        })
        MySqlDb.query(QueryGCRPay, function (err, GetQueryGCRPay, fields) {
            if(err) throw err;
           
            MySqlDb.query(QueryGCRChar, function (err, GetQueryGCRChar, fields) {
                if(err) throw err;
   
                const mergedArray = [GetQueryGCRPay, GetQueryGCRChar].reduce((result, arr) => {
                    arr.forEach((obj) => {
                      if (Object.keys(obj).length !== 0) {
                        const matchingObj = result.find((item) => item.month_year === obj.month_year)
                        if (matchingObj) {
                          Object.assign(matchingObj, obj)
                        } else {
                          result.push({...obj})
                        }
                      }
                    })
                    return result
                  }, [])

const GCR=mergedArray.map((res,ind)=>{
if(Number(res.Total_Paid) >0 && Number(res.Billed_amount)>0){
 TotalGCR= Math.round((Number(res.Total_Paid)/Number(res.Billed_amount))*100)
}
})

        MySqlDb.query(QueryDC, function (err, GetDataQueryDC, fields) {
            if(err) throw err;


           
            GetDataQueryDC.map((_res, ind) => {
            BenchMarkTable.push({
                "Month_Wise":_res.month_year,
                "Clean_Claim_Rate":_res.Clean_Claim_Rate,
                "Denial_Rate":_res.Denial_Rate,
                NcrData:Math.round(FinalCharges),
                ArDataDemo:Math.round(FinalChargesAR),
                Final120Rate:Final120Rate,
                Final90Rate:Final90Rate,
                TotalGCR:TotalGCR
            })

            BenchMarkChart.push([
                _res.month_year,
                Math.round(FinalChargesAR),
                Math.round(FinalCharges),
                _res.Denial_Rate,
                _res.Clean_Claim_Rate,
                Final120Rate,
                Final90Rate,
                TotalGCR

            ])
    })

            res.json({
                BenchMarkTable:BenchMarkTable,
                BenchMarkChart:BenchMarkChart
            })

        })
        
    });
});
    })
})
        
})






module.exports=router