var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var app = require('./app');

if (cluster.isMaster) {
  console.log('Fork %s worker(s) from master', numCPUs);
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('online', function(worker) {
    console.log('Worker is running on %s pid', worker.process.pid);
  });
  cluster.on('exit', function(worker, code, signal) {
    console.log('Worker with %s is closed', worker.process.pid);
  })
} else {
  var port = 3000;
  console.log('Worker (%s) is now listening to http://localhost:%s',
    cluster.worker.process.pid, port);
    app.get('*', function(request, response) {
      response.send(200, 'Handled by %s', cluster.worker.process.pid);
    });

    app.listen(port);
}
