import { PrismaClient } from '../db/prisma'
import { UseConfig } from './useConfig.util'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaNeon } from '@prisma/adapter-neon'

export class UsePrisma extends PrismaClient {
  constructor(config: UseConfig) {
    super({
      adapter: new PrismaNeon({ connectionString: config.databaseUrl }),
    })
  }
  public warmup = async () => {
    try {
      await this.$connect()
    } catch (error) {
      console.error('Warmup failed', error)
    }
  }
}
