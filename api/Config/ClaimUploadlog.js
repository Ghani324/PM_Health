const SimpleNodeLogger = require('simple-node-logger');
const opts = {
    logFilePath:'ClaimUploadlog.log',
    timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
};
const ClaimUploadlog = SimpleNodeLogger.createSimpleLogger(opts);
module.exports = ClaimUploadlog;