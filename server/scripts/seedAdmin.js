const path = require('path')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const dotenv = require('dotenv')
const User = require('../models/User')

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const parseArgs = () => {
  const args = process.argv.slice(2)
  const parsed = {}

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (!arg.startsWith('--')) continue

    const key = arg.replace(/^--/, '')
    const next = args[i + 1]

    if (!next || next.startsWith('--')) {
      parsed[key] = true
      continue
    }

    parsed[key] = next
    i += 1
  }

  return parsed
}

const printUsage = () => {
  console.log('Usage: npm run seed:admin -- --confirm make-admin --email admin@example.com --password StrongPass123 --name "System Admin" --phone 01700000000 --upazila "Sylhet Sadar"')
  console.log('Notes:')
  console.log('- If the email exists, the user will be promoted to admin and activated.')
  console.log('- If the email does not exist, a new admin user will be created.')
}

const run = async () => {
  const args = parseArgs()

  if (args.confirm !== 'make-admin') {
    console.error('Refusing to continue. Pass --confirm make-admin to proceed.')
    printUsage()
    process.exit(1)
  }

  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is missing in server/.env')
    process.exit(1)
  }

  const email = (args.email || process.env.ADMIN_SEED_EMAIL || '').trim().toLowerCase()
  const password = (args.password || process.env.ADMIN_SEED_PASSWORD || '').trim()
  const name = (args.name || process.env.ADMIN_SEED_NAME || 'BloodNet Admin').trim()
  const phone = (args.phone || process.env.ADMIN_SEED_PHONE || '01700000000').trim()
  const upazila = (args.upazila || process.env.ADMIN_SEED_UPAZILA || 'Sylhet Sadar').trim()

  if (!email || !password) {
    console.error('Both admin email and password are required.')
    printUsage()
    process.exit(1)
  }

  if (password.length < 6) {
    console.error('Password must be at least 6 characters long.')
    process.exit(1)
  }

  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected')

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      const hashedPassword = await bcrypt.hash(password, 10)

      existingUser.role = 'admin'
      existingUser.isActive = true
      existingUser.password = hashedPassword
      existingUser.name = name || existingUser.name
      existingUser.phone = phone || existingUser.phone
      existingUser.upazila = upazila || existingUser.upazila
      await existingUser.save()

      console.log(`User ${email} was promoted to admin and password was reset.`)
    } else {
      const hashedPassword = await bcrypt.hash(password, 10)

      await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        upazila,
        role: 'admin',
        isActive: true,
      })

      console.log(`New admin user created for ${email}.`)
    }

    console.log('Done.')
    process.exit(0)
  } catch (error) {
    console.error('Admin seed failed:', error.message)
    process.exit(1)
  } finally {
    await mongoose.connection.close().catch(() => null)
  }
}

run()
