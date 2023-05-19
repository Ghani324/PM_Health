const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClaimMasterTempSchema = new Schema({
    // Claim  Based Columns
    Location: {
        type : String,
    },
    ProviderName: {
        type : String,
    },
    PayerName: {
        type : String,
    },
    PatientName: {
        type : String,
    },
    MemberId: {
        type : String,
    },
    Account: {
        type : String,
    },
    DateOfService: {
        type : Date,
        format : "YYYY-MM-DD"
    },
    Aging: {
        type : String,
    },
    PayerMix: {
        type : String,
    },
    Bill: {
        type : String,
    },
    IntialClaimDate: {
        type : Date,
        format : "YYYY-MM-DD"
    },
    ClaimBilledAmount: {
        type : String,
    },
    ClaimPayment: {
        type : String,
    },
    ClaimAdjustemnt: {
        type : String,
    },
    ClaimBalance: {
        type : String,
    },
    Stage: {
        type : String,
    },
    InsuranceCode: {
        type : String,
    },
    RoleResponsibilityCategory: {
        type : String,
    },
    DenialReason: {
        type : String,
    },
    ServiceType: {
        type : String,
    },
    Indication: {
        type : String,
    },
    ClaimStatus: {
        type : String,
    },
    PationtDOB: {
        type : String,
    },
    PayerResponsibility: {
        type : String,
    },
    // Line Based Columns
    FacilityName: {
        type : String,
    },
    Modifier: {
        type : String,
    },
    ProcedureCode: {
        type : String,
    },
    Unit: {
        type : String,
    },
    ProcedureBilledAmount: {
        type : String,
    },
    ProcedurePayment: {
        type : String,
    },
    ProcedureAdjustment: {
        type : String,
    },
    ProcedureBalance: {
        type : String,
    },
    FiledStatus: {
        type : String,
    },
    PatientDOB: {
        type : Date,
        format : "YYYY-MM-DD"
    },
    AdjustmentReason: {
        type : String,
    },
    CompanyName: {
        type : String,
    },
    PayerResponsibility: {
        type : String,
    },
    OrginalICN : {
        type : String,
    },
    Diagnosis: {
        type : String,
    },
    SecondaryInsuranceCompany: {
        type : String,
    },
    DOE: {
        type : String,
    },
    AssignedBy: {
        type : Schema.Types.ObjectId,
        ref : 'users'
    },
    AssignTo: {
        type : Schema.Types.ObjectId,
        ref : 'users'
    },
    Priority:{
        type : Number,
        default:0,
    },
    AssignDate: {
        type : Date,
    },
    SystemStatus : {
        type : String,
    },
    CallerStatusChanged:{
        type : String,
        default : "No"
    },
    CallerStatusChangedDate:{
        type : Date,
    },
    RootCause : {
        type : String,
    },
    Status : {
        type : String,
    },
    PracticeId : {
        type : Schema.Types.ObjectId,
        ref : 'practices'
    },
    PmId : {
        type : Schema.Types.ObjectId,
        ref : 'pm_systems'
    },
    created_by : {
        type : Schema.Types.ObjectId,
        ref : 'users'
    },
    // ClaimBasedStatus : {
    //     type : String,
    // },
    MatchedStatus : {
        type : Boolean, 
        default : false,
    },
    DueDate: {
        type : Date,
    },
    Comments : {
        type : String,
    },
    PCAStatus : {
        type : String,
    },
    PCAStatusDate : {
        type : Date,
    },
    updated_by : {
        type : Schema.Types.ObjectId,
        ref : 'users'
    },
    ClaimStatusId: {
        type : [mongoose.Schema.Types.ObjectId],
        ref : 'claim_status_update'
    },
    LastWorkingDate : {
        type : Date,
        format : "YYYY-MM-DD"
    }
},{
    timestamps: true
});


// ClaimMasterTempSchema.index({ PracticeId:1,created_by:1});
// ClaimMasterTempSchema.index({ PracticeId:-1,created_by:-1});
// ClaimMasterTempSchema.index({ PracticeId:1});
// ClaimMasterTempSchema.index({ PracticeId:-1});
// ClaimMasterTempSchema.index({ PracticeId:1,SystemStatus:1,Aging:1});
// ClaimMasterTempSchema.index({ PracticeId:1,SystemStatus:1});
// ClaimMasterTempSchema.index({ PracticeId:1,created_by:1,Bill:1});
// ClaimMasterTempSchema.index({ PracticeId:-1,created_by:-1,Bill:-1});
module.exports = ClaimMasterTemp = mongoose.model('claimmastertemps',ClaimMasterTempSchema);