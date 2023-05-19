const SimpleNodeLogger = require('simple-node-logger');
const opts = {
    logFilePath:'routerlog.log',
    timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
};
const routerlog = SimpleNodeLogger.createSimpleLogger(opts);
module.exports = routerlog;