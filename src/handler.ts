import { handle } from 'hono/aws-lambda'
import { init } from './index'

export const handler = handle(init())
