var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.Types.ObjectId;

var MedicalRecordSchema = new Schema({
  patient: {type: ObjectId, ref: 'User'},
  doctor: {type: ObjectId, ref: 'User'},
  dateCreated: {type: Date, default: Date.now},
  dateUpdated: Date,
  symptoms: String,
  admissionStatus: String,
  pulseRate: String,
  systolicRate: String,
  diastolicRate: String,
  heartbeatRate: String
});

var MedicalRecord = mongoose.model('MedicalRecord', MedicalRecordSchema);

module.exports = MedicalRecord;
