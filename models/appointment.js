var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.Types.ObjectId,
  paginate = require('mongoose-paginate');

var AppointmentSchema = new Schema({
  dateCreated: {type: Date, default: Date.now},
  sender: {type: ObjectId, ref: 'User'},
  receiver: {type: ObjectId, ref: 'User'},
  message: String,
  subject: {type: String, default: 'Request for Appointment'},
  chat: {
    start: Date,
    end: Date
  },
  status: {
    granted: {type: Boolean, default: false},
    expired: {type: Boolean, default: false},
    read: {type: Boolean, default: false},
    softDeleted: [ObjectId],
    hardDeleted: [ObjectId]
  },
  attachment: {
    attached: {type: Boolean, default: false},
    content: [String]
  }
});
AppointmentSchema.plugin(paginate);

var Appointment = mongoose.model('Appointment', AppointmentSchema);
module.exports = Appointment;
