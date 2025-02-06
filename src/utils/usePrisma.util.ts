import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool, neonConfig } from '@neondatabase/serverless'
// import * as ws from 'ws'
import { UseConfig } from './useConfig.util'

// neonConfig.webSocketConstructor = ws

const config = new UseConfig()
const pool = new Pool({ connectionString: config.databaseUrl })

export class UsePrisma extends PrismaClient {
  constructor() {
    super({
      adapter: new PrismaNeon(pool),
    })
  }
}
