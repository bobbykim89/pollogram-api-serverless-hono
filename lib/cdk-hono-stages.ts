import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { Stage } from 'aws-cdk-lib'
import { CdkHonoStack } from './cdk-hono-stack'

export class PollogramHonoAppStages extends Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props)

    new CdkHonoStack(this, 'PollogramHonoAppStack')
  }
}
