import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  name: {
     type: String,
     required: true
  },
  description: {
     type: String,
     required: true
  },
  logo: {
     type: String,
     required: true
  }
});

const companyModel = mongoose.model("Company", companySchema);

export default companyModel;
