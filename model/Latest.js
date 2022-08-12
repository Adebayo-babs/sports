const mongoose = require('mongoose');
const marked = require('marked');
const slugify = require('slugify');

const latestNewsSchema = new mongoose.Schema({

    title:{
        type:String,
        required:true
    },
    subtitle:{
        type:String,
        required:true
    },
    category:{
            type:String,
            required:true
    },
    article:{
        type:String,
        required:true  
    },
    slug: {
        type: String,
        required: true,
        unique: true
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

latestNewsSchema.pre('validate', function(next) {
  if (this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true })
  }

  next()
})

 module.exports = mongoose.model('Latest', latestNewsSchema)