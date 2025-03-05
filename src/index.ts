import { Hono } from 'hono'
import { prettyJSON } from 'hono/pretty-json'
import { appendTrailingSlash } from 'hono/trailing-slash'
import { userModule } from './user/user.module'
import { authModule } from './auth/auth.module'
import { profileModule } from './profile/profile.module'
import { postModule } from './post/post.module'
import { commentModule } from './comment/comment.module'
import { UsePrisma } from './utils'

const usePrisma = new UsePrisma()
usePrisma.warmup()

export const init = () => {
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
