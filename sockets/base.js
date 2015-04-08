module.exports = function(io) {
  'use strict';
  io.on('connection', function(socket) {
    socket.on('join', function(data) {
      socket.join(data.user);
      console.log('User jooiined'.red, JSON.stringify(data));
    });


    socket.on('message', function(data) {
      io.to(data.receiver._id).emit('new_msg', data);
    });
  });
};
