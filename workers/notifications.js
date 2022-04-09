const { createClient } = require('redis');
const { Emitter } = require("@socket.io/redis-emitter");
const client = createClient({ host: 'localhost', port: 6379 });
const client1 = createClient({ host: 'localhost', port: 6379 });



(async () => {
    await client.connect()
    await client1.connect()
    const emitter = new Emitter(client1);
     client.subscribe('notifications', (message) => {
        console.log(message); // 'message'
        emitter.emit("test_publisher", message);
    });
})()
