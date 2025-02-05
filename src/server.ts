import { serve } from '@hono/node-server'
import { init } from './index'

const NODE_ENV = process.env.NODE_ENV

if (NODE_ENV !== 'production') {
  serve(
    {
      fetch: init().fetch,
      port: 8000,
    },
    (info) => {
      console.info(`Listening on http://localhost:${info.port}`)
    }
  )
}
