import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const categories = [
    { name: 'Ăn uống', icon: '🍔', is_default: true },
    { name: 'Đi lại', icon: '🚗', is_default: true },
    { name: 'Mua sắm', icon: '🛍️', is_default: true },
    { name: 'Giải trí', icon: '🎮', is_default: true },
    { name: 'Sức khỏe', icon: '🏥', is_default: true },
    { name: 'Khác', icon: '📦', is_default: true },
  ]

  for (const cat of categories) {
    await prisma.category.create({
      data: cat
    })
  }
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
