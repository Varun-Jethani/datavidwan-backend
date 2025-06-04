import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    subject: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 200,
    },
    message: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 1000,
    },
},{timeseries: true});

const ContactModel = mongoose.model("Contact", contactSchema);

export default ContactModel;
