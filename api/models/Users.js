const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsersSchema = new Schema({
    api_token : {
        type : String,
    },
    token : {
        type : String,
    },
    // UserName: {
    //     type : String,
    // },
    UserName: {
        type : Schema.Types.ObjectId,
        ref : 'users'
    },
    RoleName:{
        type : Schema.Types.ObjectId,
        ref : 'roles'
    },
    EmployeeId: {
        type : String,
    },
    Prefix: {
        type : String,
    },
    FirstName: {
        type : String,
        
    },
    LastName: {
        type : String,
    },
    EmailId: {
        type : String,
    },
    Contact: {
        type : String,
    },
    Password: {
        type : String,
    },
    UserId: {
        type : String,
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
    CreatedBy : {
        type : Schema.Types.ObjectId,
        ref : 'users'
    },
    UpdatedBy : {
        type : Schema.Types.ObjectId,
        ref : 'users'
    },
    LoginStatus : {
        type : Boolean,
    },
    LoginTime: {
        type : Date,
    },
    ReportingManager: {
        type : Schema.Types.ObjectId,
        ref : 'users'
    },
    PmId: {
        type : [Schema.Types.ObjectId],
        ref : 'pm_system'
    },
    PracticeId: {
        type : [Schema.Types.ObjectId],
        ref : 'practice'
    }
},{
    timestamps: true
});

module.exports = Users = mongoose.model('users',UsersSchema);