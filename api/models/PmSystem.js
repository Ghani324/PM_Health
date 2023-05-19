const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PMSystemSchema = new Schema({
    
    PmName : {
        type : String,
        required: true,
        validate: {
            validator: Validate,
            description: `PM Name is Required ...!`,
        },
    },
    ClaimLevel: {
        type : String,
        required: true,
        validate: {
            validator: Validate,
            description: `Practice Name is Required ...!`,
        },
    },
    Status : {
        isArchived : {
            type : Boolean, 
            default : false,
        },
        isDeleted : {
            type : Boolean, 
            default : false,
        },
    },
    Practice: {
        type : [mongoose.Schema.Types.ObjectId],
        ref : 'practice',
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

function Validate(value) {
    if (!this.PmName) {
        return false;
    }
    if (!this.ClaimLevel) {
        return false;
    }
    return true; 
}
module.exports = PMSystem = mongoose.model('pm_system',PMSystemSchema);