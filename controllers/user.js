const { query } = require("../DB")
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

exports.register = async (req, res, next) => {
    try {
        let { name, email, password } = req.body
        password = await bcrypt.hash(password, 10)
        let id = uuidv4();
        let sql = 'insert into users(id, name, email, password) values($1, $2, $3, $4)'
        let params = [id, name, email, password]
        await query(sql, params)
        res.status(200).send({ message: "The user creared successfully" })


    } catch (error) {
        next(new Error(error))
    }
}
exports.login = async (req, res, next) => {
    try {
        let { email, password } = req.body
        let sql = "select * from users where email=$1 limit 1"
        let params = [email]

        let result = await query(sql, params)
        if (result.length) {
            let user = result[0]
            const match = await bcrypt.compare(password, user.password)
            if (match) {
                let token = await jwt.sign({id: user.id, email: user.email }, process.env.JWTSECRETKEY);
                return res.status(200).send({token,userid: user.id})
            }
        }
        throw new Error('Email or password are wrong!');

    } catch (error) {
        next(new Error(error))
    }
}
exports.getUsers = async (req, res, next) => {
    try {
        let sql = 'select * from users'
        let params = []
        let result = await query(sql, params)
        res.status(200).send({ users: result })
    } catch (error) {
        next(new Error(error))
    }
}
//===================================================
exports.findUserByEmail = async (email) => {
        let sql = "select * from users where email=$1 limit 1"
        let params = [email]
        let results = await query(sql, params)

        return results


}
// exports.findUserById = async (id) => {
//     try {

//     } catch (error) {
//         console.log(error)
//     }
// }



