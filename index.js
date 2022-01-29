require('dotenv').config()
const express = require('express')
const app = express()
const http = require("http")
const server = http.createServer(app)
const { createSocketServer } = require("./SocketServer")
const cors = require("cors")
const path = require('path')
const bodyParser = require('body-parser')
const routes = require("./routes")
const Authantication_middleware = require("./middleware/Authantication")


app.use(cors())
app.use(bodyParser.json());
app.use('/notes_files',express.static(path.join(__dirname,'assets/note_files')))
app.use(Authantication_middleware)

routes.forEach(route => app.use(route))


app.use(function (error, req, res, next) {
    console.error(error)
    console.log('----------------------------------------')
    res.status(500).send('Something broke!')
})

createSocketServer(server)

let port = process.env.PORT || 4000
server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})