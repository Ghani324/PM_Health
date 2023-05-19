var port = process.env.PORT || 5000;
var cCPUs = require('os').cpus().length;
const cluster = require("cluster");
const { Router } = require("express");
const express = require('express');
const jwt = require("jsonwebtoken");
const router = express.Router();
const passport = require('passport');
const CLIENT_HOME_PAGE_URL = "http://localhost:5000/auth";
const authCheck = require("../Config/auth")
// Import the middleware near the top of the file
const { validateAuth } = require('../Config/auth')
const AwsConfig = require("../Config/AwsConfig")
const Users = require("../models/Users");
const Roles = require("../models/Roles")
const Claim_Master = require("../models/ClaimMaster")
const UserDatatableColumns = require("../models/UserDatatableColumns")
const PmSystem = require("../models/PmSystem")
const Practice = require("../models/Practice")
const ClaimStatusUpdate = require("../models/ClaimStatusUpdate")
const LoginLog = require("../models/LoginLog")
const RoleList = require("../models/RoleList")
const excel = require("exceljs");
const bcrypt = require("bcrypt")
var ObjectID = require('mongodb').ObjectID;
const axios = require("axios");
const saltRounds = 10;
const secretOrKey = require('../Config/dbconfig').secretOrKey;
const moment = require("moment-timezone");
moment.tz.setDefault("America/florida");
const multer = require("multer");
const jwt_decode = require('jwt-decode');
const StatusCodes = ["Open", "Fresh-Call", "RECBILL", "HOLD", "Auto Open","CALL",'RECALL','MRV']
/**
 * Aws Cognito
 * 
 * 
 */

// const crypto = require('crypto');

// const clientSecret = '1s8sie9kjmqecr150qg156gnhsagg1e9uijq487o22m4abahi280';
// const clientId = '7ohqndqn009ji68f4k698g0crn';

// const hash = crypto.createHmac('sha256', clientSecret)
//     .update(clientId)
//     .digest('base64');
// console.log("hash",hash)
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

const poolData = {
    UserPoolId: AwsConfig.cognitoUserPoolId, // Your user pool id here    
    ClientId: AwsConfig.ClientId, // Your client id here
    clientSecret: AwsConfig.clientSecret
};


/**
 * 
 * Aws Cognito End
*/

router.get("/InsertRolesList", (req, res) => {


    var RolesListData = [
        {
            label: "User Management",
            value: "UserManagement",
            AttributesList: [{
                label: "Yes",
                value: true
            }, {
                label: "No",
                value: false
            }]
        },
        {
            label: "Upload Claims",
            value: "UploadClaims",
            AttributesList: [{
                label: "Yes",
                value: true
            }, {
                label: "No",
                value: false
            }]
        },
        {
            label: "View Claims",
            value: "ViewClaims",
            AttributesList: [{
                label: "Yes",
                value: true
            }, {
                label: "No",
                value: false
            }]
        },
        {
            label: "View My Claims",
            value: "ViewMyClaims",
            AttributesList: [{
                label: "Yes",
                value: true
            }, {
                label: "No",
                value: false
            }]
        },
        {
            label: "Add New PM",
            value: "AddNewPM",
            AttributesList: [{
                label: "Yes",
                value: true
            }, {
                label: "No",
                value: false
            }]
        },
        {
            label: "Add New Practice",
            value: "AddNewPractice",
            AttributesList: [{
                label: "Yes",
                value: true
            }, {
                label: "No",
                value: false
            }]
        },
        {
            label: "AR Comment History",
            value: "ARCommentHistory",
            AttributesList: [{
                label: "Edit / Delete within 8 Hours",
                value: true
            }, {
                label: "Edit/Delete Anytime",
                value: false
            }]

        },
        {
            label: "Assign Claim",
            value: "AssignClaim",
            AttributesList: [{
                label: "Yes",
                value: true
            }, {
                label: "No",
                value: false
            }]
        },
        {
            label: "Report  PCA",
            value: "ReportPCA",
            AttributesList: [{
                label: "Yes",
                value: true
            }, {
                label: "No",
                value: false
            }]
        },
        {
            label: "Report  Call time Report",
            value: "ReportCTR",
            AttributesList: [{
                label: "Yes",
                value: true
            }, {
                label: "No",
                value: false
            }]
        },
        {
            label: "Report  Team Productivity Dashboard",
            value: "ReportTPD",
            AttributesList: [{
                label: "Yes",
                value: true
            }, {
                label: "No",
                value: false
            }]
        },
        {
            label: "Bot / API Claim Status check",
            value: "BotCSC",
            AttributesList: [{
                label: "Yes",
                value: true
            }, {
                label: "No",
                value: false
            }]
        },
    ]
    RoleList.insertMany(RolesListData).then((getData) => {
        res.json({
            data: getData,
            Result: true,
        })
    })
})

router.get("/GetAnalystList",passport.authenticate("jwt",{session:false}),async(req,res)=>{

    var RolesIds = await Roles.find({ role_name: { $in: ["AR-Analyst"] } })
    var rolesIDsData = []
    RolesIds.map((resss, ind) => {
        rolesIDsData.push(new ObjectID(resss._id))
    })
    async function getChildReportingManagers(userId) {
        const user = await Users.findById(userId);
        const childManagers = await Users.find({ _id: user.ReportingManager});
        const results = [];
        
        for (const childManager of childManagers) {
            console.log("childManager.RoleName",childManager.RoleName)
            if(rolesIDsData.includes(childManager.RoleName)){
                const childReportingManagers = await getChildReportingManagers(childManager._id);
                results.push(...childReportingManagers, childManager);
            }
          
        }
        return results;
    }
    var Data  = await getChildReportingManagers(req.user._id)
    res.json(Data)
})
router.get("/getPermissionRoleList", passport.authenticate("jwt", { session: false }), (req, res) => {
    RoleList.find().then((getData) => {
        res.json({
            data: getData,
            Result: true,
        })
    })

})
router.get("/login/success", (req, res) => {
    if (req.user) {
        res.json({
            success: true,
            message: "user has successfully authenticated",
            user: req.user,
            cookies: req.cookies
        });
    }
});

// when login failed, send failed msg
router.get("/login/failed", (req, res) => {
    res.status(401).json({
        success: false,
        message: "user failed to authenticate."
    });
});
const url = require('url');
router.get("/signOut", passport.authenticate("jwt", { session: false }), async (req, res) => {

    const cognitoDomain = 'scio.auth.ap-northeast-1.amazoncognito.com';
    const appClientId = '7ohqndqn009ji68f4k698g0crn';
    const logoutUri = 'http://localhost:3011/users/logout'; // Replace with the URL of your logged-out page
    const logoutUrl = `https://${cognitoDomain}/logout?client_id=${appClientId}&logout_uri=${encodeURIComponent(logoutUri)}`;

    const response = await axios.get(logoutUrl);
    const str = response.json();
    console.log("str", str)
    res.redirect("/Logout")
    // // Use the logout URL to redirect the user to the logout page
    // window.location.href = logoutUrl;

    // res.redirect(url.format({
    //     pathname: `https://${cognitoDomain}/logout`,
    //     query: {
    //         "client_id": appClientId,
    //         "logout_uri": encodeURIComponent(logoutUri)
    //     }
    // }));

});
// When logout, redirect to client
router.get("/logout", passport.authenticate("jwt", { session: false }), async (req, res) => {


});


// auth with oauth2
router.get("/oauth2", passport.authenticate("oauth2"));

// redirect to home page after successfully login via oauth2
router.get("/redirect", async (req, res) => {

    console.log("req", req.user)

});
router.post('/Userss', async (req, res) => {

    const RoleData = {
        UserName: req.body.UserName,
        RoleName: req.body.RoleName,
        Prefix: req.body.Prefix,
        ReportingManager: req.body.ReportingManager,
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        pm_system: req.body.pm_system,
        practice_name: req.body.practice_name,
        Contact: req.body.Contact,
        CreatedBy: req.user._id,

    };
    new Users(RoleData).save().then((Usersdata) => {
        res.status(200).json({
            Response: true,
            Message: "User Created Successfully... !",
            Data: Usersdata
        });
    }).catch((errResponse) => {

        res.status(400).json({
            Response: false,
            Message: "Catch Error",
            Data: errResponse
        });
    });

})
// router.post('/User', passport.authenticate("jwt", { session: false }), async (req,res)=>{
//     const PostData = {
//         UserName: req.body.UserName,
//         RoleName: req.body.RoleName,
//         Prefix: req.body.Prefix,
//         ReportingManager: req.body.ReportingManager,
//         FirstName: req.body.FirstName,
//         LastName: req.body.LastName,
//         PmId : req.body.PmId,
//         PracticeId: req.body.PracticeId,
//         Contact: req.body.Contact,
//         CreatedBy : req.user._id,
//     }

//     const PMSystemdata = await new Users(PostData).save()
//     if(PMSystemdata){
//         res.status(200).json({
//             Response : true,
//             Message : "User posted successfully",
//             Data : PMSystemdata
//         })
//     }else {
//         res.status(404).json({
//             Response : false,
//             Message : "Something went wrong",
//             Data : PMSystemdata
//         })
//     }
// })
//passport.authenticate('jwt', { session: false }),
router.post('/createUsers', async (req, res) => {

    const postuserData = {
        UserName: req.body.UserName,
        Prefix: req.body.Prefix,
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        EmailId: req.body.EmailId,
        Password: req.body.Password,
        Status: req.body.Status,
        CreatedBy: req.body.CreatedBy,
        UpdatedBy: req.body.UpdatedBy,
        ContactNumber: req.body.ContactNumber
    };


    // var attributeList = [];
    // attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"name",Value:"Prasad Jayashanka"}));
    // attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"preferred_username",Value:"jay"}));
    // attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"gender",Value:"male"}));
    // attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"birthdate",Value:"1991-06-21"}));
    // attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"address",Value:"CMB"}));
    // attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"email",Value:"sampleEmail@gmail.com"}));
    // attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"phone_number",Value:"+5412614324321"}));
    // attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"custom:scope",Value:"admin"}));


    // userpool.RegisterUser(config.userPoolId, config.clientId, config.username, config.password, config.attributes, 
    //     function(cognitoUser) {
    //         console.log('User name is ' + cognitoUser.getUsername());
    //     },
    //     function(err) {
    //         console.log('Sing up error: ', err);
    //     });

    // userPool.signUp('sampleEmail@gmail.com', 'SamplePassword123', attributeList, null, function(err, result){
    //     if (err) {
    //         console.log(err);
    //         return;
    //     }
    //     cognitoUser = result.user;
    //     console.log("cognitoUser",cognitoUser)
    //     console.log('user name is ' + cognitoUser.getUsername());
    // });


    var attributeList = [];
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "name", Value: req.body.UserName }));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "preferred_username", Value: req.body.FirstName + "-" + req.body.LastName }));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "email", Value: req.body.EmailId }));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "phone_number", Value: req.body.ContactNumber }));
    //attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"custom:scope",Value:"admin"}));

    userPool.signUp(req.body.EmailId, req.body.Password, attributeList, null, function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        cognitoUser = result.user;
        console.log("cognitoUser", cognitoUser)
        console.log('user name is ' + cognitoUser.getUsername());
    });

    bcrypt.genSalt(saltRounds).then(salt => {
        return bcrypt.hash(postuserData.Password, salt)
    }).then(hash => {

        postuserData.Password = hash
        new Users(postuserData).save().then((Usersdata) => {
            res.status(200).json({
                Response: true,
                Message: "User Created Successfully... !",
                Data: Usersdata
            });
        }).catch((errResponse) => {

            res.status(400).json({
                Response: false,
                Message: "Catch Error",
                Data: errResponse
            });
        });

    }).catch((err) => {
        res.status(400).json({
            Response: false,
            Message: "Catch Error",
            Data: err
        });
    })

})

