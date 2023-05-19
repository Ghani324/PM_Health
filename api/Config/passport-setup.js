const passport = require("passport");
const OAuth2Strategy = require("passport-oauth2")
const jwt_decode = require('jwt-decode');
const User = require("../models/Users");
const Roles = require("../models/Roles")
const LoginLog = require("../models/LoginLog")
const moment = require("moment-timezone");
moment.tz.setDefault("America/florida");
passport.serializeUser(function (user, done) {
 
  done(null, user);
});

passport.deserializeUser(function (user, done) {

  done(null, user);
});


passport.use(new OAuth2Strategy({
  authorizationURL: 'https://scio.auth.ap-northeast-1.amazoncognito.com/oauth2/authorize',
  tokenURL: 'https://scio.auth.ap-northeast-1.amazoncognito.com/oauth2/token',
  clientID: "7ohqndqn009ji68f4k698g0crn",
  clientSecret: "1s8sie9kjmqecr150qg156gnhsagg1e9uijq487o22m4abahi280",
  callbackURL: "/users/redirect",

},

  async function (accessToken, refreshToken, params, profile, cp) {
   
    var decoded = jwt_decode(accessToken);

    var id_token_decoded = jwt_decode(params.id_token);

    var getRoleName = await Roles.findOneAndUpdate({ role_name: decoded["cognito:groups"][0] }, { $set: 
      { 
        role_name: decoded["cognito:groups"][0],
        status : {
          isDeleted : false
        }
      } 
    }, { upsert: true, new: true })

    const UserData = {
      Status : {
        isDeleted : false
      },
      LoginStatus: true,
      LoginTime: moment.utc(new Date(decoded.auth_time) * 1000).format("YYYY-MM-DD h:mm"),
      UserId: decoded.username,
      RoleName: getRoleName._id,
      PermissionsList : getRoleName.PermissionsList,
      FirstName: id_token_decoded.preferred_username,
      LastName: id_token_decoded.given_name,
      Contact: id_token_decoded.phone_number,
      EmailId: id_token_decoded.email,
      api_token : refreshToken,
      RoleType : getRoleName.role_name
    };
    
    
    await User.findOneAndUpdate({ UserId: decoded.username }, { $set: UserData }, { 
      upsert: true, new: true ,
      select:{api_token:1, ReportingManager:1,RoleName:1,Contact:1,LoginStatus:1,UserId:1,ContactNumber:1,UserName:1,Prefix:1,FirstName:1}
    }).then(async(UpdateData) => {
      
      var TokenData = {
        refreshToken: refreshToken,
        accessToken: accessToken,
        id_token: params.id_token
      }
      await LoginLog.findOneAndUpdate({ UserId: UpdateData._id }, { $set: TokenData }, { upsert: true, new: true })

      return cp(null, UpdateData);
    })
  }
));