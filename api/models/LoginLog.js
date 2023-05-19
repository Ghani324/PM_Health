const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LoginLogSchema = new Schema({
    accessToken: {
        type : String,
    },
    refreshToken : {
        type : String,
    },
    id_token :{
        type : String,
    },
    UserId: {
        type : Schema.Types.ObjectId,
        ref : 'users'
    },
},{
    timestamps: true
});

module.exports = LoginLog = mongoose.model('loginlogs',LoginLogSchema);