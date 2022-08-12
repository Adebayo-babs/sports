const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({

    cName:{
        type:String,
        required:true
    },
    cEmail:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true  
    },

    password:{
        type:String,
        required:true
    },

    upload:{
        data:Buffer,
        contentType: String
    },

    date:{
        type:Date,
        default:Date.now
        
    }

});

 module.exports = mongoose.model('Admin', adminSchema)