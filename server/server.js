const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
const authRoutes = require('./routes/authRoutes')
const donorRoutes = require('./routes/donorRoutes')
const bloodRequestRoutes = require('./routes/bloodRequestRoutes')
const adminRoutes = require('./routes/adminRoutes')

app.use('/api/auth', authRoutes)
app.use('/api/donors', donorRoutes)
app.use('/api/requests', bloodRequestRoutes)
app.use('/api/admin', adminRoutes)

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'BloodNet API is running! 🩸' })
})

// Connect to MongoDB then start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully!')
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`)
    })
  })
  .catch((error) => {
    console.log('❌ MongoDB connection failed:', error.message)
  })