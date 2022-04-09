const socketio = require("socket.io")
const { createClient } = require('redis');
const { createAdapter } = require("@socket.io/redis-adapter");
const { setupWorker } = require("@socket.io/sticky");
const { noteController } = require("./controllers")
var users = []
var io = null

const pubClient = createClient({ host: 'localhost', port: 6379 });
const subClient = pubClient.duplicate();

exports.createSocketServer = async (server) => {
    await pubClient.connect()
    await subClient.connect()
    io = socketio(server, {
        cors: {
            origin: "*",
        },
        adapter: createAdapter(pubClient, subClient)
    })

    setupWorker(io)


    io.on("connection", socket => {


        socket.on("userid", async ({ userid, email }) => {
            console.log("user connected")
            console.log(socket.id)
            console.log(email)
            addUser({ userid, socketid: socket.id })
            let result = await noteController.getUserUseSeenNotesSummary(userid)
            if (result) {
                io.to(socket.id).emit("notification_summary", { notification_summary: result })
            }
        })
        socket.on("disconnect", () => {
            removeUser(socket.id)
            console.log("user disconnected")
        })
    })
}
function addUser(payload) {
    users.push(payload)
}
function findUser(userid) {
    let user = users.find(user => user.userid == userid)
    return user ? user : null
}
function removeUser(socketid) {
    let index = users.findIndex(user => {
        return user.socketid == socketid
    })

    users.splice(index, 1)
}
exports.sendNotificationsToUsers = (users_ids, note) => {
    let onlineUsers = []

    users_ids.forEach(userid => {
        let user = findUser(userid)
        if (user) {
            onlineUsers.push(userid)
            io.to(user.socketid).emit("new_note", { note });
        }
    });
    if (onlineUsers.length) {
        noteController.makeNoteSeenForOnlineUsers(onlineUsers, note.id)
    }
}