router.get('/getUsers', passport.authenticate("jwt", { session: false }), (req, res) => {

    Users.find().then((ResponseData) => {
        res.json({
            Response: true,
            Message: "Total Records",
            Data: ResponseData

        })
    })
})
router.get('/getUsersList', passport.authenticate("jwt", { session: false }), async (req, res) => {

    // var RolesIds = await Roles.find({ role_name: { $nin: ["Assistant Manager", "Manager", "DOO", "AVP", "CEO","admin"] } })
    // var rolesIDsData = []
    // RolesIds.map((resss, ind) => {
    //     rolesIDsData.push(new ObjectID(resss._id))
    // })
    var Where = { 'Status.isDeleted': false }
    //Object.assign(Where,{ RoleName: { $in: rolesIDsData } })
    Users.find(Where).then((ResponseData) => {
        res.json({
            data: ResponseData
        })
    })

})
router.get('/getManagersList', passport.authenticate("jwt", { session: false }), async (req, res) => {
    var Where = { 'Status.isDeleted': false }

    var RolesIds = await Roles.find({ role_name: { $in: ["Assistant-Manager", "Manager", "DOO", "AVP", "CEO", "admin", "AR-Analyst"] } })
    var rolesIDsData = []
    RolesIds.map((resss, ind) => {
        rolesIDsData.push(new ObjectID(resss._id))
    })
    var Where = { RoleName: { $in: rolesIDsData } }

    if (req.user.RoleType == "Manager" || req.user.RoleType == "AR-Analyst" || req.user.RoleType == "Assistant-Manager") {

        var Userdata = await Users.findOne({ _id: new ObjectID(req.user._id) })
        res.json({
            data: [Userdata]
        })
    } else {
        Users.find(Where).then((ResponseData) => {
            res.json({
                data: ResponseData
            })
        })
    }
})
router.post('/getUserListById', passport.authenticate("jwt", { session: false }), async (req, res) => {

    var Where = { ReportingManager: new ObjectID(req.body.ReportingManagerId) }
    Users.find(Where).then((ResponseData) => {
        res.json({
            data: ResponseData
        })
    })

})
var ProjectColumns = {

    Location: "$Location",
    MemberId: "$MemberId",
    PayerMix: "$PayerMix",
    IntialClaimDate: "$IntialClaimDate",
    ClaimAdjustemnt: "$ClaimAdjustemnt",
    Stage: "$Stage",
    RoleResponsibilityCategory: "$RoleResponsibilityCategory",
    DenialReason: "$DenialReason",
    ServiceType: "$ServiceType",
    Modifier: "$Modifier",
    ProcedureCode: "$ProcedureCode",
    FacilityName: "$FacilityName",
    PayerResponsibility: "$PayerResponsibility",
    Indication: "$Indication",
    ProcedureBalance: "$ProcedureBalance",
    FiledStatus: "$FiledStatus",
    PatientDOB: "$PatientDOB",
    AdjustmentReason: "$AdjustmentReason",
    CompanyName: "$CompanyName",
    OrginalICN: "$OrginalICN",
    Diagnosis: "$Diagnosis",
    SecondaryInsuranceCompany: "$SecondaryInsuranceCompany",
    DOE: "$DOE",
    Unit: "$Unit",
    ProcedureBilledAmount: "$ProcedureBilledAmount",
    ProcedurePayment: "$ProcedurePayment",
    ProcedureAdjustment: "$ProcedureAdjustment",
    Aging: {
        $round: { $divide: [{ $subtract: [new Date(), '$DateOfService'] }, 86400000] }
    },
    SystemStatus: '$SystemStatus',
    DueDate: '$DueDate',
    Comments: '$Comments',
    Bill: '$Bill',
    DateOfService: '$DateOfService',
    PatientName: '$PatientName',
    PayerName: '$PayerName',
    ClaimStatus: '$ClaimStatus',
    ClaimBilledAmount: '$ClaimBilledAmount',
    ClaimPayment: '$ClaimPayment',
    ClaimBalance: '$ClaimBalance',
    Account: '$Account',
    ProviderName: '$ProviderName',
    //PracticeId: '$PracticeId',
    Priority: '$Priority',
    //updatedAt: "$updatedAt",
}
Object.assign(ProjectColumns, { FirstName: '$FirstName', LastName: '$LastName' })

