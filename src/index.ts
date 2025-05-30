import { Hono } from 'hono'
import { prettyJSON } from 'hono/pretty-json'
import { appendTrailingSlash } from 'hono/trailing-slash'
import { userModule } from './user/user.module'
import { authModule } from './auth/auth.module'
import { profileModule } from './profile/profile.module'
import { postModule } from './post/post.module'
import { commentModule } from './comment/comment.module'
import { UsePrisma, UseConfig } from './utils'
import { neonConfig } from '@neondatabase/serverless'
import * as ws from 'ws'

export const init = () => {
  const useConfig = new UseConfig()
  const usePrisma = new UsePrisma(useConfig)
  usePrisma.warmup()
  neonConfig.webSocketConstructor = ws
  const app = new Hono()
  app
    .use(prettyJSON())
    .use(appendTrailingSlash())
    .get('/', (c) => {
      return c.json({ message: 'Hello from pollito!' }, 200)
    })
    .route('/api/user/', userModule.setRoute())
    .route('/api/auth/', authModule.setRoute())
    .route('/api/profile/', profileModule.setRoute())
    .route('/api/post/', postModule.setRoute())
    .route('/api/comment/', commentModule.setRoute())

  return app
}
