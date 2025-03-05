import type { Context } from 'hono'
import { UseAuth } from '../utils'
import type { AuthInput } from './dto'
import type { TokenPayload } from '../common/dto'
import * as bcrypt from 'bcryptjs'
import { BaseService } from '../common/base'

export class AuthService extends BaseService {
  private useAuth: UseAuth
  constructor() {
    super()
    this.useAuth = new UseAuth()
  }
  public getCurrentUser = async (ctx: Context, token: TokenPayload) => {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: token.id },
        omit: { password: true },
      })
      if (!user) return ctx.json({ message: 'Not found' }, 404)
      return ctx.json(user, 200)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public loginUser = async (ctx: Context, dto: AuthInput) => {
    try {
      const { email, password } = dto
      const user = await this.prisma.user.findUnique({
        where: { email },
      })
      if (!user) return ctx.json({ message: 'Validation error.' }, 403)
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) return ctx.json({ message: 'Validation error.' }, 403)
      const accessToken = await this.useAuth.signToken(user.id)
      return ctx.json({ access_token: `Bearer ${accessToken}` }, 201)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
}
