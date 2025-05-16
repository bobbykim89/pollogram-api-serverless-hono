import { type JwtVariables } from 'hono/jwt'
import { type User } from '../db/prisma'

export interface AppContextType extends JwtVariables {
  currentUser: Omit<User, 'password'>
}
