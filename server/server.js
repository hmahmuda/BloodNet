const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const rateLimit = require('express-rate-limit')

dotenv.config()

// Guard: fail fast if required env vars are missing
if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
  console.error('❌ Missing required environment variables: JWT_SECRET and/or MONGO_URI')
  process.exit(1)
}

const app = express()
const PORT = process.env.PORT || 5000

// CORS — allow configured origin and local dev hosts on any port
const configuredClientUrl = process.env.CLIENT_URL
const allowedOrigins = [
  configuredClientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)

    const isExplicitAllowed = allowedOrigins.includes(origin)
    const isLocalDevHost = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)

    if (isExplicitAllowed || isLocalDevHost) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))

app.use(express.json())

// Rate limiter for auth routes (max 20 requests per 15 min per IP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
})

// Routes
const authRoutes = require('./routes/authRoutes')
const donorRoutes = require('./routes/donorRoutes')
const bloodRequestRoutes = require('./routes/bloodRequestRoutes')
const adminRoutes = require('./routes/adminRoutes')

app.use('/api/auth', authLimiter, authRoutes)
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
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.log('❌ MongoDB connection failed:', error.message)
  })