const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PMSystemSchema = new Schema({
    PmId: {
        type : Schema.Types.ObjectId,
        ref : 'pm_system'
    },
    PracticeId: {
        type : Schema.Types.ObjectId,
        ref : 'practice'
    },
    Type : {
        type : String,
    },
    ToMail : {
        type : String,
    },
    CcMail : {
        type : String,
    },
    Subject : {
        type : String,
    },
    Content : {
        type : String,
    },
    AttachmentPath : {
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

module.exports = PMSystem = mongoose.model('message',PMSystemSchema);