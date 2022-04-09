const { query } = require("../DB")
const { v4: uuidv4 } = require('uuid');
var format = require('pg-format');
const SocketServer = require("../SocketServer")
const { getPagination, getPagingData } = require("../middleware/paginate")
const { createClient } = require('redis');
const client = createClient({ host: 'localhost', port: 6379 });
(async () => {
    await client.connect()
})()
exports.createNote = async (req, res, next) => {
    try {
        let id = uuidv4();
        let { title, users_ids, body, note_type_name } = req.body
        // title = "load test note 2"
        // users_ids = "fa022f59-8330-4dfa-9d3f-f806905228b7"
        // body = "load test note 2"
        // note_type_name = "cook"
        let media_files = []
        if (req.files) {
            req.files.map(file => {
                return req.protocol + '://' + req.get('host') + '/notes_files/' + file.filename;
            })
        }
        let created_date = new Date()
        let sql = 'insert into notes(id, sender_id, title, body, note_type_name, media_files, created_date) values($1, $2, $3, $4, $5, $6, $7)'
        let params = [id, req.user.id, title, body, note_type_name, media_files, created_date]
        let result = await query(sql, params)

        users_ids = users_ids.split(',')

        let rows = users_ids.map(user_id => {
            return [user_id, id]
        })

        await query(format('INSERT INTO  note_receivers(user_id, note_id) VALUES %L', rows))
        sql = `select * from user_note_type where user_id in ('${users_ids.join("','")}') and note_type_name=$1 and disabled=$2`
        let results = await query(sql, [note_type_name, true])
        if (results.length) {
            users_ids = users_ids.filter(id => {
                return results.findIndex(user => user.user_id == id) == -1 ? true : false
            })
        }
        console.log('-------------------------Added Note-----------------------------')
        console.log(title)
        client.publish("notifications", JSON.stringify({
            id,
            sender_id: req.user.id,
            title,
            body,
            note_type_name,
            media_files,
            created_date
        }))
        SocketServer.sendNotificationsToUsers(users_ids, {
            id,
            sender_id: req.user.id,
            title,
            body,
            note_type_name,
            media_files,
            created_date
        })
        res.status(200).send({ message: "The note creared successfully" })
    } catch (error) {
        next(new Error(error))
    }
}

exports.getNotes = async (req, res, next) => {
    try {
        let { page, size, note_types } = req.query
        const { limit, offset } = getPagination(page, size);
        let sql = `SELECT count(*) OVER() AS full_count,notes.media_files,
        note_receivers.user_id,note_receivers.note_id,note_receivers.seen,
        notes.note_type_name,
        users.name,users.email,
        notes.title,notes.body,notes.created_date,notes.sender_id
        FROM note_receivers 
        INNER JOIN users
          ON note_receivers.user_id=users.id
        INNER JOIN notes
          ON note_receivers.note_id=notes.id
        LEFT JOIN user_note_type
          ON user_note_type.user_id=note_receivers.user_id AND user_note_type.note_type_name=notes.note_type_name
        WHERE note_receivers.user_id=$1 AND user_note_type.disabled IS NOT true`

        let params = [req.user.id]

        if (note_types && note_types.length) {
            sql += ` AND notes.note_type_name in ('${note_types.join("','")}') `
        }
        sql += ` LIMIT ${limit} OFFSET ${offset}`
        let results = await query(sql, params)

        const response = getPagingData({ results, totalItems: results.length == 0 ? 0 : results[0].full_count }, page, limit);
        res.status(200).send(response)
    } catch (error) {
        next(new Error(error))
    }
}
exports.getNoteTypes = async (req, res, next) => {
    try {
        let sql = 'select * from note_types'
        let params = []
        let result = await query(sql, params)
        res.status(200).send({ note_types: result })
    } catch (error) {
        next(new Error(error))
    }
}

exports.deleteNote = async (req, res, next) => {
    try {
        let { user_id, note_id } = req.body
        let sql = "delete from note_receivers where user_id=$1 and note_id=$2"
        await query(sql, [user_id, note_id])
        res.status(200).send({ message: "The note deleted successfully" })
    } catch (error) {
        next(new Error(error))
    }
}
//=================================================================================
exports.makeNoteSeenForOnlineUsers = async (onlineUsers, noteid) => {
    try {
        let sql = `update note_receivers set seen=$1 where user_id in ('${onlineUsers.join("','")}') and note_id=$2`
        await query(sql, [true, noteid])
    } catch (error) {
        console.log(error)
    }
}

exports.getUserUseSeenNotesSummary = async (user_id) => {
    try {
        let sql = `
        SELECT 
        COUNT(notes.note_type_name) AS number_of_notes,
        notes.note_type_name
        FROM note_receivers 
        INNER JOIN users
        ON note_receivers.user_id=users.id
        INNER JOIN notes
        ON note_receivers.note_id=notes.id
        LEFT JOIN user_note_type
        ON user_note_type.user_id=note_receivers.user_id AND user_note_type.note_type_name=notes.note_type_name
        WHERE note_receivers.user_id=$1 AND user_note_type.disabled IS NOT true AND note_receivers.seen=$2
        GROUP BY notes.note_type_name
        `
        let results = await query(sql, [user_id, false])
        if (results.length) {
            let msg = "You got new"
            results.forEach(element => {
                msg += ` ${element.number_of_notes} ${element.note_type_name} notes,`
            })
            return msg
        } else {
            return false
        }
    } catch (error) {
        console.log(error)
    }
}