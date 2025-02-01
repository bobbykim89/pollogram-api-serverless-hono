import { type JwtVariables } from 'hono/jwt'
import { type User } from '@prisma/client'

export interface AppContextType extends JwtVariables {
  currentUser: Omit<User, 'password'>
}
