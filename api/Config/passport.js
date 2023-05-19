const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = require("../models/Users");
const Roles = require("../models/Roles");
var ObjectID = require('mongodb').ObjectID;
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = "secret";
var adminValue={RoleType : ""};

module.exports = passport =>{
    passport.use(new JwtStrategy(opts, async(jwt_payload,done) =>{
        await Roles.findOne({_id : new ObjectID(jwt_payload.login_data.RoleName)},{role_name:1}).then(async (Data)=>{
            await User.findById(jwt_payload.id).then(async(admin)=>{
                adminValue.RoleType = Data.role_name 
                var final = {...admin._doc,...adminValue}
                if(final != ""){
                    return done(null,final);
                }
                return done(null,false);
            })
        })
    }));
};