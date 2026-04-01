const path = require('path')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/User')

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const parseArgs = () => {
  const args = process.argv.slice(2)
  const parsed = {}

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (!arg.startsWith('--')) continue

    const key = arg.replace(/^--/, '')
    const value = args[i + 1]
    if (!value || value.startsWith('--')) {
      parsed[key] = true
      continue
    }

    parsed[key] = value
    i += 1
  }

  return parsed
}

const run = async () => {
  const args = parseArgs()
  const email = (args.email || '').trim().toLowerCase()
  const password = (args.password || '').trim()

  if (!email || !password) {
    console.log('Usage: node scripts/checkAdminLogin.js --email admin@bloodnet.com --password admin@123')
    process.exit(1)
  }

  try {
    await mongoose.connect(process.env.MONGO_URI)
    const user = await User.findOne({ email })

    if (!user) {
      console.log(JSON.stringify({ ok: false, reason: 'USER_NOT_FOUND', email }))
      process.exit(0)
    }

    const passwordMatches = await bcrypt.compare(password, user.password)

    console.log(JSON.stringify({
      ok: passwordMatches,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      passwordMatches,
    }))

    process.exit(0)
  } catch (error) {
    console.error('CHECK_FAILED:', error.message)
    process.exit(1)
  } finally {
    await mongoose.connection.close().catch(() => null)
  }
}

run()
