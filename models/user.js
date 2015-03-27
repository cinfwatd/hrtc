var mongoose = require('mongoose'),
  bcrypt = require('bcrypt'),
  Schema = mongoose.Schema,
  ObjectId = Schema.Types.ObjectId;



// var user = function(){
var UserSchema = new Schema({
  username: String,
  password: String,
  sessionId: String,
  name: {
    first: String,
    middle: String,
    last: String
  },
  email: String,
  lastLogin: Date,
  resetPassword: {
    token: String,
    expiration: Date
  },
  dateCreated: {type: Date, default: Date.now},
  dateUpdated: Date,
  admin: {
    is: Boolean,
    date: Date,
    by: { type: ObjectId, ref: 'User'}
  },
  doctor: {
    is: Boolean,
    date: Date,
    by: { type: ObjectId, ref: 'User'},
    hospital: {type: ObjectId, ref: 'Hospital'},
    patients: [{type: ObjectId, ref: 'User'}]
  },
  picture: String,
  bioData: {
    dob: Date,
    gender: String,
    about: String,
  },
  // medicalRecord: [{type: ObjectId, ref: 'MedicalRecord'}],
  hospital: [{type: ObjectId, ref: 'Hospital'}]
});

// var User = mongoose.model('User', UserSchema);

UserSchema.virtual('name.full').get(function() {
  var name = this.name.last;
  if (this.name.middle) name += ' ' + this.name.middle;

  return name += ' ' + this.name.first;
});

UserSchema.virtual('bioData.age').get(function() {
  try {
    var dob = this.bioData.dob;
    var today = new Date();
    var age = today.getFullYear() - dob.getFullYear();
    var months = today.getMonth() - dob.getMonth();
    if (months < 0 || (months === 0 && today.getDate() < dob.getDate()))
      age--;
  } catch (error) {
    return "Not specified";
  }

  return age;
});

UserSchema.methods.generateHash = function(password) {
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(password, salt);
  return hash;
}

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
}

var User = mongoose.model('User', UserSchema);

module.exports = User;
