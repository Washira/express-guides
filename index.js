const cors = require('cors')
const express = require('express')
const mysql = require('mysql2/promise')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const bcrypt = require('bcrypt')

const port = 8000
const secret = 'mysecret'
let conn = null

const app = express()

app.use(express.json())

//
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
)

app.use(cookieParser())

// function to generate token
app.use(
  session({
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
)

// function init connection mysql
const initMysql = async () => {
  conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'tutorial',
  })
  // return connection
}

app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    const useData = {
      email,
      password: hashedPassword,
    }
    const [result] = await conn.query('INSERT INTO users SET ?', useData)
    res.json({ message: 'Creating has been successfully', result })
  } catch (error) {
    res.json({ message: error.message })
  }
})

app.listen(port, async () => {
  await initMysql()
  console.log(`Server is running on port ${port}`)
})
