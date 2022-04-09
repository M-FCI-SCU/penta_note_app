module.exports = {
  apps : [{
    name:"app",
    script: 'index.js',
    watch: true,
    autorestart: true,
    instances : 6,
    exec_mode : "cluster"
  }, {
    name: "worker1",
    // instances : 3,
    script: './workers/notifications.js',
    watch: ['./workers']
  }],

};
