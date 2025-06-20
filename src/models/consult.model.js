//model to store the consultation requests received 

import mongoose from 'mongoose';

const consultSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    company:{
        type:String,
    },
    phone:{
        type:String,
    },
    interest:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true
    },
},{timestamps: true});

const consultModel = mongoose.model('Consult', consultSchema);
export default consultModel;