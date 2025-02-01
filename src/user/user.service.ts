import { PrismaClient } from '@prisma/client'
import type { Context } from 'hono'
import { UseAuth } from '../utils'
import type { SignupUserInput } from './dto'

export class UserService {
  private prisma: PrismaClient
  private useAuth: UseAuth
  constructor() {
    this.prisma = new PrismaClient()
    this.useAuth = new UseAuth()
  }
  public signupUser = async (ctx: Context, dto: SignupUserInput) => {
    try {
      const { email, password, username } = dto
      let user = await this.prisma.user.findUnique({
        where: { email },
      })
      let profile = await this.prisma.profile.findUnique({
        where: { username },
      })
      if (user || profile)
        return ctx.json({ message: 'Email or username is already in use' }, 400)
      const hashedPassword = await this.useAuth.hashPassword(password)
      user = await this.prisma.user.create({
        data: { email, password: hashedPassword },
      })
      profile = await this.prisma.profile.create({
        data: { username, user_id: user.id },
      })
      const accessToken = this.useAuth.signToken(user.id)
      return ctx.json({ access_token: `Bearer ${accessToken}` }, 201)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
}
