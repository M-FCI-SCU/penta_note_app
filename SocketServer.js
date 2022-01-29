const socketio = require("socket.io")
const { noteController } = require("./controllers")
var users = []
var io = null

exports.createSocketServer = (server) => {
    io = socketio(server, {
        cors: {
            origin: "*",
        }
    })

    io.on("connection", socket => {
        console.log(socket.id)
        console.log("user connected")

        socket.on("userid", async ({ userid }) => {
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
