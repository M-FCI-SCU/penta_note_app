const { body } = require('express-validator');

module.exports = {
    createNote: [
        body('title')
            .isEmpty().withMessage("Title must be exist")
            .isString().withMessage("Title must be string")
            .isLength({ min: 2}).withMessage("Title must be more than 2 characters"),
        body('body')
            .isEmpty().withMessage("body must be exist")
            .isString().withMessage("body must be string")
            .isLength({ min: 2}).withMessage("body must be more than 2 characters")
        
    ],

}