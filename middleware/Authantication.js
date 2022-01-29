const userController = require("../controllers/user")
var jwt = require('jsonwebtoken');

const Authantication_middleware = async (req, res, next) => {
    try {

        if (req.originalUrl == "/login" || req.originalUrl == "/register") {
            next()
        } else {
            const authHeader = req.get('Authorization')
            if (!authHeader) {
                const err = new Error('Not Authenticated')
                err.statusCode = 401
                throw err
            } else {
                var decoded = jwt.verify(authHeader, process.env.JWTSECRETKEY);
                let results = await userController.findUserByEmail(decoded.email)
                if (results.length) {
                    req.user = results[0]
                } else {
                    const err = new Error('Not Authenticated')
                    error.statusCode = 401
                    throw err
                }
            }
            next()
        }
    } catch (error) {
        next(new Error(error))
    }
}

module.exports = Authantication_middleware