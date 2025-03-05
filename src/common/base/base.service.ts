import { PrismaClient } from '@prisma/client'

export class BaseService {
  prisma: PrismaClient
  constructor() {
    this.prisma = new PrismaClient()
  }
}
