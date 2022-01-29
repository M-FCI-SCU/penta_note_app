const multer = require('multer')
const fs = require('fs')

const fileStorage = multer.diskStorage({
  destination:(req,file,cb) =>{
      cb(null,'assets/note_files/')
  },
  filename: (req,file,cb) => {
      cb(null ,  Date.now()+'_'+file.originalname)
  }
})

var upload = multer({ storage: fileStorage,limits: { fileSize: 1700000 } })

// const deleteFile = (filepath) => {
//     fs.unlink(filepath, (err) => {
//         if(err){
//             console.log(err)
//         }
//     })
// }
module.exports ={
    fileStorage,
    upload,
    // deleteFile
}