const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClaimStatusUpdateSchema = new Schema({

    ClaimId: {
        type : Schema.Types.ObjectId,
        ref : 'claim_masters'
    },
    UserId: {
        type : Schema.Types.ObjectId,
        ref : 'users'
    },
    ClaimPracticeId: {
        type : Schema.Types.ObjectId,
        ref : 'practices'
    },
    StatusCode  :{
        type : String,
    },
    DueDate: {
        type : Date,
    },
    Comments: {
        type : String,
    },
    RootCause: {
        type : String,
    },
    Type: {
        type : String,
    },
    CreatedBy : {
        type : Schema.Types.ObjectId,
        ref : 'users'
    }
},{
    timestamps: true
});

module.exports = ClaimStatusUpdate = mongoose.model('claimstatusupdate',ClaimStatusUpdateSchema);