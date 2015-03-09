var mongoose = require('mongoose')
  Schema = mongoose.Schema,
  ObjectId = Schema.Types.ObjectId;

var HospitalSchema = new Schema({
  name: {type: string, index: true},
  active: Boolean,
  address: String,
  doctors: [{type: ObjectId, ref: 'User'}]
});

var Hospital = mongoose.model('Hospital', HospitalSchema);

module.exports = Hospital;
