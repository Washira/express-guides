const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())

const port = 8000

app.post('/api/upload', (req, res) => {
  res.json({ message: 'File uploaded successfully' })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
