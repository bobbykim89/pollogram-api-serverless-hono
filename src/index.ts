import { Hono } from 'hono'
import { handle } from 'hono/aws-lambda'
import { prettyJSON } from 'hono/pretty-json'
import { serve } from '@hono/node-server'
import { bearerAuth } from 'hono/bearer-auth'
import { type JwtVariables } from 'hono/jwt'
import { getSignedCookie, setSignedCookie } from 'hono/cookie'
import { UseAuth, UseConfig } from './utils'

const useAuth = new UseAuth()
const useConfig = new UseConfig()

const NODE_ENV = process.env.NODE_ENV

const app = new Hono<{ Variables: JwtVariables }>()
const token = 'piopio'
app
  .use(prettyJSON())
  .get('/', (e) => {
    return e.json({ message: 'Hello from pollito!' }, 200)
  })
  .get('/sign/', async (e) => {
    const signedCode = await useAuth.signToken('manguitoispollito')
    return e.json({ access_token: signedCode })
  })
  .get('/decode/', useAuth.getJwt, async (e) => {
    const token = e.get('jwtPayload')
    return e.json({ ...token })
  })
  .get('/set-cookie/', async (e) => {
    await setSignedCookie(
      e,
      'manguito-cookie',
      'manguitoispollito',
      useConfig.jwtSecret
    )
    return e.json({ message: 'set manguito cookie' })
  })
  .get('/read-cookie/', async (e) => {
    const cookie = await getSignedCookie(e, useConfig.jwtSecret)
    console.log(cookie)
    return e.json({ cookie: cookie })
  })
  .get('/pollos/', bearerAuth({ token }), (e) => {
    const authHeader = e.req.header('Authorization')
    console.log(authHeader)
    return e.json({ message: 'pollito says pip' }, 201)
  })

if (NODE_ENV !== 'production') {
  serve(
    {
      fetch: app.fetch,
      port: 8000,
    },
    (info) => {
      console.info(`Listening on http://localhost:${info.port}`)
    }
  )
}

export const handler = handle(app)
