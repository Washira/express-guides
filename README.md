# Express Guides

- [Express Guides](#express-guides)
  - [Authentication](#authentication)
    - [1. Set Token in `local storage` and send it to server in header](#1-set-token-in-local-storage-and-send-it-to-server-in-header)
    - [2. Set Token in `cookie` and send it to server](#2-set-token-in-cookie-and-send-it-to-server)
    - [3. Set Token in `session` into server](#3-set-token-in-session-into-server)
  - [File Uploads](#file-uploads)
    - [1. Upload file to server](#1-upload-file-to-server)
    - [2. File Uploads with Progress Bar](#2-file-uploads-with-progress-bar)
    - [3. Validation](#3-validation)
      - [Validation: `size`](#validation-size)
      - [Validation: `mimeType`](#validation-mimetype)
    - [4. Cancel Upload](#4-cancel-upload)
    - [5. Remove File after Cancel Upload](#5-remove-file-after-cancel-upload)
  - [Cache Design Patterns](#cache-design-patterns)
  - [Kafka Distribution System](#kafka-distribution-system)
  - [Elasticsearch](#elasticsearch)
  - [RabbitMQ](#rabbitmq)


## Authentication

command

```bash
npm init -y
npm i cors express mysql2 jsonwebtoken cookie-parser express-session bcrypt
```

### 1. Set Token in `local storage` and send it to server in header

รับ token จาก server แล้วเก็บ token ไว้ใน local storage แล้วมีการส่งไปที่ server ผ่าน header โดยใช้ fetch api

จุดสังเกต จะมีการส่ง token หลังจาก login ผ่าน `response`

```js
res.json({ message: 'Login successfully', token })
```

ส่วน client จะเก็บ token ที่ได้ไว้ใน local storage 

```js
localStorage.setItem('token', response.data.token);
```

เมื่อ request api ผ่าน Promise fn เช่น `axios` มีการส่ง token ผ่าน header ไปด้วย

```js
axios.get('http://localhost:3000/api/user', {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
```

### 2. Set Token in `cookie` and send it to server

ในกรณีที่มีการเก็บ token ไว้ใน cookie แล้วส่งไปที่ server ผ่าน header โดยใช้ fetch api

จุดสังเกต จะมีการส่ง cookie ที่ภายในมี token หลังจาก login ผ่าน `response`

```js
res.cookie('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'none'
}).json({ message: 'Login successfully' });
```

ส่วน client จะเก็บ token ที่ได้ไว้ใน cookie โดยอัตโนมัติ

เมื่อ request api ผ่าน Promise fn เช่น `axios` มีการส่ง `withCredentials: true` แทนการส่ง token ผ่าน header

```js
axios.get('http://localhost:3000/api/user', {
  withCredentials: true
})
```

### 3. Set Token in `session` into server

ในกรณีนี้ server มีการเก็บ token ไว้ใน `session` ซึ่งเป็นการเก็บข้อมูลไว้ใน server โดยตรง

จุดสังเกต จะมีการส่ง `session` ที่ภายในมี token หลังจาก login ผ่าน `response`

```js
req.session.token = token;
res.json({ message: 'Login successfully' });
```

ส่วน client จะไม่ต้องทำอะไรเพิ่มเติม ตอนส่ง request api ผ่าน Promise fn เช่น `axios` ไม่ต้องส่ง token ไปด้วย
มีการส่ง `withCredentials: true` แค่อย่างเดียว เหมือนกับกรณีที่เก็บ token ไว้ใน `cookie`

```js
axios.get('http://localhost:3000/api/user', {
  withCredentials: true
})
```

วิธีการนี้ จะเป็นการพึ่งพาการเก็บข้อมูลไว้ใน server โดยตรง และไม่ต้องเก็บข้อมูลไว้ที่ client และไม่ต้องส่งข้อมูลไปที่ server ทุกครั้งที่ request api

## File Uploads

### 1. Upload file to server

เป็นการเก็บ Binary Format (ฺฺBlob) ของไฟล์ไว้ใน server โดยตรง

### 2. File Uploads with Progress Bar

ใน `axios` มีการส่ง `onUploadProgress` ที่เป็น callback function ที่จะทำงานเมื่อมีการ upload file โดยจะส่งค่าเป็น `event` ที่มีค่า `loaded` และ `total` ที่เป็นขนาดของไฟล์ที่ถูก upload และขนาดของไฟล์ทั้งหมด

```js
const response = await axios
  .post('http://localhost:8000/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: function(progressEvent) {
      // เพิ่ม update progress กลับเข้า UI ไป
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      progressBar.value = percentCompleted
      uploadPercentageDisplay.innerText = `${percentCompleted}%`
    },
  })
```

### 3. Validation

เราสามารถ validate ไฟล์ที่ upload ได้ทั้งที่ client และ server โดยสามารถ validate ได้ทั้งขนาดของไฟล์และประเภทของไฟล์

#### Validation: `size`

client สามารถทำการ validate ไฟล์ก่อนที่จะส่งไปที่ server ได้เช่น ตรวจสอบขนาดของไฟล์

```js
const selectedFile = fileInput.files[0]
if (selectedFile.size > 1024 * 1024 * 5) {
  return alert('Too large file, please choose a file smaller than 5MB')
}
```

server สามารถทำการ validate ไฟล์ที่ได้รับได้เช่น ตรวจสอบขนาดของไฟล์ และประเภทของไฟล์

```js
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
})
```

#### Validation: `mimeType`

`mimeType` คือประเภทของไฟล์ เช่น `image/jpeg`, `image/png`, `application/pdf` เป็นต้น ไม่เกี่ยวกันกับนามสกุลของไฟล์

client สามารถทำการ validate ไฟล์ก่อนที่จะส่งไปที่ server ได้เช่น ตรวจสอบประเภทของไฟล์

```js
const selectedFile = fileInput.files[0]
if (!['image/jpeg', 'image/png', 'application/pdf'].includes(selectedFile.type)) {
  return alert('Invalid file type, please choose a valid file type')
}
```

server สามารถทำการ validate ไฟล์ที่ได้รับได้เช่น ตรวจสอบประเภทของไฟล์

```js
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'application/pdf'].includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'))
    }
  },
})
```
เพื่อให้เอา error ที่เกิดขึ้นไปใช้งานต่อไป
เราจึงปรับ `app.post` จากการใส่ middleware `upload.single('test')` เป็นการใข้ `upload.array('test')` ภายในแทน

```js
app.post('/api/upload', (req, res) => {
  upload.single('test')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: 'Multer error' })
    }
    res.json({ message: 'File uploaded successfully' })
  })
})
```

### 4. Cancel Upload

ในฝั่ง client สามารถใช้ `axios` ในการ cancel upload ได้โดยใช้ `CancelToken` และ `source` ในการสร้าง `CancelToken` และ `cancel` ในการยกเลิกการ upload

ใน `<script>...</script>` ให้สร้างตัวแปร `let currentSource = null` ไว้เพื่อเก็บ `source` ที่สร้างขึ้น

จากนั้น ใน `uploadFile` ให้สร้าง `source` และเก็บไว้ใน `currentSource` และเมื่อมีการกดปุ่ม `cancel` ให้เรียก `cancelUploadBtn` ซึ่งจะเรียก `cancel` ของ `source` ที่เก็บไว้ใน `currentSource`

```js
const source = axios.CancelToken.source() // สร้าง cancel token ขึ้นมา
currentSource = source // เก็บ current source ไว้เพื่อใช้ในการ cancel ไฟล์
```

เพิ่ม `cancelToken: source.token` ไปใน `axios` ที่ส่งไปที่ server

```js
const response = await axios.post('http://localhost:8000/api/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  onUploadProgress: function(progressEvent) {
    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
    progressBar.value = percentCompleted
    uploadPercentageDisplay.innerText = `${percentCompleted}%`
  },
+ cancelToken: source.token, // ส่ง cancel token ไปให้ server
})
```

สร้าง `cancelUploadBtn` ซึ่งจะเรียก `cancel` ของ `source` ที่เก็บไว้ใน `currentSource`

```js
const cancelUploadBtn = () => {
  if (currentSource) {
    currentSource.cancel('Operation canceled by the user.')
  }
}
```

แล้วนำ `cancelUploadBtn` ไปใช้ในปุ่ม `cancel` ที่สร้างขึ้น

```html
<button onclick="cancelUploadBtn()">Cancel</button>
```

### 5. Remove File after Cancel Upload

เมื่อมีการ cancel upload ไฟล์ ให้ทำการลบไฟล์ที่ถูก upload ออกจาก server

```js
const fs = require('fs')
const path = require('path')
```

เพิ่ม event listener ใน `filename` ของ `diskStorage` ที่จะทำการลบไฟล์ที่ upload ออกจาก server เมื่อมีการ cancel upload

```js
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/') // สร้าง folder ชื่อ uploads ใน root directory ของ project
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`
    cb(null, filename) // ใช้ชื่อเดิมของ file แต่เพิ่มเวลาที่ upload ขึ้นไปด้วย
+    req.on('aborted', () => {
+     // ถ้าเกิด error ในการ upload จะทำการลบ file ที่ upload ไปแล้ว
+     const filePath = path.join('uploads', filename)
+     fs.unlinkSync(filePath)
+   })
  },
})
```

## Cache Design Patterns

## Kafka Distribution System

## Elasticsearch

## RabbitMQ