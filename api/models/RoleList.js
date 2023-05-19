
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoleListSchema = new Schema({

    label: {
        type: String,
    },
    value: {
        type: String,
    },
    AttributesList: [{
        label: {
            type: String,
        },
        value: {
            type: Boolean,
        }
    }],
},
{
    timestamps: true
});

module.exports = RoleList = mongoose.model('rolelist', RoleListSchema);