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
    res.json({ message: error.message, error })
  }
})

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const [rows] = await conn.query(
      'SELECT * FROM users WHERE email = ?',
      email
    )
    if (rows.length === 0) {
      return res.json({ message: 'Email not found' })
    }
    const user = rows[0]
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.json({ message: 'User or password not match' })
    }
    // jwt token
    const token = jwt.sign({ email: user.email }, secret, {
      expiresIn: '1h',
    })

    res.cookie('token', token, {
      maxAge: 100 * 60 * 5, // the token will be removed out from browser after 5 minutes
      httpOnly: true,
      secure: true,
      sameSite: 'none', // for cross-site request
    })

    res.json({ message: 'Login successfully', token })
  } catch (error) {
    res.status(401).json({ message: 'login fail', error })
  }
})

app.get('/api/users', async (req, res) => {
  try {
    // const token = req?.headers?.authorization?.split(' ')[1] // Bearer token, get token from headers
    const token = req.cookies.token // get token from cookies
    if (!token) {
      return res.json({ message: 'Token not found' })
    }
    const decoded = jwt.verify(token, secret) // decode token
    if (!decoded) {
      return res.json({ message: 'Token not valid' })
    }
    const [checkUser] = await conn.query(
      'SELECT * FROM users WHERE email = ?',
      decoded.email
    ) // check user
    if (checkUser.length === 0) {
      return res.json({ message: 'User not found' })
    }
    const [rows] = await conn.query('SELECT * FROM users')
    res.json({ users: rows })
  } catch (error) {
    res.json({ message: error.message, error })
  }
})

app.listen(port, async () => {
  await initMysql()
  console.log(`Server is running on port ${port}`)
})
