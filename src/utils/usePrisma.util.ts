import { PrismaClient } from '../db/prisma'
import { UseConfig } from './useConfig.util'
import { PrismaPg } from '@prisma/adapter-pg'
import { neonConfig } from '@neondatabase/serverless'
import * as ws from 'ws'

export class UsePrisma extends PrismaClient {
  constructor(config: UseConfig) {
    super({
      adapter: new PrismaPg({ connectionString: config.databaseUrl }),
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
