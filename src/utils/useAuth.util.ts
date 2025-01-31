import { sign, jwt, type JwtVariables } from 'hono/jwt'
import { UseConfig } from './useConfig.util'
import { PrismaClient, type User } from '@prisma/client'
import { type Context, type Next } from 'hono'
import { BlankInput } from 'hono/types'
import { createMiddleware } from 'hono/factory'

interface HonoVariables extends JwtVariables {
  currentUser: Omit<User, 'password'>
}

export class UseAuth {
  private config: UseConfig
  private prisma: PrismaClient
  constructor() {
    this.config = new UseConfig()
    this.prisma = new PrismaClient()
  }
  public signToken = async (userId: string | number) => {
    const payload = {
      id: userId,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    }
    return await sign(payload, this.config.jwtSecret)
  }
  public getJwt = createMiddleware<{ Variables: HonoVariables }>(
    async (c, next) => {
      const jwtMiddleware = jwt({ secret: this.config.jwtSecret })
      return jwtMiddleware(c, next)
    }
  )
  public retrieveUserInfo = createMiddleware<{ Variables: HonoVariables }>(
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
