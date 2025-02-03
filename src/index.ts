import { Hono } from 'hono'
import { handle } from 'hono/aws-lambda'
import { prettyJSON } from 'hono/pretty-json'
import { serve } from '@hono/node-server'
import { bearerAuth } from 'hono/bearer-auth'
import { getSignedCookie, setSignedCookie } from 'hono/cookie'
import { appendTrailingSlash } from 'hono/trailing-slash'
import { UseAuth, UseConfig } from './utils'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { AppContextType } from './types'
import { userModule } from './user/user.module'
import { authModule } from './auth/auth.module'
import { profileModule } from './profile/profile.module'
import { postModule } from './post/post.module'

const useAuth = new UseAuth()
const useConfig = new UseConfig()

const NODE_ENV = process.env.NODE_ENV

const pioSchema = z.object({
  name: z.string(),
  age: z.number(),
})

const app = new Hono<{ Variables: AppContextType }>()
const token = 'piopio'
app
  .use(prettyJSON())
  .use(appendTrailingSlash())
  .get('/', (e) => {
    return e.json({ message: 'Hello from pollito!' }, 200)
  })
  .get('/sign/', async (e) => {
    const signedCode = await useAuth.signToken(123123123)
    return e.json({ access_token: signedCode })
  })
  .get('/decode/', useAuth.getJwt, async (e) => {
    const token = e.get('jwtPayload')
    // const body = e.req.valid('json')
    console.log(token)
    // console.log(body)
    return e.json({ ...token }, 200)
  })
  .post(
    '/multi-mid/',
    useAuth.getJwt,
    zValidator('json', pioSchema),
    async (c) => {
      const token = c.get('jwtPayload')
      const body = c.req.valid('json')
      return c.json({ ...body, ...token }, 201)
    }
  )
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
  .route('/api/user/', userModule.setRoute())
  .route('/api/auth/', authModule.setRoute())
  .route('/api/profile/', profileModule.setRoute())
  .route('/api/post/', postModule.setRoute())

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
