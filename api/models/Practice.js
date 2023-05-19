const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PracticeSchema = new Schema({

    PracticeName: {
        type : String,
        required: true,
        validate: {
            validator: Validate,
            description: `Practice Name is Required ...!`,
        },
    },
    PmId: {
        type : Schema.Types.ObjectId,
        required: true,
        ref : 'pm_system',
        validate: {
            validator: Validate,
            description: `PM ID is Required ...!`,
        },
    },
    Status : {
        isArchived : {
            type : Boolean, 
            default : false
        },
        isDeleted : {
            type : Boolean, 
            default : false
        },
    },
    DisplayNames:[{
        value: {
            type : String,
        },
        label: {
            type : String,
        },
    }],
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
    if (!this.PracticeName) {
        return false;
    }
    if (!this.PmId) {
        return false;
    }
    
    return true; 
}
module.exports = Practice = mongoose.model('practice',PracticeSchema);