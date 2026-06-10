import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function main() {
  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      clerkId: 'user_2m1abc123',
      name: 'Alice Cooper',
      plan: 'FREE'
    },
  })

  console.log({ alice })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
