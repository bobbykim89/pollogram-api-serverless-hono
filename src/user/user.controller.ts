import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { UseAuth } from '../utils'
import { AppContextType } from '../types'
import { signupUserInputSchema } from './dto'
import { UserService } from './user.service'

export class UserController {
  private userService: UserService
  private useAuth: UseAuth
  private app: Hono<{ Variables: AppContextType }>
  constructor() {
    this.userService = new UserService()
    this.useAuth = new UseAuth()
    this.app = new Hono()
  }
  public setRoute = () => {
    return this.app
      .get('/', async (c) => {
        return c.json({ message: 'hello from pollito pio!' }, 200)
      })
      .post(
        '/signup/',
        zValidator('json', signupUserInputSchema),
        async (c) => {
          const body = c.req.valid('json')
          return await this.userService.signupUser(c, body)
        }
      )
  }
}
