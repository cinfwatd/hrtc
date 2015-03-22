var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.Types.ObjectId;

var EventSchema = new Schema({
  title: String,
  description: String,
  start: Date,
  end: Date,
  allDay: Boolean,
  className: String,
  user: {type: ObjectId, ref: 'User'}
});

var Events = mongoose.model('Events', EventSchema);
module.exports = Events;
