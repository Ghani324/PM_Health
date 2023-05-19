const CognitoExpress = require('cognito-express')
const AwsConfig = require("../Config/AwsConfig");
const jwt_decode = require('jwt-decode');
const Role = require("../models/Roles")
var ObjectID = require('mongodb').ObjectID;

// Setup CognitoExpress
const cognitoExpress = new CognitoExpress({
    region: AwsConfig.Pool_Region,
    cognitoUserPoolId: AwsConfig.cognitoUserPoolId,
    tokenUse: "access",
    tokenExpiration: 3600
})
    

const authCheck = async (req, res, next) => {
 
    if (!req.cookies.session) {
      res.redirect("/users/redirect")
    } else {
      var decoded = jwt_decode(req.cookies.session, { header: true });
      var User = decoded.passport.user
      var Data = await Role.findOne({ _id : new ObjectID(User.RoleName) })
      Object.assign(User,{RoleType:Data.role_name})
      req.user = User
      next();
    }
};

module.exports = authCheck