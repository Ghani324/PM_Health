const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const claimandlineSchema = new Schema({

    ColumnName : {
        type : String
    },
    isActive : {
        isArchived : {
            type : Boolean, 
            default : false,
        },
        isDeleted : {
            type : Boolean, 
            default : false,
        }
    },
    ClaimLevel : {
        type : String
    },
    CreatedBy : {
        type : Schema.Types.ObjectId,
        ref : 'users'
    },
    UpdatedBy : {
        type : Schema.Types.ObjectId,
        ref : 'users'
    }
},
{
    timestamps: true
});

module.exports = ClaimandLine = mongoose.model('claim_column',claimandlineSchema);