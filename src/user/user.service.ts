import type { Context } from 'hono'
import * as bcrypt from 'bcryptjs'
import { UseAuth } from '../utils'
import type { PwUpdateInput, SignupUserInput } from './dto'
import type { TokenPayload } from '../common/dto'
import { BaseService } from '../common/base'

export class UserService extends BaseService {
  private useAuth: UseAuth
  constructor() {
    super()
    this.useAuth = new UseAuth()
  }
  public helloFromPollito = async (ctx: Context) => {
    return ctx.json({ message: 'Hello from pollito!' }, 200)
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
      const accessToken = await this.useAuth.signToken(user.id)
      return ctx.json({ access_token: `Bearer ${accessToken}` }, 201)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
  public updatePassword = async (
    ctx: Context,
    dto: PwUpdateInput,
    token: TokenPayload
  ) => {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: token.id },
      })
      const { currentPassword, newPassword } = dto
      if (!user) return ctx.json({ message: 'Not found' }, 404)
      const isMatch = await bcrypt.compare(currentPassword, user.password)
      if (!isMatch) return ctx.json({ message: 'Validation error.' }, 403)
      const hashedNewPw = await this.useAuth.hashPassword(newPassword)
      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedNewPw },
      })
      return ctx.json({ message: 'Updated password successfully.' }, 201)
    } catch (error) {
      throw ctx.json({ message: 'Internal server error' }, 500)
    }
  }
}
