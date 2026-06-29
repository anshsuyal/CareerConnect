import multer from "multer"
import os from "os"

let storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null, os.tmpdir())
    },
    filename:(req,file,cb)=>{
        // Adding a timestamp to prevent filename collisions in tmp dir
        cb(null, Date.now() + '-' + file.originalname)
    }
})
const upload = multer ({storage})

export default upload