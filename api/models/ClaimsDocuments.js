const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClaimDocumentSchema=mongoose.Schema({
    ClaimId:{
        type:mongoose.Schema.Types.ObjectId,
        ref : 'claim_masters'
    
    },
    CreatedBy : {
        type : Schema.Types.ObjectId,
        ref : 'users'
    },
    UpdatedBy : {
        type : Schema.Types.ObjectId,
        ref : 'users'
    },
    ProviderName:{
        type:String
    },
    PatientName:{
        type:String
    },
    PayerName:{
        type:String
    },
    FileName:{
        type:String
    }
},{
    timestamps: true
})

module.exports=ClaimDocument=mongoose.model('claimdocuments',ClaimDocumentSchema)