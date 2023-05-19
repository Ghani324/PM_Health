
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FileUploadLogsSchema = new Schema({
    
    PmId: {
        type : Schema.Types.ObjectId,
        ref : 'pm_system'
    },
    PracticeId: {
        type : Schema.Types.ObjectId,
        ref : 'practice'
    },
    UserId: {
        type : Schema.Types.ObjectId,
        ref : 'users'
    },
    FileName : {
        type : String,
    },
    TotalNumOfRecords: {
        type : String,
    },
    SuccessRecords: {
        type : String,
    },
    FailedRecords: {
        type : String,
    },
    ErrorMsg: {
        type : String,
    },
    CreatedBy : {
        type : Schema.Types.ObjectId,
        ref : 'users'
    },
    UpdatedBy : {
        type : Schema.Types.ObjectId,
        ref : 'users'
    }
},{
    timestamps: true
});

module.exports = FileUploadLogs = mongoose.model('fileuploadlog',FileUploadLogsSchema);
