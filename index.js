const express = require('express')
const cors = require('cors')
const multer = require('multer')

const app = express()
app.use(cors())

const port = 8000

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/') // สร้าง folder ชื่อ uploads ใน root directory ของ project
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`
    cb(null, filename) // ใช้ชื่อเดิมของ file แต่เพิ่มเวลาที่ upload ขึ้นไปด้วย
  },
})

// middleware fn คือ function ที่รับ req, res, next และทำการเรียก next() เพื่อทำการเรียก middleware ถัดไป
// วางในตำแหน่งหลัง route ที่ต้องการให้ทำงาน
// ในที่นี้คือ upload.single('test') คือ middleware ที่ใช้ในการ upload file
// test คือชื่อของ input ใน form ที่ใช้ในการ upload file
const upload = multer({
  storage,
  // limits: {
  //   fileSize: 1024 * 1024 * 5, // 5MB
  // },
  // fileFilter: (req, file, cb) => {
  //   if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
  //     // allow
  //     cb(null, true)
  //   } else {
  //     return cb(new Error('Only valid format allowed!'), false)
  //   }
  // },
})

// app.post('/api/upload', upload.single('test'), (req, res) => {
//   res.json({ message: 'File uploaded successfully' })
// })

app.post('/api/upload', (req, res) => {
  upload.single('test')(req, res, (err) => {
    if (err) {
      // res.status(400).json({ message: err.message })
      return res
        .status(400)
        .json({ message: 'upload fail', error: err.message })
    }
    // res.send(req.file)
    res.json({ message: 'File uploaded successfully' })
  })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
