import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function main() {
  console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 15))
  try {
    const userCount = await prisma.user.count()
    console.log('✅ Connected. User count:', userCount)
  } catch (error) {
    console.error('❌ Connection failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
