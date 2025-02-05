#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import { PollogramHonoAppStages } from '../lib/cdk-hono-stages'

const app = new cdk.App()

new PollogramHonoAppStages(app, 'Prod', {
  env: {
    region: 'us-east-2',
  },
})

new PollogramHonoAppStages(app, 'Dev', {
  env: {
    region: 'us-east-2',
  },
})
