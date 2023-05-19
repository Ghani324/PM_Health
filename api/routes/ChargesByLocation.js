const express = require('express');
const passport = require('passport');
const router = express.Router();
const moment = require("moment")
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
        PracticeNameList.push("'"+res.label+"'");
    })
    return PracticeNameList;
}

router.get('/getPracticeDashboard',  async (req,res)=>{

    var startDate = moment(new Date(`${req.query.FromDate}-01`));
    var endDate = moment(new Date(`${req.query.ToDate}-01`));
    var betweenMonths = await getMonthYearString(startDate,endDate)
    var PracticeNameList = await getPracticeNameList(req.query.PracticeName ? JSON.parse(req.query.PracticeName) : [])
    
    var Query=`call refresh_charges_view()`;
    
    MySqlDb.query(Query, function (err, Callrefresh_charges_view, fields) {
        if (err) throw err;
        var Query=`call refresh_payments_view()`;
        MySqlDb.query(Query, function (err, Callrefresh_payments_view, fields) {
            if (err) throw err;
           
            if(PracticeNameList.length > 0){
                var Query=`SELECT facility,count(facility) as count FROM charges_by_posted_date where facility in (${PracticeNameList.toString()}) and month_year in (${betweenMonths.toString()}) group by facility`;
            }else {

                var Query=`SELECT facility,count(facility) as count FROM charges_by_posted_date where month_year in (${betweenMonths.toString()}) group by facility`;
                
            }
            MySqlDb.query(Query, function (err, GetCountByPosttedTable, fields) {
                if (err) throw err;

                if(PracticeNameList.length > 0){
                    var Query=`SELECT facility,count(facility) as count,sum(charges) as charges FROM charges_view where facility in (${PracticeNameList.toString()}) and month_year in (${betweenMonths.toString()}) group by facility`;
                }else {

                    var Query=`SELECT facility,count(facility) as count,sum(charges) as charges FROM charges_view where month_year in (${betweenMonths.toString()}) group by facility`;
                    
                }
                MySqlDb.query(Query, function (err, ChargesResult, fields) {
                    if (err) throw err;

                    if(PracticeNameList.length > 0){
                        var Query=`SELECT facility,count(facility) as count,sum(payments) as payments FROM payments_view where facility in (${PracticeNameList.toString()}) and month_year in (${betweenMonths.toString()}) group by facility`;
                    }else {
                        var Query=`SELECT facility,count(facility) as count,sum(payments) as payments FROM payments_view where month_year in (${betweenMonths.toString()}) group by facility`;
                    }
                    
                    MySqlDb.query(Query, function (err, PaymentsResult, fields) {
                        if (err) throw err;
                        res.json({
                            GetCountByPosttedTable : GetCountByPosttedTable,
                            data : ChargesResult,
                            PaymentsResult : PaymentsResult
                        })
                    })
                });
            });
        });
    });
})


router.get('/getLocationName',  async (req,res)=>{
    var Query='SELECT facility FROM charges_view group by facility;';
    
    MySqlDb.query(Query, function (err, data, fields) {
        if (err) throw err;
        res.json({
            PracticeData : data
        })
    });
})
module.exports = router;