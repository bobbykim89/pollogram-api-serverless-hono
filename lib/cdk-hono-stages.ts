import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { CdkHonoStack } from './cdk-hono-stack'

export class PollogramHonoAppStages extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props)

    new CdkHonoStack(this, 'PollogramHonoAppStack')
  }
}
