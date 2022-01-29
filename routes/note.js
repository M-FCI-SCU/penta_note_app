
const express = require('express')
const router = express.Router();
const {noteController} = require('../controllers')
const {upload} = require("../middleware/File")
const validate = require("../middleware/validate")

router.post('/create_note',upload.array('file', 12), noteController.createNote)
router.get('/get_note_types', noteController.getNoteTypes  )
router.get('/get_notes', noteController.getNotes  )
router.post('/delete_note', noteController.deleteNote  )


module.exports = router
