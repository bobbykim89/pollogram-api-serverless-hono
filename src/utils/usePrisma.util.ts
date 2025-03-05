import { PrismaClient } from '@prisma/client'

export class UsePrisma {
  private prisma: PrismaClient
  constructor() {
    this.prisma = new PrismaClient()
  }
  public warmup = async () => {
    try {
      await this.prisma.$connect()
    } catch (error) {
      console.error('Warmup failed', error)
    }
  }
}