router.get('/AnalystProductivityDownloadDashboard', passport.authenticate("jwt", { session: false }), async (req, res) => {
    var UserId = new ObjectID(req.user._id)

    var PracticeId = JSON.parse(req.query.PracticeId)
    var PracticeIdsList = []
    PracticeId.map((getPracticeId, index) => {
        PracticeIdsList.push(new ObjectID(getPracticeId.value))
    })
    var TotalNoOfOpenClaims = {
        PracticeId: { $in: PracticeIdsList },
        SystemStatus: { $nin: ["Auto Close", "AC"] }
    }
    var QueryStatusUpdate = { UserId: UserId }
    if (req.query.FromDate && req.query.ToDate) {
        const endDate = new Date(req.query.ToDate);
        endDate.setUTCHours(23, 59, 59);
        var Query = {
            createdAt: { $gte: new Date(req.query.FromDate), $lte: new Date(endDate.toString()) }
        }
        Object.assign(QueryStatusUpdate, Query)
    }

    var ClaimStatusIds = await ClaimStatusUpdate.find(QueryStatusUpdate)
    if (ClaimStatusIds.length > 0) {

    } else {

    }
    var ClaimIDs = []

    var TotalNoOfWorkedClaims = {
        PracticeId: { $in: PracticeIdsList },
        SystemStatus: { $nin: ["Auto Close", "AC"] },
    }
    ClaimStatusIds.map((ress, ind) => {
        ClaimIDs.push(new ObjectID(ress.ClaimId))
        if (ind == ClaimStatusIds.length - 1) {
            Object.assign(TotalNoOfWorkedClaims, { _id: { $in: ClaimIDs } })
        }
    })
    var GetSelectedColumns = await UserDatatableColumns.findOne({
        UserId: new ObjectID(req.user._id),
        PageType: "ViewClaims"
    })
    var ProjectSelectedColumns = {}
    var ExcelColumns = []
    if (GetSelectedColumns) {
        GetSelectedColumns.Columns.map((dd, i) => {
            if (Boolean(dd.value)) {
                var headerLabel = dd.label
                if (dd.label == "updatedAt") {
                    headerLabel = "Last Worked Date"
                } else if (dd.label == "FirstName") {
                    headerLabel = "Update By"
                }
                ExcelColumns.push({ header: headerLabel, key: dd.label, width: 20 })
                if (dd.label == "updatedAt") {
                    Object.assign(ProjectSelectedColumns, { [dd.label]: { $dateToString: { format: "%Y-%m-%d", date: "$LastWorkingDate" } } })
                } else if (dd.label == "Aging") {
                    Object.assign(ProjectSelectedColumns, {
                        [dd.label]: {
                            $round: { $divide: [{ $subtract: [new Date(), '$DateOfService'] }, 86400000] }
                        }
                    })
                } else {
                    Object.assign(ProjectSelectedColumns, { [dd.label]: `$${dd.label}` })
                }
            }
        })
    }
    var TotalNoOfWorkedClaimsData = await Claim_Master.aggregate([
        {
            $match: TotalNoOfWorkedClaims
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
            $project: ProjectSelectedColumns
        },
    ])
    let workbook = new excel.Workbook();

    let worksheet = workbook.addWorksheet(`Overall Performance Dashboard-${moment("MM-DD-YYYY")}`);
    worksheet.columns = ExcelColumns
    // Add Array Rows
    worksheet.addRows(TotalNoOfWorkedClaimsData);
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
async function AgeingWiseQueryExecute(QueryParms, Query) {

    var AgeingWiseDataQuery = [
        QueryParms,
        {
            $project: {
                "Aging": {
                    $round: { $divide: [{ $subtract: [new Date(), '$DateOfService'] }, 86400000] }
                },
                ClaimBalance: '$ClaimBalance',
            }
        },
        {
            $match: { "Aging": Query }
        },
        { $sort: { TotalAmount: -1 } },
        { $limit: 10 }
    ]

    var AgeingWiseData = await Claim_Master.aggregate(AgeingWiseDataQuery)
    return AgeingWiseData;
}
Array.prototype.sum = function (prop) {
    var total = 0
    for (var i = 0, _len = this.length; i < _len; i++) {
        total += Number(this[i][prop])
    }
    return total
}



router.get('/PracticewiseDownloadDashboard', passport.authenticate("jwt", { session: false }), async (req, res) => {

    var PracticeId = JSON.parse(req.query.PracticeId)
    var PracticeIdsList = []
    PracticeId.map((getPracticeId, index) => {
        PracticeIdsList.push(new ObjectID(getPracticeId.value))
    })

    var TotalNoOfWorkedClaims = {
        PracticeId: { $in: PracticeIdsList },
        SystemStatus: { $nin: ["Auto Close", "AC"] },
    }

    var GetSelectedColumns = await UserDatatableColumns.findOne({
        UserId: new ObjectID(req.user._id),
        PageType: "ViewClaims"
    })
    var ProjectSelectedColumns = {}
    var ExcelColumns = []
    if (GetSelectedColumns) {
        GetSelectedColumns.Columns.map((dd, i) => {
            if (Boolean(dd.value)) {
                var headerLabel = dd.label
                if (dd.label == "updatedAt") {
                    headerLabel = "Last Worked Date"
                } else if (dd.label == "FirstName") {
                    headerLabel = "Update By"
                }
                ExcelColumns.push({ header: headerLabel, key: dd.label, width: 20 })
                if (dd.label == "updatedAt") {
                    Object.assign(ProjectSelectedColumns, { [dd.label]: { $dateToString: { format: "%Y-%m-%d", date: "$LastWorkingDate" } } })
                } else if (dd.label == "Aging") {
                    Object.assign(ProjectSelectedColumns, {
                        [dd.label]: {
                            $round: { $divide: [{ $subtract: [new Date(), '$DateOfService'] }, 86400000] }
                        }
                    })
                } else {
                    Object.assign(ProjectSelectedColumns, { [dd.label]: `$${dd.label}` })
                }
            }
        })
    }

    var TotalNoOfWorkedClaimsData = await Claim_Master.aggregate([
        {
            $match: TotalNoOfWorkedClaims
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
            $project: ProjectSelectedColumns
        },
    ])
    let workbook = new excel.Workbook();

    let worksheet = workbook.addWorksheet(`Practice Dashboard-${moment("MM-DD-YYYY")}`);
    worksheet.columns = ExcelColumns
    // Add Array Rows
    worksheet.addRows(TotalNoOfWorkedClaimsData);
    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + `PracticeDashboard-${moment().format("YYYYMMDDhms")}.xlsx`
    );
    return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
    });
})
router.get('/getPracticewiseDashboard',passport.authenticate('jwt', {session: false}),async (req, res) => {
      var AgeingWiseTableData = []
      var PayerNameTableData = []
      var ProviderNameWiseTableData = []
      var StatusWiseTableData = []
      var RootCauseTableData = []
  
      var AgeingWiseChartData = [['Aging Wise', 'Claim Balance']]
      var AgeingWiseChartDataForClaim = [['Aging Wise', 'No of Claims']]
      var PayerNameData = [['Payer Wise', 'Claim Balance']]
      var ProviderNameWiseData = [['Provider Wise', 'Claim Balance']]
      var ProviderNameWiseForClaim = [['Provider Wise', 'No of Claims']]
      var StatusWiseData = [['Status Wise', 'Claim Balance']]
      var StatusWiseDataForClaim = [['Status Wise', 'No of Claims']]
      var RootCauseData = [['RootCause Wise', 'Claim Balance']]
      var RootCauseDataForClaim = [['RootCause Wise', 'No of Claims']]
      var PayerNameDataForClaim = [['Payer Wise', 'No of claims']]
  
      var UserId = new ObjectID(req.user._id)
      var PracticeId = JSON.parse(req.query.PracticeId)
  
      const radio = req.query.radio
  
      var PracticeIdsList = []
      PracticeId.map((getPracticeId, index) => {
        PracticeIdsList.push(new ObjectID(getPracticeId.value))
      })
  
      var QueryParms = {
        $match: {
          PracticeId: {$in: PracticeIdsList},
          SystemStatus: {$nin: ['Auto Close', 'AC']},
        },
      }
      if (radio === 'PAYER WISE') {
        var UserListAging = await Claim_Master.aggregate([
          QueryParms,
          {
            $project: {
              Aging: {
                $round: {$divide: [{$subtract: [new Date(), '$DateOfService']}, 86400000]},
              },
              PayerName: '$PayerName',
              ClaimBalance: '$ClaimBalance',
            },
          },
          {
            $match: {Aging: {$nin: [null]}},
          },
        ])
  
        var days60 = UserListAging.reduce(function (sum, dataGet) {
          if (dataGet.Aging >= 0 && dataGet.Aging <= 60) {
            const {PayerName, ClaimBalance} = dataGet
            if (!sum[PayerName]) {
              sum[PayerName] = {PayerName, TotalAmount60: 0, Count60: 0}
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
            const {PayerName, ClaimBalance} = dataGet
            if (!sum[PayerName]) {
              sum[PayerName] = {PayerName, TotalAmount120: 0, Count120: 0}
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
            const {PayerName, ClaimBalance} = dataGet
            if (!sum[PayerName]) {
              sum[PayerName] = {PayerName, TotalAmount120plus: 0, Count120plus: 0}
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
            if(!obj.TotalAmount120plus) obj.TotalAmount120plus=0.0
            if(!obj.Count120plus) obj.Count120plus=0
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
          PayerNameData.push([res.PayerName, res.TotalAmount])
          PayerNameDataForClaim.push([res.PayerName, res.Count])
          PayerNameTableData.push({
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
        //sort
        const sortPayerNameData=PayerNameData.sort((a,b)=>b[1]-a[1])
    const sortPayerNameDataForClaim=PayerNameDataForClaim.sort((a,b)=>b[1]-a[1])
    const sortPayerNameTableData=PayerNameTableData.sort((a,b)=>b.TotalAmount120plus-a.TotalAmount120plus)
  
        return res.json({
          Result: true,
          Message: '',
          PayerNameData: sortPayerNameData.slice(0, 10),
          PayerNameDataForClaim: sortPayerNameDataForClaim.slice(0, 10),
          PayerNameDataTable: sortPayerNameTableData,
          Radio: radio,
        })
      }
  
      if (radio === 'ROOTCAUSE WISE') {
        var UserListAging = await Claim_Master.aggregate([
          QueryParms,
          {
            $project: {
              Aging: {
                $round: {$divide: [{$subtract: [new Date(), '$DateOfService']}, 86400000]},
              },
              RootCause: '$RootCause',
              ClaimBalance: '$ClaimBalance',
            },
          },
          {
            $match: {Aging: {$nin: [null]}},
          },
        ])
  
        var days60 = UserListAging.reduce(function (sum, dataGet) {
          if (dataGet.Aging >= 0 && dataGet.Aging <= 60) {
            const {RootCause, ClaimBalance} = dataGet
            if (!sum[RootCause]) {
              sum[RootCause] = {RootCause, TotalAmount60: 0, Count60: 0}
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
            const {RootCause, ClaimBalance} = dataGet
            if (!sum[RootCause]) {
              sum[RootCause] = {RootCause, TotalAmount120: 0, Count120: 0}
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
            const {RootCause, ClaimBalance} = dataGet
            if (!sum[RootCause]) {
              sum[RootCause] = {RootCause, TotalAmount120plus: 0, Count120plus: 0}
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
            if(!obj.TotalAmount120plus) obj.TotalAmount120plus=0.0
            if(!obj.Count120plus) obj.Count120plus=0
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
          RootCauseData.push([res.RootCause, res.TotalAmount])
          RootCauseDataForClaim.push([res.RootCause, res.Count])
          RootCauseTableData.push({
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
  
        const sortRootCauseData=RootCauseData.sort((a,b)=>b[1]-a[1])
        const sortRootCauseDataForClaim=RootCauseDataForClaim.sort((a,b)=>b[1]-a[1])
        const sortRootCauseTableData=RootCauseTableData.sort((a,b)=>b.TotalAmount120plus-a.TotalAmount120plus)
      
        return res.json({
          Result: true,
          Message: '',
          RootCauseData: sortRootCauseData.slice(0, 10),
          RootCauseDataForClaim: sortRootCauseDataForClaim.slice(0, 10),
          RootCauseTableData: sortRootCauseTableData,
          Radio: radio,
        })
      }
  
      if (radio === 'STATUS WISE') {
        var UserListAging = await Claim_Master.aggregate([
          QueryParms,
          {
            $project: {
              Aging: {
                $round: {$divide: [{$subtract: [new Date(), '$DateOfService']}, 86400000]},
              },
              SystemStatus: '$SystemStatus',
              ClaimBalance: '$ClaimBalance',
            },
          },
          {
            $match: {Aging: {$nin: [null]}},
          },
        ])
  
        var days60 = UserListAging.reduce(function (sum, dataGet) {
          if (dataGet.Aging >= 0 && dataGet.Aging <= 60) {
            const {SystemStatus, ClaimBalance} = dataGet
            if (!sum[SystemStatus]) {
              sum[SystemStatus] = {SystemStatus, TotalAmount60: 0, Count60: 0}
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
            const {SystemStatus, ClaimBalance} = dataGet
            if (!sum[SystemStatus]) {
              sum[SystemStatus] = {SystemStatus, TotalAmount120: 0, Count120: 0}
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
            const {SystemStatus, ClaimBalance} = dataGet
            if (!sum[SystemStatus]) {
              sum[SystemStatus] = {SystemStatus, TotalAmount120plus: 0, Count120plus: 0}
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
             if(!obj.TotalAmount120plus) obj.TotalAmount120plus=0.0
            if(!obj.Count120plus) obj.Count120plus=0
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
          StatusWiseData.push([res.SystemStatus, res.TotalAmount])
          StatusWiseDataForClaim.push([res.SystemStatus, res.Count])
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
  
        const sortStatusWiseData=StatusWiseData.sort((a,b)=>b[1]-a[1])
        const sortStatusWiseDataForClaim=StatusWiseDataForClaim.sort((a,b)=>b[1]-a[1])
        const sortStatusWiseTableData=StatusWiseTableData.sort((a,b)=>b.TotalAmount120plus-a.TotalAmount120plus)
        return res.json({
          Result: true,
          Message: '',
          StatusWise: sortStatusWiseData.slice(0, 10),
          StatusWiseDataForClaim: sortStatusWiseDataForClaim.slice(0, 10),
          StatusWiseTableData: sortStatusWiseTableData,
          Radio: radio,
        })
      }
  
      if (radio === 'PROVIDER WISE') {
        var UserListAging = await Claim_Master.aggregate([
          QueryParms,
          {
            $project: {
              Aging: {
                $round: {$divide: [{$subtract: [new Date(), '$DateOfService']}, 86400000]},
              },
              ProviderName: '$ProviderName',
              ClaimBalance: '$ClaimBalance',
            },
          },
          {
            $match: {Aging: {$nin: [null]}},
          },
        ])
  
        var days60 = UserListAging.reduce(function (sum, dataGet) {
          if (dataGet.Aging >= 0 && dataGet.Aging <= 60) {
            const {ProviderName, ClaimBalance} = dataGet
            if (!sum[ProviderName]) {
              sum[ProviderName] = {ProviderName, TotalAmount60: 0, Count60: 0}
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
            const {ProviderName, ClaimBalance} = dataGet
            if (!sum[ProviderName]) {
              sum[ProviderName] = {ProviderName, TotalAmount120: 0, Count120: 0}
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
            const {ProviderName, ClaimBalance} = dataGet
            if (!sum[ProviderName]) {
              sum[ProviderName] = {ProviderName, TotalAmount120plus: 0, Count120plus: 0}
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
            if(!obj.TotalAmount120plus) obj.TotalAmount120plus=0.0
            if(!obj.Count120plus) obj.Count120plus=0
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
          ProviderNameWiseData.push([res.ProviderName, res.TotalAmount])
          ProviderNameWiseForClaim.push([res.ProviderName, res.Count])
          ProviderNameWiseTableData.push({
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
  
        const sortProviderNameWiseData=ProviderNameWiseData.sort((a,b)=>b[1]-a[1])
        const sortProviderNameWiseForClaim=ProviderNameWiseForClaim.sort((a,b)=>b[1]-a[1])
        const sortProviderNameWiseTableData=ProviderNameWiseTableData.sort((a,b)=>b.TotalAmount120plus-a.TotalAmount120plus)
  
        return res.json({
          Result: true,
          Message: '',
          ProviderNameWise: sortProviderNameWiseData.slice(0, 10),
          ProviderNameWiseForClaim: sortProviderNameWiseForClaim.slice(0, 10),
          ProviderNameWiseTableData: sortProviderNameWiseTableData,
          Radio: radio,
        })
      }
  
      var AgeingWiseLoop = [
        {Query: {$lt: 30, $gte: 0}, Label: '0-30'},
        {Query: {$lt: 60, $gte: 30}, Label: '30-60'},
        {Query: {$lt: 90, $gte: 60}, Label: '60-90'},
        {Query: {$lt: 120, $gte: 90}, Label: '120-90'},
        {Query: {$gte: 120}, Label: '120 Above'},
      ]
  
      if (radio === 'AGING WISE') {
        async function AgeingWiseQueryExecute(QueryParms, Query) {
          var AgeingWiseDataQuery = [
            QueryParms,
            {
              $project: {
                Aging: {
                  $round: {$divide: [{$subtract: [new Date(), '$DateOfService']}, 86400000]},
                },
                ClaimBalance: '$ClaimBalance',
              },
            },
            {
              $match: {Aging: Query},
            },
            {$sort: {TotalAmount: -1}},
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
            count: Data.length,
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
})
router.get('/getAnalystProductivityDashboard', passport.authenticate("jwt", { session: false }), async (req, res) => {
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

    var UserId = new ObjectID(req.user._id)
    var radio = req.query.radio
    console.log("radio", radio)
    var PracticeId = JSON.parse(req.query.PracticeId)
    var PracticeIdsList = []
    PracticeId.map((getPracticeId, index) => {
        PracticeIdsList.push(new ObjectID(getPracticeId.value))
    })

    console.log("practicelistids", PracticeIdsList)
    var TotalNoOfOpenClaims = {
        PracticeId: { $in: PracticeIdsList },
        SystemStatus: { $nin: ["Auto Close", "AC"] }
    }
    var QueryStatusUpdate = { UserId: UserId }
    if (req.query.FromDate && req.query.ToDate) {
        const endDate = new Date(req.query.ToDate);
        endDate.setUTCHours(23, 59, 59);
        var Query = {
            createdAt: { $gte: new Date(req.query.FromDate), $lte: new Date(endDate.toString()) }
        }

        Object.assign(QueryStatusUpdate, Query)

    }


    var ClaimStatusIds = await ClaimStatusUpdate.find(QueryStatusUpdate)
    if (ClaimStatusIds.length > 0) {

    } else {

    }
    var ClaimIDs = []

    var TotalNoOfWorkedClaims = {
        PracticeId: { $in: PracticeIdsList },
        SystemStatus: { $nin: ["Auto Close", "AC"] },
    }


    ClaimStatusIds.map((ress, ind) => {
        ClaimIDs.push(new ObjectID(ress.ClaimId))
        if (ind == ClaimStatusIds.length - 1) {
            Object.assign(TotalNoOfWorkedClaims, { _id: { $in: ClaimIDs } })
        }
    })
    console.log("UserId", UserId)
    var ViewAllClaims = await Claim_Master.countDocuments({ AssignTo: new ObjectID(UserId) })
    // var TotalNoOfWorkedClaimsData = await Claim_Master.countDocuments(TotalNoOfWorkedClaims)
    // var PendingData = TotalNoOfOpenClaimsData - TotalNoOfWorkedClaimsData

    // var data = [
    //     ["Status", "Counts"],
    //     ["Pending", PendingData],
    //     ["Worked", TotalNoOfWorkedClaimsData],
    // ];
    // console.log("Data",data)

    var QueryParms = {
        $match: {
            PracticeId: { $in: PracticeIdsList },
            SystemStatus: { $nin: ["Auto Close", "AC"] },
        }
    }
    if (ClaimIDs.length > 0) {
        Object.assign(QueryParms.$match, { _id: { $in: ClaimIDs } })
    }

    //Payer Wise
    if (radio === "PAYER WISE") {
        if (req.query.FromDate && req.query.ToDate) {
            const endDate = new Date(req.query.ToDate);
            endDate.setUTCHours(23, 59, 59);
            var QueryParmsForDate = {
                $match: {
                    createdAt: { $gte: new Date(req.query.FromDate), $lte: new Date(endDate.toString()) },
                    PracticeId: { $in: PracticeIdsList },
                    SystemStatus: { $nin: ["Auto Close", "AC"] },

                }
            }

            var UserListAging = await Claim_Master.aggregate([
                QueryParmsForDate,
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
                }, {
                    "$project": {
                        "PayerName": "$PayerName",
                        "ClaimBalance": "$ClaimBalance",
                        "Aging": "$Aging"
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

            var ClaimBalance60 = payer60.reduce((total, item) => {
                return total + Number(item.TotalAmount60)
            }, 0)


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

            var ClaimBalance120 = payer120.reduce((total, item) => {
                return total + Number(item.TotalAmount120)
            }, 0)


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

            var ClaimBalance120plus = payer120plus.reduce((total, item) => {
                return total + Number(item.TotalAmount120plus)
            }, 0)

            let mergedArray = payer60.reduce((acc, obj1) => {
                let matchingObj2 = payer120.find(obj2 => obj2.PayerName === obj1.PayerName && Object.keys(obj2).length > 0);
                let matchingObj3 = payer120plus.find(obj3 => obj3.PayerName === obj1.PayerName && Object.keys(obj3).length > 0);
                if (matchingObj2 && matchingObj3 && Object.keys(obj1).length > 0) {
                    acc.push(Object.assign({}, obj1, matchingObj2, matchingObj3));
                } else if (Object.keys(obj1).length > 0) {
                    acc.push(obj1);
                }
                return acc;
            }, []);

            let remainingObjects = payer120.filter(obj2 => Object.keys(obj2).length > 0 && !mergedArray.some(obj => obj.PayerName === obj2.PayerName))
                .concat(payer120plus.filter(obj3 => Object.keys(obj3).length > 0 && !mergedArray.some(obj => obj.PayerName === obj3.PayerName)));

            mergedArray = mergedArray.concat(remainingObjects);


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
                {
                    $match: {
                        PracticeId: { $in: PracticeIdsList },
                        SystemStatus: { $nin: ["Auto Close", "AC"] },
                    }
                },
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
                }, {
                    "$project": {
                        "PayerName": "$PayerName",
                        "ClaimBalance": "$ClaimBalance",
                        "Aging": "$Aging"
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

            var ClaimBalance60 = payer60.reduce((total, item) => {
                return total + Number(item.TotalAmount60)
            }, 0)


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

            var ClaimBalance120 = payer120.reduce((total, item) => {
                return total + Number(item.TotalAmount120)
            }, 0)


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

            var ClaimBalance120plus = payer120plus.reduce((total, item) => {
                return total + Number(item.TotalAmount120plus)
            }, 0)

            let mergedArray = payer60.reduce((acc, obj1) => {
                let matchingObj2 = payer120.find(obj2 => obj2.PayerName === obj1.PayerName && Object.keys(obj2).length > 0);
                let matchingObj3 = payer120plus.find(obj3 => obj3.PayerName === obj1.PayerName && Object.keys(obj3).length > 0);
                if (matchingObj2 && matchingObj3 && Object.keys(obj1).length > 0) {
                    acc.push(Object.assign({}, obj1, matchingObj2, matchingObj3));
                } else if (Object.keys(obj1).length > 0) {
                    acc.push(obj1);
                }
                return acc;
            }, []);

            let remainingObjects = payer120.filter(obj2 => Object.keys(obj2).length > 0 && !mergedArray.some(obj => obj.PayerName === obj2.PayerName))
                .concat(payer120plus.filter(obj3 => Object.keys(obj3).length > 0 && !mergedArray.some(obj => obj.PayerName === obj3.PayerName)));

            mergedArray = mergedArray.concat(remainingObjects);



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

    }
    if (radio === "OVER ALL PRODUCTIVITY") {

        var ViewAllClaims = await Claim_Master.aggregate([
            {
                $match: {
                    PracticeId: { $in: PracticeIdsList },
                    SystemStatus: { $nin: ["Auto Close", "AC"] },
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
                        { $sort: { updatedAt: -1 } }, { $limit: 1 }
                    ],
                }
            },
            {
                $project: {
                    UserId: 1,
                    length: { $size: "$claimstatusupdates" }
                }
            },
            {
                $match: {
                    length: { $gt: 0 }
                }
            },


        ])

        var PCAStatus = await Claim_Master.aggregate([
            {
                $match: {
                    PracticeId: { $in: PracticeIdsList },
                    SystemStatus: { $nin: ["Auto Close", "AC"] },
                    PCAStatus: "Yes",
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
                        { $sort: { updatedAt: -1 } }, { $limit: 1 }
                    ],
                }
            },
            {
                $project: {
                    UserId: 1,
                    length: { $size: "$claimstatusupdates" }
                }
            },
            {
                $match: {
                    length: { $gt: 0 }
                }
            },

        ])

        console.log("ViewAllClaims", ViewAllClaims.length)
        console.log("PCAStatus", PCAStatus.length <= 0 ? 0 : PCAStatus)
        var data = [
            ["Status", "Counts"],
            ["View All Claims", ViewAllClaims.length],
            ["PCA Status", PCAStatus.length <= 0 ? 0 : PCAStatus],
        ];

        return res.json({
            Result: true,
            Message: "",
            data: data,
            Radio: radio
        })
    }
    if (radio === "STATUS WISE") {
        if (req.query.FromDate && req.query.ToDate) {
            const endDate = new Date(req.query.ToDate);
            endDate.setUTCHours(23, 59, 59);
            var QueryParmsForDate = {
                $match: {
                    createdAt: { $gte: new Date(req.query.FromDate), $lte: new Date(endDate.toString()) },
                    PracticeId: { $in: PracticeIdsList },
                    SystemStatus: { $nin: ["Auto Close", "AC"] },


                }
            }

            var UserListAging = await Claim_Master.aggregate([
                QueryParmsForDate,
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
                }, {
                    "$project": {
                        "SystemStatus": "$SystemStatus",
                        "ClaimBalance": "$ClaimBalance",
                        "Aging": "$Aging"
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

            var ClaimBalance60 = payer60.reduce((total, item) => {
                return total + Number(item.TotalAmount60)
            }, 0)


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

            var ClaimBalance120 = payer120.reduce((total, item) => {
                return total + Number(item.TotalAmount120)
            }, 0)


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

            var ClaimBalance120plus = payer120plus.reduce((total, item) => {
                return total + Number(item.TotalAmount120plus)
            }, 0)

            let mergedArray = payer60.reduce((acc, obj1) => {
                let matchingObj2 = payer120.find(obj2 => obj2.SystemStatus === obj1.SystemStatus && Object.keys(obj2).length > 0);
                let matchingObj3 = payer120plus.find(obj3 => obj3.SystemStatus === obj1.SystemStatus && Object.keys(obj3).length > 0);
                if (matchingObj2 && matchingObj3 && Object.keys(obj1).length > 0) {
                    acc.push(Object.assign({}, obj1, matchingObj2, matchingObj3));
                } else if (Object.keys(obj1).length > 0) {
                    acc.push(obj1);
                }
                return acc;
            }, []);

            let remainingObjects = payer120.filter(obj2 => Object.keys(obj2).length > 0 && !mergedArray.some(obj => obj.SystemStatus === obj2.SystemStatus))
                .concat(payer120plus.filter(obj3 => Object.keys(obj3).length > 0 && !mergedArray.some(obj => obj.SystemStatus === obj3.SystemStatus)));

            mergedArray = mergedArray.concat(remainingObjects);


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
                {
                    $match: {
                        PracticeId: { $in: PracticeIdsList },
                        SystemStatus: { $nin: ["Auto Close", "AC"] },
                    }
                },
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
                }, {
                    "$project": {
                        "SystemStatus": "$SystemStatus",
                        "ClaimBalance": "$ClaimBalance",
                        "Aging": "$Aging"
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

            var ClaimBalance60 = payer60.reduce((total, item) => {
                return total + Number(item.TotalAmount60)
            }, 0)


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

            var ClaimBalance120 = payer120.reduce((total, item) => {
                return total + Number(item.TotalAmount120)
            }, 0)


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

            var ClaimBalance120plus = payer120plus.reduce((total, item) => {
                return total + Number(item.TotalAmount120plus)
            }, 0)

            let mergedArray = payer60.reduce((acc, obj1) => {
                let matchingObj2 = payer120.find(obj2 => obj2.SystemStatus === obj1.SystemStatus && Object.keys(obj2).length > 0);
                let matchingObj3 = payer120plus.find(obj3 => obj3.SystemStatus === obj1.SystemStatus && Object.keys(obj3).length > 0);
                if (matchingObj2 && matchingObj3 && Object.keys(obj1).length > 0) {
                    acc.push(Object.assign({}, obj1, matchingObj2, matchingObj3));
                } else if (Object.keys(obj1).length > 0) {
                    acc.push(obj1);
                }
                return acc;
            }, []);

            let remainingObjects = payer120.filter(obj2 => Object.keys(obj2).length > 0 && !mergedArray.some(obj => obj.SystemStatus === obj2.SystemStatus))
                .concat(payer120plus.filter(obj3 => Object.keys(obj3).length > 0 && !mergedArray.some(obj => obj.SystemStatus === obj3.SystemStatus)));

            mergedArray = mergedArray.concat(remainingObjects);


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

    }
    //status wise ends here

    //Provider wise

    if (radio === "PROVIDER WISE") {
        if (req.query.FromDate && req.query.ToDate) {
            const endDate = new Date(req.query.ToDate);
            endDate.setUTCHours(23, 59, 59);
            var QueryParmsForDate = {
                $match: {
                    createdAt: { $gte: new Date(req.query.FromDate), $lte: new Date(endDate.toString()) },
                    PracticeId: { $in: PracticeIdsList },
                    SystemStatus: { $nin: ["Auto Close", "AC"] },


                }
            }

            var UserListAging = await Claim_Master.aggregate([
                QueryParmsForDate,
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
                }, {
                    "$project": {
                        "ProviderName": "$ProviderName",
                        "ClaimBalance": "$ClaimBalance",
                        "Aging": "$Aging"
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

            var ClaimBalance60 = payer60.reduce((total, item) => {
                return total + Number(item.TotalAmount60)
            }, 0)


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

            var ClaimBalance120 = payer120.reduce((total, item) => {
                return total + Number(item.TotalAmount120)
            }, 0)


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

            var ClaimBalance120plus = payer120plus.reduce((total, item) => {
                return total + Number(item.TotalAmount120plus)
            }, 0)

            let mergedArray = payer60.reduce((acc, obj1) => {
                let matchingObj2 = payer120.find(obj2 => obj2.ProviderName === obj1.ProviderName && Object.keys(obj2).length > 0);
                let matchingObj3 = payer120plus.find(obj3 => obj3.ProviderName === obj1.ProviderName && Object.keys(obj3).length > 0);
                if (matchingObj2 && matchingObj3 && Object.keys(obj1).length > 0) {
                    acc.push(Object.assign({}, obj1, matchingObj2, matchingObj3));
                } else if (Object.keys(obj1).length > 0) {
                    acc.push(obj1);
                }
                return acc;
            }, []);

            let remainingObjects = payer120.filter(obj2 => Object.keys(obj2).length > 0 && !mergedArray.some(obj => obj.ProviderName === obj2.ProviderName))
                .concat(payer120plus.filter(obj3 => Object.keys(obj3).length > 0 && !mergedArray.some(obj => obj.ProviderName === obj3.ProviderName)));

            mergedArray = mergedArray.concat(remainingObjects);



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
                }, {
                    "$project": {
                        "ProviderName": "$ProviderName",
                        "ClaimBalance": "$ClaimBalance",
                        "Aging": "$Aging"
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

            var ClaimBalance60 = payer60.reduce((total, item) => {
                return total + Number(item.TotalAmount60)
            }, 0)


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

            var ClaimBalance120 = payer120.reduce((total, item) => {
                return total + Number(item.TotalAmount120)
            }, 0)


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

            var ClaimBalance120plus = payer120plus.reduce((total, item) => {
                return total + Number(item.TotalAmount120plus)
            }, 0)

            let mergedArray = payer60.reduce((acc, obj1) => {
                let matchingObj2 = payer120.find(obj2 => obj2.ProviderName === obj1.ProviderName && Object.keys(obj2).length > 0);
                let matchingObj3 = payer120plus.find(obj3 => obj3.ProviderName === obj1.ProviderName && Object.keys(obj3).length > 0);
                if (matchingObj2 && matchingObj3 && Object.keys(obj1).length > 0) {
                    acc.push(Object.assign({}, obj1, matchingObj2, matchingObj3));
                } else if (Object.keys(obj1).length > 0) {
                    acc.push(obj1);
                }
                return acc;
            }, []);

            let remainingObjects = payer120.filter(obj2 => Object.keys(obj2).length > 0 && !mergedArray.some(obj => obj.ProviderName === obj2.ProviderName))
                .concat(payer120plus.filter(obj3 => Object.keys(obj3).length > 0 && !mergedArray.some(obj => obj.ProviderName === obj3.ProviderName)));

            mergedArray = mergedArray.concat(remainingObjects);



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

    }
    //provider wise ends here

    //Rootcause
    if (radio === "ROOTCAUSE WISE") {
        if (req.query.FromDate && req.query.ToDate) {
            const endDate = new Date(req.query.ToDate);
            endDate.setUTCHours(23, 59, 59);
            var QueryParmsForDate = {
                $match: {
                    createdAt: { $gte: new Date(req.query.FromDate), $lte: new Date(endDate.toString()) },
                    PracticeId: { $in: PracticeIdsList },
                    SystemStatus: { $nin: ["Auto Close", "AC"] },


                }
            }

            var UserListAging = await Claim_Master.aggregate([
                QueryParmsForDate,
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
                }, {
                    "$project": {
                        "RootCause": "$RootCause",
                        "ClaimBalance": "$ClaimBalance",
                        "Aging": "$Aging"
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

            var ClaimBalance60 = payer60.reduce((total, item) => {
                return total + Number(item.TotalAmount60)
            }, 0)


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

            var ClaimBalance120 = payer120.reduce((total, item) => {
                return total + Number(item.TotalAmount120)
            }, 0)


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

            var ClaimBalance120plus = payer120plus.reduce((total, item) => {
                return total + Number(item.TotalAmount120plus)
            }, 0)

            let mergedArray = payer60.reduce((acc, obj1) => {
                let matchingObj2 = payer120.find(obj2 => obj2.RootCause === obj1.RootCause && Object.keys(obj2).length > 0);
                let matchingObj3 = payer120plus.find(obj3 => obj3.RootCause === obj1.RootCause && Object.keys(obj3).length > 0);
                if (matchingObj2 && matchingObj3 && Object.keys(obj1).length > 0) {
                    acc.push(Object.assign({}, obj1, matchingObj2, matchingObj3));
                } else if (Object.keys(obj1).length > 0) {
                    acc.push(obj1);
                }
                return acc;
            }, []);

            let remainingObjects = payer120.filter(obj2 => Object.keys(obj2).length > 0 && !mergedArray.some(obj => obj.RootCause === obj2.RootCause))
                .concat(payer120plus.filter(obj3 => Object.keys(obj3).length > 0 && !mergedArray.some(obj => obj.RootCause === obj3.RootCause)));

            mergedArray = mergedArray.concat(remainingObjects);


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
                }, {
                    "$project": {
                        "RootCause": "$RootCause",
                        "ClaimBalance": "$ClaimBalance",
                        "Aging": "$Aging"
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

            var ClaimBalance60 = payer60.reduce((total, item) => {
                return total + Number(item.TotalAmount60)
            }, 0)


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

            var ClaimBalance120 = payer120.reduce((total, item) => {
                return total + Number(item.TotalAmount120)
            }, 0)


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

            var ClaimBalance120plus = payer120plus.reduce((total, item) => {
                return total + Number(item.TotalAmount120plus)
            }, 0)

            let mergedArray = payer60.reduce((acc, obj1) => {
                let matchingObj2 = payer120.find(obj2 => obj2.RootCause === obj1.RootCause && Object.keys(obj2).length > 0);
                let matchingObj3 = payer120plus.find(obj3 => obj3.RootCause === obj1.RootCause && Object.keys(obj3).length > 0);
                if (matchingObj2 && matchingObj3 && Object.keys(obj1).length > 0) {
                    acc.push(Object.assign({}, obj1, matchingObj2, matchingObj3));
                } else if (Object.keys(obj1).length > 0) {
                    acc.push(obj1);
                }
                return acc;
            }, []);

            let remainingObjects = payer120.filter(obj2 => Object.keys(obj2).length > 0 && !mergedArray.some(obj => obj.RootCause === obj2.RootCause))
                .concat(payer120plus.filter(obj3 => Object.keys(obj3).length > 0 && !mergedArray.some(obj => obj.RootCause === obj3.RootCause)));

            mergedArray = mergedArray.concat(remainingObjects);


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

    }

    if (radio === "PRACTICE WISE") {
        if (req.query.FromDate && req.query.ToDate) {

            const endDate = new Date(req.query.ToDate);
            endDate.setUTCHours(23, 59, 59);
            var QueryParmsForDate = {
                $match: {
                    createdAt: { $gte: new Date(req.query.FromDate), $lte: new Date(endDate.toString()) },
                    PracticeId: { $in: PracticeIdsList },
                    SystemStatus: { $nin: ["Auto Close", "AC"] },


                }
            }

            var UserListAging = await Claim_Master.aggregate([
                QueryParmsForDate,
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
                }, {
                    "$project": {
                        "PracticeId": "$PracticeId",
                        "ClaimBalance": "$ClaimBalance",
                        "Aging": "$Aging"
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

            var ClaimBalance60 = payer60.reduce((total, item) => {
                return total + Number(item.TotalAmount60)
            }, 0)


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

            var ClaimBalance120 = payer120.reduce((total, item) => {
                return total + Number(item.TotalAmount120)
            }, 0)


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

            var ClaimBalance120plus = payer120plus.reduce((total, item) => {
                return total + Number(item.TotalAmount120plus)
            }, 0)

            let mergedArray = payer60.reduce((acc, obj1) => {
                let matchingObj2 = payer120.find(obj2 => obj2.PracticeId === obj1.PracticeId && Object.keys(obj2).length > 0);
                let matchingObj3 = payer120plus.find(obj3 => obj3.PracticeId === obj1.PracticeId && Object.keys(obj3).length > 0);
                if (matchingObj2 && matchingObj3 && Object.keys(obj1).length > 0) {
                    acc.push(Object.assign({}, obj1, matchingObj2, matchingObj3));
                } else if (Object.keys(obj1).length > 0) {
                    acc.push(obj1);
                }
                return acc;
            }, []);

            let remainingObjects = payer120.filter(obj2 => Object.keys(obj2).length > 0 && !mergedArray.some(obj => obj.PracticeId === obj2.PracticeId))
                .concat(payer120plus.filter(obj3 => Object.keys(obj3).length > 0 && !mergedArray.some(obj => obj.PracticeId === obj3.PracticeId)));

            mergedArray = mergedArray.concat(remainingObjects);


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

                PracticeWiseData.push([
                    res.PracticeId,
                    res.TotalAmount
                ])
                PracticeWiseDataForClaim.push([
                    res.PracticeId,
                    res.Count
                ])
                PracticeWiseTableData.push({
                    lookUpName: res.PracticeId,
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
                }, {
                    "$project": {
                        "PracticeId": "$PracticeId",
                        "ClaimBalance": "$ClaimBalance",
                        "Aging": "$Aging"
                    }
                }

            ])
            console.log("UserListAging", UserListAging)

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

            var ClaimBalance60 = payer60.reduce((total, item) => {
                return total + Number(item.TotalAmount60)
            }, 0)


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

            var ClaimBalance120 = payer120.reduce((total, item) => {
                return total + Number(item.TotalAmount120)
            }, 0)


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

            var ClaimBalance120plus = payer120plus.reduce((total, item) => {
                return total + Number(item.TotalAmount120plus)
            }, 0)

            let mergedArray = payer60.reduce((acc, obj1) => {
                let matchingObj2 = payer120.find(obj2 => obj2.PracticeId === obj1.PracticeId && Object.keys(obj2).length > 0);
                let matchingObj3 = payer120plus.find(obj3 => obj3.PracticeId === obj1.PracticeId && Object.keys(obj3).length > 0);
                if (matchingObj2 && matchingObj3 && Object.keys(obj1).length > 0) {
                    acc.push(Object.assign({}, obj1, matchingObj2, matchingObj3));
                } else if (Object.keys(obj1).length > 0) {
                    acc.push(obj1);
                }
                return acc;
            }, []);

            let remainingObjects = payer120.filter(obj2 => Object.keys(obj2).length > 0 && !mergedArray.some(obj => obj.PracticeId === obj2.PracticeId))
                .concat(payer120plus.filter(obj3 => Object.keys(obj3).length > 0 && !mergedArray.some(obj => obj.PracticeId === obj3.PracticeId)));

            mergedArray = mergedArray.concat(remainingObjects);

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
            //To get Practice name
            for (var i = 0; i < mergedArray.length; i++) {

                var getPracticeCoumns = await Practice.findOne({ _id: new ObjectID(mergedArray[i].PracticeId) }, { PracticeName: 1, _id: 0 })
                if (getPracticeCoumns) {
                    mergedArray[i].PracticeName = getPracticeCoumns.PracticeName
                }
            }
            console.log("mergedArray", mergedArray)
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


    //Aging wise

    if (radio === "AGING WISE") {
        if (req.query.FromDate && req.query.ToDate) {
            const endDate = new Date(req.query.ToDate);
            endDate.setUTCHours(23, 59, 59);
            var QueryParmsForDate = {
                $match: {
                    createdAt: { $gte: new Date(req.query.FromDate), $lte: new Date(endDate.toString()) },
                    PracticeId: { $in: PracticeIdsList },
                    SystemStatus: { $nin: ["Auto Close", "AC"] },


                }
            }

            var AgingWiseAging = await Claim_Master.aggregate([
                QueryParmsForDate,
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
                        from: 'users',
                        localField: 'AssignTo',
                        foreignField: '_id',
                        as: 'AssignTousers'
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
                        "ClaimBalance": "$ClaimBalance",
                        Aging: {
                            $round: { $divide: [{ $subtract: [{ '$arrayElemAt': ['$claimstatusupdates.updatedAt', 0] }, '$DateOfService'] }, 86400000] },
                        },
                    }
                }, {
                    $match: {
                        "Aging": { "$nin": [null] }
                    }
                }
            ])

            var days30 = AgingWiseAging.reduce(function (sum, dataGet) {
                if (dataGet.Aging >= 0 && dataGet.Aging <= 30) {

                    const { _id, ClaimBalance } = dataGet
                    if (!sum[_id]) {
                        sum[_id] = { _id, TotalAmount30: 0, Count30: 0 }
                    }
                    sum[_id].TotalAmount30 += Number(ClaimBalance)
                    sum[_id].Count30 += 1
                    return sum
                } else {
                    return sum
                }

            }, {})
            var aging30 = days30 ? Object.values(days30) : []

            var ClaimBalance30 = aging30.reduce((total, item) => {
                return total + Number(item.TotalAmount30)
            }, 0)


            var days60 = AgingWiseAging.reduce(function (sum, dataGet) {
                if (dataGet.Aging > 30 && dataGet.Aging <= 60) {

                    const { _id, ClaimBalance } = dataGet
                    if (!sum[_id]) {
                        sum[_id] = { _id, TotalAmount60: 0, Count60: 0 }
                    }
                    sum[_id].TotalAmount60 += Number(ClaimBalance)
                    sum[_id].Count60 += 1
                    return sum
                } else {
                    return sum
                }

            }, {})
            var aging60 = days60 ? Object.values(days60) : []

            var ClaimBalance60 = aging60.reduce((total, item) => {
                return total + Number(item.TotalAmount60)
            }, 0)



            var days90 = AgingWiseAging.reduce(function (sum, dataGet) {
                if (dataGet.Aging > 60 && dataGet.Aging <= 90) {
                    const { _id, ClaimBalance } = dataGet
                    if (!sum[_id]) {
                        sum[_id] = { _id, TotalAmount90: 0, Count90: 0 }
                    }
                    sum[_id].TotalAmount90 += Number(ClaimBalance)
                    sum[_id].Count90 += 1
                    return sum
                } else {
                    return sum
                }

            }, {})
            var aging90 = days90 ? Object.values(days90) : []

            var ClaimBalance90 = aging90.reduce((total, item) => {
                return total + Number(item.TotalAmount90)
            }, 0)

            var days120 = AgingWiseAging.reduce(function (sum, dataGet) {
                if (dataGet.Aging > 90 && dataGet.Aging <= 120) {
                    const { _id, ClaimBalance } = dataGet
                    if (!sum[_id]) {
                        sum[_id] = { _id, TotalAmount120: 0, Count120: 0 }
                    }
                    sum[_id].TotalAmount120 += Number(ClaimBalance)
                    sum[_id].Count120 += 1
                    return sum
                } else {
                    return sum
                }

            }, {})
            var aging120 = days120 ? Object.values(days120) : []

            var ClaimBalance120 = aging120.reduce((total, item) => {
                return total + Number(item.TotalAmount120)
            }, 0)


            var days120plus = AgingWiseAging.reduce(function (sum, dataGet) {
                if (dataGet.Aging > 120) {
                    const { _id, ClaimBalance } = dataGet
                    if (!sum[_id]) {
                        sum[_id] = { _id, TotalAmount120plus: 0, Count120plus: 0 }
                    }
                    sum[_id].TotalAmount120plus += Number(ClaimBalance)
                    sum[_id].Count120plus += 1
                    return sum
                } else {
                    return sum
                }

            }, {})
            var aging120plus = days120plus ? Object.values(days120plus) : []

            var ClaimBalance120plus = aging120plus.reduce((total, item) => {
                return total + Number(item.TotalAmount120plus)
            }, 0)

            var FinalTableData = [
                {
                    Label: "0-30",
                    TotalAmount: ClaimBalance30,
                    Count: aging30.length,

                },
                {
                    Label: "30-60",
                    TotalAmount: ClaimBalance60,
                    Count: aging60.length,

                },
                {
                    Label: "60-90",
                    TotalAmount: ClaimBalance90,
                    Count: aging90.length,
                },
                {
                    Label: "90-120",
                    TotalAmount: ClaimBalance120,
                    Count: aging120.length,
                },
                {
                    Label: "120 Above",
                    TotalAmount: ClaimBalance120plus,
                    Count: aging120plus.length,
                },
            ]

            FinalTableData.map((res, ind) => {
                AgeingWiseChartData.push([
                    res.Label,
                    res.TotalAmount
                ])
                AgeingWiseChartDataForClaim.push([
                    res.Label,
                    res.Count
                ])
                AgeingWiseTableData.push({
                    lookUpName: res.Label,
                    TotalAmount: res.TotalAmount,
                    Count: res.Count,
                    //    TotalAmount60:res.TotalAmount60,
                    //    Count60:res.Count60,
                    //    TotalAmount90:res.TotalAmount90,
                    //    Count90:res.Count90,
                    //    TotalAmount120:res.TotalAmount120,
                    //    Count120:res.Count120,
                    //    TotalAmount120plus:res.TotalAmount120plus,
                    //    Count120plus:res.Count120plus,
                })

            })
            return res.json({
                Result: true,
                Message: "",
                AgeingWiseTableData: AgeingWiseTableData,
                AgeingWiseChartData: AgeingWiseChartData,
                AgeingWiseChartDataForClaim: AgeingWiseChartDataForClaim,
                Radio: radio

            })


        }
        else {
            var AgingWiseAging = await Claim_Master.aggregate([
                {
                    $match: {
                        PracticeId: { $in: PracticeIdsList },
                        SystemStatus: { $nin: ["Auto Close", "AC"] },
                    }
                },
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
                        from: 'users',
                        localField: 'AssignTo',
                        foreignField: '_id',
                        as: 'AssignTousers'
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
                        "ClaimBalance": "$ClaimBalance",
                        Aging: {
                            $round: { $divide: [{ $subtract: [{ '$arrayElemAt': ['$claimstatusupdates.updatedAt', 0] }, '$DateOfService'] }, 86400000] },
                        },
                    }
                }, {
                    $match: {
                        "Aging": { "$nin": [null] }
                    }
                }
            ])

            var days30 = AgingWiseAging.reduce(function (sum, dataGet) {
                if (dataGet.Aging >= 0 && dataGet.Aging <= 30) {

                    const { _id, ClaimBalance } = dataGet
                    if (!sum[_id]) {
                        sum[_id] = { _id, TotalAmount30: 0, Count30: 0 }
                    }
                    sum[_id].TotalAmount30 += Number(ClaimBalance)
                    sum[_id].Count30 += 1
                    return sum
                } else {
                    return sum
                }

            }, {})
            var aging30 = days30 ? Object.values(days30) : []

            var ClaimBalance30 = aging30.reduce((total, item) => {
                return total + Number(item.TotalAmount30)
            }, 0)


            var days60 = AgingWiseAging.reduce(function (sum, dataGet) {
                if (dataGet.Aging > 30 && dataGet.Aging <= 60) {

                    const { _id, ClaimBalance } = dataGet
                    if (!sum[_id]) {
                        sum[_id] = { _id, TotalAmount60: 0, Count60: 0 }
                    }
                    sum[_id].TotalAmount60 += Number(ClaimBalance)
                    sum[_id].Count60 += 1
                    return sum
                } else {
                    return sum
                }

            }, {})
            var aging60 = days60 ? Object.values(days60) : []

            var ClaimBalance60 = aging60.reduce((total, item) => {
                return total + Number(item.TotalAmount60)
            }, 0)



            var days90 = AgingWiseAging.reduce(function (sum, dataGet) {
                if (dataGet.Aging > 60 && dataGet.Aging <= 90) {
                    const { _id, ClaimBalance } = dataGet
                    if (!sum[_id]) {
                        sum[_id] = { _id, TotalAmount90: 0, Count90: 0 }
                    }
                    sum[_id].TotalAmount90 += Number(ClaimBalance)
                    sum[_id].Count90 += 1
                    return sum
                } else {
                    return sum
                }

            }, {})
            var aging90 = days90 ? Object.values(days90) : []

            var ClaimBalance90 = aging90.reduce((total, item) => {
                return total + Number(item.TotalAmount90)
            }, 0)

            var days120 = AgingWiseAging.reduce(function (sum, dataGet) {
                if (dataGet.Aging > 90 && dataGet.Aging <= 120) {
                    const { _id, ClaimBalance } = dataGet
                    if (!sum[_id]) {
                        sum[_id] = { _id, TotalAmount120: 0, Count120: 0 }
                    }
                    sum[_id].TotalAmount120 += Number(ClaimBalance)
                    sum[_id].Count120 += 1
                    return sum
                } else {
                    return sum
                }

            }, {})
            var aging120 = days120 ? Object.values(days120) : []

            var ClaimBalance120 = aging120.reduce((total, item) => {
                return total + Number(item.TotalAmount120)
            }, 0)


            var days120plus = AgingWiseAging.reduce(function (sum, dataGet) {
                if (dataGet.Aging > 120) {
                    const { _id, ClaimBalance } = dataGet
                    if (!sum[_id]) {
                        sum[_id] = { _id, TotalAmount120plus: 0, Count120plus: 0 }
                    }
                    sum[_id].TotalAmount120plus += Number(ClaimBalance)
                    sum[_id].Count120plus += 1
                    return sum
                } else {
                    return sum
                }

            }, {})
            var aging120plus = days120plus ? Object.values(days120plus) : []

            var ClaimBalance120plus = aging120plus.reduce((total, item) => {
                return total + Number(item.TotalAmount120plus)
            }, 0)

            var FinalTableData = [
                {
                    Label: "0-30",
                    TotalAmount: ClaimBalance30,
                    Count: aging30.length,

                },
                {
                    Label: "30-60",
                    TotalAmount: ClaimBalance60,
                    Count: aging60.length,

                },
                {
                    Label: "60-90",
                    TotalAmount: ClaimBalance90,
                    Count: aging90.length,
                },
                {
                    Label: "90-120",
                    TotalAmount: ClaimBalance120,
                    Count: aging120.length,
                },
                {
                    Label: "120 Above",
                    TotalAmount: ClaimBalance120plus,
                    Count: aging120plus.length,
                },
            ]

            FinalTableData.map((res, ind) => {
                AgeingWiseChartData.push([
                    res.Label,
                    res.TotalAmount
                ])
                AgeingWiseChartDataForClaim.push([
                    res.Label,
                    res.Count
                ])
                AgeingWiseTableData.push({
                    lookUpName: res.Label,
                    TotalAmount: res.TotalAmount,
                    Count: res.Count,
                })

            })
            return res.json({
                Result: true,
                Message: "",
                AgeingWiseTableData: AgeingWiseTableData,
                AgeingWiseChartData: AgeingWiseChartData,
                AgeingWiseChartDataForClaim: AgeingWiseChartDataForClaim,
                Radio: radio

            })

        }
    }
})
router.get('/UserDashbaord', passport.authenticate("jwt", { session: false }), async (req, res) => {
    var UserId = req.query.ManagerID ? req.query.ManagerID : new ObjectID(req.user._id) 
    var UserListIds = []
    var DuplicateIDs = []
    var ChooseIDs = req.query.UserId ? JSON.parse(req.query.UserId) : []
    if (ChooseIDs.length > 0) {
        var UserList = ChooseIDs
        UserList.map((ress, ind) => {
            UserListIds.push(new ObjectID(ress.value))
            DuplicateIDs.push(String(ress.value))
        })
    } else {
        if (req.user.RoleType == "AR-Caller") {
            UserListIds.push(UserId)
            DuplicateIDs.push(String(req.user._id))
        } else {
            var UserList = await Users.find({ ReportingManager: UserId })
            var UserListIds = []
            UserList.map((res, ind) => {
                UserListIds.push(new ObjectID(res._id))
                DuplicateIDs.push(String(res._id))
            })
        }
    }

    var TotalClosed = 0;
    var TotalPending = 0;
    var TotalAutoCloseClaims = 0;
    console.log("UserListIds",UserListIds)
    var UserData = []
    if(UserListIds.length == 0){
        return res.json({
            data: [],
            UserList: []
        })
    }
    for (var i = 0; i < UserListIds.length; i++) {
       
        var UserDatas = await Users.findOne({ _id: new ObjectID(UserListIds[i]) })
        var Pending = await Claim_Master.countDocuments({ AssignTo: new ObjectID(UserListIds[i]),SystemStatus: { $in: StatusCodes } })
        TotalPending +=Pending
        var TotalCountAutoClose = await Claim_Master.countDocuments({ AssignTo: new ObjectID(UserListIds[i]), SystemStatus: { $in: ["Auto Close"]}})
        TotalAutoCloseClaims +=TotalCountAutoClose
        var QueryStatusUpdate = { UserId: new ObjectID(UserListIds[i]) }
        if (req.query.FromDate && req.query.ToDate) {
            const endDate = new Date(req.query.ToDate);
            endDate.setUTCHours(23, 59, 59);
            var Query = {
                createdAt: { $gte: new Date(req.query.FromDate), $lte: new Date(endDate.toString()) }
            }
            Object.assign(QueryStatusUpdate, Query)
        }

        var Closed = 0;
        var QueryStatusUpdateIn = Object.assign({ StatusCode: { $nin: ["Open", "Hold", "RECBILL", "Fresh-Call", "CALL", "RECALL"] }, UserId: new ObjectID(UserListIds[i]._id) })
        if (req.query.FromDate && req.query.ToDate) {
            const endDate = new Date(req.query.ToDate);
            endDate.setUTCHours(23, 59, 59);
            var QueryIn = {
                createdAt: { $gte: new Date(req.query.FromDate), $lte: new Date(endDate.toString()) }
            }
            Object.assign(QueryStatusUpdateIn, QueryIn)
        }
        var Test = await ClaimStatusUpdate.aggregate([

            {
                $match: QueryStatusUpdateIn
            },
            {
                "$group": {
                    "_id": "$ClaimId",
                },

            },
            {
                "$count": "count"
            },
        ])

        Closed += Object.keys(Test).length > 0 ? Test[0].count : 0
        TotalClosed += Object.keys(Test).length > 0 ? Test[0].count : 0

        UserData.push({
            Closed: Closed,
            UserName: UserDatas ? UserDatas.FirstName + " " + UserDatas.LastName : null,
            UserId: UserDatas ? UserDatas._id : "",
            //Total: TotalCount,
            Pending : Pending,
            AutoClose: TotalCountAutoClose
        })
        if (i == UserListIds.length - 1) {

            data = [
                ["Status", "Counts"],
                ["Pending", Number(TotalPending)],
                ["Worked", TotalClosed],
                ["Auto Close", TotalAutoCloseClaims],
            ];

            res.json({
                data: data,
                UserList: UserData
            })
        }

    }
})
router.get('/DownloadDashboard', passport.authenticate("jwt", { session: false }), async (req, res) => {
    var UserId = req.query.ManagerID ? req.query.ManagerID : new ObjectID(req.user._id)
    var CheckIDs = typeof req.query.UserId == "string" ? JSON.parse(req.query.UserId) : req.query.UserId

    var ClaimMasterSystemQuery = {
        SystemStatus: { $nin: ["Open", "Hold", "RECBILL", "RECALL"] }
    }
    var UserListIds = []
    if (CheckIDs.length) {
        var UserList = JSON.parse(req.query.UserId)
        UserList.map((ress, ind) => {
            UserListIds.push(new ObjectID(ress.value))
        })
    } else {
        if (req.user.RoleType == "AR-Caller") {
            UserListIds.push(UserId)
        } else {
            var UserList = await Users.find({ ReportingManager: UserId })
            UserList.map((res, ind) => {
                UserListIds.push(new ObjectID(res._id))
            })
        }
    }

    var QueryStatusUpdate = { UserId: { $in: UserListIds } }

    Object.assign(ClaimMasterSystemQuery, { AssignTo: { $in: UserListIds } })
    var ClaimIDs = []
    if (req.query.FromDate && req.query.ToDate) {
        const endDate = new Date(req.query.ToDate);
        endDate.setUTCHours(23, 59, 59);
        var Query = {
            createdAt: { $gte: new Date(req.query.FromDate), $lte: new Date(endDate.toString()) }
        }
        Object.assign(QueryStatusUpdate, Query)
        var ClaimStatusIds = await ClaimStatusUpdate.find(QueryStatusUpdate)

        ClaimStatusIds.map((ress, ind) => {
            ClaimIDs.push(new ObjectID(ress.ClaimId))
        })
        if (ClaimIDs.length > 0) {
            Object.assign(ClaimMasterSystemQuery, { _id: { $in: ClaimIDs } })
        }
    }


    var GetSelectedColumns = await UserDatatableColumns.findOne({
        UserId: new ObjectID(req.user._id),
        PageType: "ViewClaims"
    })
    var ExcelColumns = []
    var ProjectSelectedColumns = {}
    if (GetSelectedColumns) {

        GetSelectedColumns.Columns.map((dd, i) => {
            if (Boolean(dd.value)) {
                var headerLabel = dd.label
                if (dd.label == "updatedAt") {
                    headerLabel = "Last Worked Date"
                } else if (dd.label == "FirstName") {
                    headerLabel = "Assigned To"
                }
                ExcelColumns.push({ header: headerLabel, key: dd.label, width: 20 })
                if (dd.label == "updatedAt") {
                    Object.assign(ProjectSelectedColumns, { [dd.label]: { $dateToString: { format: '%m-%d-%Y', date: "$LastWorkingDate" } } })

                } else if (dd.label == "Aging") {
                    // Object.assign(ProjectSelectedColumns,{[dd.label] : {
                    //     $round: { $divide: [{ $subtract: [{ '$arrayElemAt': ['$claimstatusupdates.updatedAt', 0] }, '$DateOfService'] }, 86400000] }
                    // }})
                } else if (dd.label == "FirstName") {
                    Object.assign(ProjectSelectedColumns, { [dd.label]: { "$arrayElemAt": ["$AssignTousers.FirstName", 0] } })
                } else if (dd.label == "SystemStatus") {
                    // Object.assign(ProjectSelectedColumns,{[dd.label] : { "$arrayElemAt": ["$claimstatusupdates.StatusCode", 0] }})
                } else if (dd.label == "DueDate") {
                    // Object.assign(ProjectSelectedColumns,{[dd.label] : { '$dateToString': { format: '%m-%d-%Y', date: { '$arrayElemAt': ['$claimstatusupdates.DueDate', 0] } } }})
                } else if (dd.label == "Comments") {
                    // Object.assign(ProjectSelectedColumns,{[dd.label] : { "$arrayElemAt": ["$claimstatusupdates.Comments", 0] }})
                }

                else {
                    Object.assign(ProjectSelectedColumns, { [dd.label]: `$${dd.label}` })
                }
            }
        })
    }
    ExcelColumns.push({ header: "User Updated Date", key: "UserUpdatedDate", width: 20 })
    // Object.assign(ProjectSelectedColumns,{"UserUpdatedDate" : { '$dateToString': { format: '%m-%d-%Y', date: { '$arrayElemAt': ['$claimstatusupdates.updatedAt', 0] } } }})
    console.log("ClaimMasterSystemQuery", ClaimMasterSystemQuery)
    Object.assign(ProjectSelectedColumns, { "claimstatusupdates": `$claimstatusupdates` })
    var ClaimListData = await Claim_Master.aggregate([
        {
            $match: ClaimMasterSystemQuery
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
            $lookup: {
                from: "users",
                localField: "AssignTo",    // field in the Opportunities collection
                foreignField: "_id",  // From Tables coestimations
                as: "AssignTousers"
            }
        },
        {
            $lookup: {
                from: "claimstatusupdates",
                localField: "_id",    // field in the Opportunities collection
                foreignField: "ClaimId",  // From Tables coestimations
                as: "claimstatusupdates"
            }
        },
        {
            $project: ProjectSelectedColumns
        },
    ])
    let workbook = new excel.Workbook();
    var NewClaimData = []
    if (ClaimListData.length > 0) {
        var UserListIdsNew = JSON.parse(JSON.stringify(UserListIds))
        ClaimListData.map(async (getData, ind) => {

            const filteredBooks = await getData.claimstatusupdates.filter(val => UserListIdsNew.includes(String(val.UserId)));
            if (filteredBooks.length > 0) {
                var Data = filteredBooks.pop()
                var start = moment(Data.createdAt);
                var end = moment(getData.DateOfService);
                const daysDiff = start.diff(end, 'days');
                NewClaimData.push({
                    ...getData,
                    Comments: Data.Comments,
                    DueDate: Data.DueDate,
                    SystemStatus: Data.StatusCode,
                    UserUpdatedDate: moment(Data.createdAt).format("MM-DD-YYYY"),
                    Aging: daysDiff
                })
            }
            if (ClaimListData.length - 1 == ind) {


                var PendingData = await Claim_Master.aggregate([
                    {
                        $match: { AssignTo: { $in: UserListIds } ,SystemStatus: { $in: StatusCodes } }
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
                        $lookup: {
                            from: "users",
                            localField: "AssignTo",    // field in the Opportunities collection
                            foreignField: "_id",  // From Tables coestimations
                            as: "AssignTousers"
                        }
                    },
                    {
                        $project: ProjectSelectedColumns
                    },
                ])

                let worksheet = workbook.addWorksheet(`Worked Claims`);
                worksheet.columns = ExcelColumns
                // Add Array Rows
                worksheet.addRows(NewClaimData);

                var  Pendingworksheet = workbook.addWorksheet(`Pending Claims`);
                Pendingworksheet.columns = ExcelColumns
                // Add Array Rows
                Pendingworksheet.addRows(PendingData);

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
            }
        })
    } else {
        let worksheet = workbook.addWorksheet(`Overall Performance Dashboard-${moment("MM-DD-YYYY")}`);
        worksheet.columns = ExcelColumns
        // Add Array Rows
        worksheet.addRows(NewClaimData);
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
    }

})

router.put('/update', passport.authenticate("jwt", { session: false }), async (req, res) => {
    var Where = { 'Status.isDeleted': false }
    Users.updateMany(Where).then((ResponseData) => {
        res.json({
            data: ResponseData
        })
    })
})
router.post('/login', async (req, res) => {

    var id_token_decoded = jwt_decode(req.body.id_token);

    var getRoleName = await Roles.findOneAndUpdate({ role_name: id_token_decoded["cognito:groups"][0] }, { $set: { role_name: id_token_decoded["cognito:groups"][0], status: { isDeleted: false } } }, { upsert: true, new: true })

    const UserData = {
        Status: { isDeleted: false },
        LoginStatus: true,
        LoginTime: moment.utc(new Date(id_token_decoded.auth_time) * 1000).format("YYYY-MM-DD h:mm"),
        UserId: id_token_decoded.sub,
        RoleName: getRoleName._id,
        PermissionsList: getRoleName.PermissionsList,
        FirstName: id_token_decoded.preferred_username,
        LastName: id_token_decoded.given_name,
        Contact: id_token_decoded.phone_number,
        EmailId: id_token_decoded.email,
        api_token: req.body.id_token,
        RoleType: getRoleName.role_name
    };


    await Users.findOneAndUpdate({ UserId: id_token_decoded.sub }, { $set: UserData }, {
        upsert: true, new: true,
        select: { api_token: 1, ReportingManager: 1, RoleName: 1, Contact: 1, LoginStatus: 1, UserId: 1, ContactNumber: 1, UserName: 1, Prefix: 1, FirstName: 1 }
    }).then(async (UpdateData) => {

        var TokenData = {
            UserId: UpdateData._id,
            id_token: req.body.id_token
        }
        await LoginLog.findOneAndUpdate({ UserId: UpdateData._id }, { $set: TokenData }, { upsert: true, new: true })
        res.json(UpdateData)
    })
});

router.post('/verify_token', async (req, res) => {
    if (req.body) {
        var GetFields = {
            api_token: 1,
            UserName: 1,
            EmailId: 1,
            FirstName: 1,
            LastName: 1,
            _id: 1,
            EmployeeId: 1,
            ReportingManagerId: 1,
            LoginTime: 1,
            PmId: 1,
            PracticeId: 1,
            ReportingManager: 1,
            RoleName: 1,
        }
        await Users.findOne({ _id: req.body.UserId }, GetFields).then(async login => {
            if (login) {
                var jwt_payload = {
                    id: login.id,
                    login_data: login
                };
                jwt.sign(jwt_payload, secretOrKey, async (err, token) => {
                    var tokenData = { token: "" }
                    if (token) {

                        var StatusUpdate = {
                            LoginStatus: true,
                            LoginTime: moment(),
                        }
                        await Users.updateOne({ _id: login._id }, { $set: StatusUpdate })
                        tokenData.token = token

                        var Data = await Role.findOne({ _id: new ObjectID(login.RoleName) })

                        Object.assign(tokenData, { PermissionsList: Data.PermissionsList })
                        Object.assign(tokenData, { RoleType: Data.role_name })

                        Object.assign(tokenData, login._doc)
                        res.status(200).json(tokenData)
                    } else {
                        res.status(400).json(err)
                    }
                })
            } else {
                res.status(400).json({ Message: "Verify Token Mismatch" })
            }
        })
    }
});
router.post('/forgot_password', async (req, res) => {

    res.json(req.body)
});
router.post('/getUserById', async (req, res) => {
    var Where = { '_id': new ObjectID(req.body.UserById) }
    var ReportingManagerid = ""
    var SelectPMSystem = []
    var SelectPracticeSystem = []
    Users.findOne(Where).then(async (ResponseData) => {

        ReportingManagerid = await Users.findOne({ _id: new ObjectID(ResponseData.ReportingManager) })
        SelectPMSystemFind = await PmSystem.find({ _id: { $in: ResponseData.PmId } })

        await SelectPMSystemFind.map((res, ind) => {
            SelectPMSystem.push({
                label: res.PmName,
                value: res._id
            })
        })

        PracticeSystem = await Practice.find({ _id: { $in: ResponseData.PracticeId } })

        await PracticeSystem.map((res, ind) => {
            SelectPracticeSystem.push({
                label: res.PracticeName,
                value: res._id
            })
        })

        res.json({
            ReportingManagerid: ReportingManagerid ? {
                label: `${ReportingManagerid.FirstName} ${ReportingManagerid.LastName}`,
                value: ReportingManagerid._id
            } : "",
            SelectPMSystem: SelectPMSystem,
            SelectPracticeSystem: SelectPracticeSystem,
            //data: ResponseData
        })
    })
});


module.exports = router;