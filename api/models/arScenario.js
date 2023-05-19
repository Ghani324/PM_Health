const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const arScenarioSchema = new Schema({
    type : {
        type : String
    },
    label : {
        type : String
    },
    value : {
        type : String
    },
});

module.exports = ArScenario = mongoose.model('arscenario',arScenarioSchema);