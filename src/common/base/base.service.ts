import { UsePrisma, UseConfig } from '../../utils'

export class BaseService {
  config: UseConfig
  prisma: UsePrisma
  constructor() {
    this.config = new UseConfig()
    this.prisma = new UsePrisma(this.config)
  }
}
