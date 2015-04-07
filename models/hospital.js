var mongoose = require('mongoose')
  Schema = mongoose.Schema,
  ObjectId = Schema.Types.ObjectId;

var HospitalSchema = new Schema({
  name: {type: String},
  active: {type:Boolean, default: true},
  address: String,
});

var Hospital = mongoose.model('Hospital', HospitalSchema);

module.exports = Hospital;
