const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserDatatableColumnsSchema = new Schema({
    PageType: {
        type: String
    },
    Columns: [{
        value: {
            type : Boolean,
        },
        label: {
            type : String,
        },
    }],
    UserId: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
},{
    timestamps: true
});

module.exports = UserDatatableColumns = mongoose.model('userdatatablecolumns', UserDatatableColumnsSchema);