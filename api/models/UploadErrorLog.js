
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FileUploadLogsSchema = new Schema({
   
    LogId: {
        type : Schema.Types.ObjectId,
        ref : 'users'
    },
    RowNo : {
        type : String,
    },
    ErrorMsg: {
        type : String,
    },
    Status: {
        type : String,
    }
},{
    timestamps: true
});

module.exports = FileUploadLogs = mongoose.model('uploaderrorlog',FileUploadLogsSchema);
