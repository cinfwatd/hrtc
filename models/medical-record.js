var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.Types.ObjectId;

var MedicalRecordSchema = new Schema({
  dateCreated: {type: Date, default: Date.now},
  dateUpdated: Date,
  doctor: [{type: ObjectId, ref: 'User'}],
  symptoms: String,
  admissionStatus: String,
  pulseRate: String,
  systolicRate: String,
  diastolicRate: String,
  heartbeatRate: String
});

var MedicalRecord = mongoose.model('MedicalRecord', MedicalRecordSchema);

module.exports = MedicalRecord;
