var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.Types.ObjectId;

var AppointmentSchema = new Schema({
  dateCreated: {type: Date, default: Date.now},
  doctor: ObjectId,
  patient: ObjectId,
  message: String,
  chat: {
    video: Boolean,
    text: Boolean,
    start: Date,
    end: Date
  },
  status: {
    granted: {type: Boolean, default: false},
    expired: {type: Boolean, default: false},
    read: {type: Boolean, default: false},
    deleted: {type: Boolean, default: false}
  }
});

var Appointment = mongoose.model('Appointment', AppointmentSchema);
module.exports = Appointment;
