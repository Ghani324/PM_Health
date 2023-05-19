process.env.TZ = "Etc/GMT";
var port = process.env.PORT || 3001;
var cCPUs = require('os').cpus().length;
const cluster = require("cluster");
const express = require('express');
const passport = require('passport');
const app = express();
app.use(express.json());
const moment = require("moment-timezone");
moment.tz.setDefault("America/florida");
const mongoose = require('mongoose');
const routerlog = require("./Config/routerlog")
const PmSystemRouter = require("./routes/PmSystem");
const path = require("path");
const PracticeRouter = require("./routes/Practice");
const PCA = require("./routes/PCA")
const UsersRouter = require("./routes/Users");
const CreateUserRouter = require("./routes/CreateUser");
const RolesRouter = require("./routes/Roles");
const ClaimMasterRouter  =require("./routes/ClaimMaster")
const ClaimColumns = require("./routes/ClaimColumns");
const ArScenario = require("./routes/ArScenario");
const PracticeSummary = require("./routes/PracticeSummary")
const ChargesByLocation = require("./routes/ChargesByLocation")
const ChargesByProvider = require("./routes/ChargesByProvider")
const DenialReports=require("./routes/DenialReports")
const db = require('./Config/dbconfig').mongoURI;
var MySqlDb = require('./Config/database');
var cookieParser = require('cookie-parser')
app.use(passport.initialize());
require('./Config/passport')(passport);
app.use(cookieParser())

app.use(passport.session());

process.on('uncaughtException', (err) => {
  console.log("err",err)
  routerlog.info(`Error Handling`,JSON.stringify(err))
});


mongoose.connect(db, {
    keepAlive: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));
mongoose.set('debug', true);
// app.use(bodyParser.urlencoded({extended:false}));
// app.use(bodyParser.json());
app.use(express.static('dist'));
app.use(express.static('build'));
app.use(express.static(__dirname + '/ClaimsUpload'));
app.use(express.static('dist'));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));


//Add headers
app.use(function (req, res, next) {

    //Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    res.setHeader("Access-Control-Allow-Headers", "x-access-token, mytoken");
    // Pass to next layer of middleware
    next();
});

app.use("/api/pmsystem",PmSystemRouter);
app.use("/api/practice",PracticeRouter);
app.use("/users",UsersRouter);
app.use('/api/roles',RolesRouter);
app.use('/api/createuser',CreateUserRouter);
app.use('/api/Claims',ClaimMasterRouter);
app.use('/api/claimColumns',ClaimColumns);
app.use('/api/PCA',PCA);
app.use('/api/ArScenario',ArScenario);
app.use('/api/PracticeSummary',PracticeSummary)
app.use('/api/ChargesByLocation',ChargesByLocation)
app.use('/api/ChargesByProvider',ChargesByProvider)
app.use("/api/DenialReports",DenialReports)



app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname, '/../build/index.html'), function(err) {
      if (err) {
        res.status(500).send(err)
      }
    })
  })
//app.listen(port, () => console.log(`Listening on port  ${port}`));
if (cluster.isMaster) {
    // Create a worker for each CPU
    for (var i = 0; i < cCPUs; i++) {
        cluster.fork();
    }
    cluster.on('online', function(worker) {
    });
    cluster.on('exit', function(worker, code, signal) {
    });
} else {
    app.listen(port, () => console.log(`Listening on port  ${port}`));
}