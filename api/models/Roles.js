// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const RoleSchema = new Schema({
//     RoleName: {
//         type : String,
//     },
//     Description: {
//         type : String,
//     },
//     Status : {
//         isArchived : {
//             type : Boolean, 
//             default : false
//         },
//         isDeleted : {
//             type : Boolean, 
//             default : false
//         },
//     },
//     CreatedBy : {
//         type : Schema.Types.ObjectId,
//         ref : 'users'
//     },
//     UpdatedBy : {
//         type : Schema.Types.ObjectId,
//         ref : 'users'
//     }
// },{
//     timestamps: true
// });

// module.exports = Roles = mongoose.model('role',RoleSchema);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoleSchema = new Schema({
    role_name: {
        type: String,
    },
    description: {
        type: String,
    },
    Status: {
        type: String,
    },
    status: {
        isArchived: {
            type: Boolean,
            default: false
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
    },
    CreatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    UpdatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    PermissionsList : [{
        label : {
            type: String,
        },
        value : {
            type: Boolean,
        }
    }]
},

    {
        timestamps: true
    });

module.exports = Role = mongoose.model('role', RoleSchema);