import { handle } from 'hono/aws-lambda'
import { init } from './index'

const app = init()
export const handler = handle(app)
