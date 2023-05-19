// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const CreateUserSchema = new Schema({
//     UserName:{
//         type : String,
//     },
//     RoleName:{
//         type : String,
//     },
//     Prefix:{
        
//         type : String,
//     },
//     ReportingManager:{
//         type : String,
//     },
//     FirstName:{
//         type : String,
//     },
//     LastName:{
//         type : String,
//     },
//     PmId: {
//         type : Schema.Types.ObjectId,
//         required: true,
//         ref : 'pm_system',
//         validate: {
//             validator: Validate,
//             description: `PM ID is Required ...!`,
//         },
//     },
//     PracticeId: {
//         type : Schema.Types.ObjectId,
//         required: true,
//         ref : 'practices',
//         validate: {
//             validator: Validate,
//             description: `Practice ID is Required ...!`,
//         },
//     },
    
//     Contact:{
//         type : Number,
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
//     DisplayNames:[{
//         value: {
//             type : String,
//         },
//         label: {
//             type : String,
//         },
//     }],
//     CreatedBy : {
//         type : Schema.Types.ObjectId,
//         ref : 'users'
//     },
//     UpdatedBy : {
//         type : Schema.Types.ObjectId,
//         ref : 'users'
//     }
// },{
//   timestamps: true
// });

// function Validate(value) {
//     if (!this.PracticeId) {
//         return false;
//     }
//     if (!this.PmId) {
//         return false;
//     }
    
//     return true; 
// }
// module.exports = CreateUser = mongoose.model('createuser',CreateUserSchema);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsersSchema = new Schema({
    // api_token : {
    //     type : String,
    // },
    // token : {
    //     type : String,
    // },
    EmployeeId: {
        type : String,
    },
    role: {
        type : String,
    },
    prefix: {
        type : String,
    },
    reporting_manager:{
        type : String,
    },
    first_name: {
        type : String,
        
    },
    last_name: {
        type : String,
    },
    pm_system: {
        type : [Schema.Types.ObjectId],
        ref : 'pm_system'
    },
    practice_name: {
        type : [Schema.Types.ObjectId],
        ref : 'practice'
    },
    contact_number: {
        type : String,
    },
  
    
},{
    timestamps: true
});

module.exports = CreateUser = mongoose.model('createuser',UsersSchema);