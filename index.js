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
const upload = multer({ storage })

app.post('/api/upload', upload.single('test'), (req, res) => {
  res.json({ message: 'File uploaded successfully' })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
