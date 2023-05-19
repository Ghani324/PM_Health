const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ARDetailsSchema = new Schema({
    // AgingDetails: [{
    //     Month : {
    //         type : String
    //     },
    //     Aging : {
    //         type : String
    //     },
    //     TouchedAmount : {
    //         type : String
    //     },
    //     UnTouchedAmount : {
    //         type : String
    //     },
    //     TouchedCount : {
    //         type : String
    //     },
    //     UnTouchedCount : {
    //         type : String
    //     },
    //     PracticeId : {
    //         type : Schema.Types.ObjectId,
    //         ref : 'practices'
    //     },
    //     created_by : {
    //         type : Schema.Types.ObjectId,
    //         ref : 'users'
    //     },
    //     updated_by : {
    //         type : Schema.Types.ObjectId,
    //         ref : 'users'
    //     },
    // }],
    Month : {
        type : String
    },
    Aging : {
        type : String
    },
    TouchedAmount : {
        type : String
    },
    UnTouchedAmount : {
        type : String
    },
    TouchedCount : {
        type : String
    },
    UnTouchedCount : {
        type : String
    },
    PracticeId : {
        type : Schema.Types.ObjectId,
        ref : 'practices'
    },
    created_by : {
        type : Schema.Types.ObjectId,
        ref : 'users'
    },
    updated_by : {
        type : Schema.Types.ObjectId,
        ref : 'users'
    },
},{
    timestamps: true
});

module.exports = ARDetails = mongoose.model('ardetails',ARDetailsSchema);