import { sign, jwt } from 'hono/jwt'
import { createMiddleware } from 'hono/factory'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { UseConfig } from './useConfig.util'
import { AppContextType } from '../types'

export class UseAuth {
  private config: UseConfig
  private prisma: PrismaClient
  constructor() {
    this.config = new UseConfig()
    this.prisma = new PrismaClient()
  }
  public signToken = async (userId: number) => {
    const payload = {
      id: userId,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    }
    return await sign(payload, this.config.jwtSecret)
  }
  public getJwt = createMiddleware<{ Variables: AppContextType }>(
    async (c, next) => {
      const jwtMiddleware = jwt({ secret: this.config.jwtSecret })
      return jwtMiddleware(c, next)
    }
  )
  public hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
  }
  public retrieveUserInfo = createMiddleware<{ Variables: AppContextType }>(
    async (c, next) => {
      try {
        const user = c.get('jwtPayload')
        const currentUser = await this.prisma.user.findUnique({
          where: { id: user.id },
          omit: { password: true },
        })
        if (!currentUser) return c.json({ error: 'Not found' }, 404)
        c.set('currentUser', currentUser)
        return next()
      } catch (error) {
        c.json({ error: 'Unauthorized' }, 401)
      }
    }
  )
}
