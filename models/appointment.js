var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.Types.ObjectId;

var AppointmentSchema = new Schema({
  dateCreated: {type: Date, default: Date.now},
  doctor: ObjectId,
  patient: ObjectId,
  date: Date,

});

var Appointment = mongoose.model('Appointment', AppointmentSchema);
