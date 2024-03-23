const express = require('express')
const bodyParser = require('body-parser')
const redis = require('redis')
const mysql = require('mysql2/promise')
const cron = require('node-cron')

const app = express()
app.use(bodyParser.json())

const port = 8000
let mySqlConn = null
let redisConn = null

const initMySql = async () => {
  mySqlConn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'tutorial',
  })
}

const initRedis = async () => {
  redisConn = redis.createClient()
  redisConn.on('error', (err) => {
    console.log('Redis error: ' + err)
  })
  await redisConn.connect()
}

/*
 * Sequent นี้เป็นการเรียกข้อมูลจาก MySQL และเก็บลงใน Redis
 * โดยเราจะเรียกข้อมูลจาก Redis ก่อน ถ้ามีข้อมูลอยู่ใน Redis ก็จะส่งข้อมูลจาก Redis กลับไป
 * Redis มีการเก็บเป็น key:value ซึ่ง value ต้องเป็น string
 * ทำให้ ต้องแปลง json เป็น string ก่อน set
 * และเมื่อเรียกข้อมูลจาก Redis ก็ต้องแปลง string เป็น json ก่อนส่งกลับไป
 */
app.get('/users', async (req, res) => {
  const cachedData = await redisConn.get('users')
  if (cachedData) {
    console.log('Cached data: ', cachedData)
    console.log('Get data from Redis')
    res.json(JSON.parse(cachedData))
    return
  }
  const [rows] = await mySqlConn.execute('SELECT * FROM users')
  redisConn.set('users', JSON.stringify(rows))
  res.json(rows)
})

app.listen(port, async () => {
  await initMySql()
  await initRedis()
  console.log(`Server is running on port ${port}`)
  // cron.schedule('*/5 * * * *', async () => {
  //   const [rows] = await mySqlConn.execute('SELECT * FROM users')
  //   redisConn.set('users', JSON.stringify(rows))
  // })
})
