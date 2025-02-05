import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway'

export class CdkHonoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // The code that defines your stack goes here
    const stage: string = process.env.STAGE || 'prod'
    const pollogramLambdaFn = new NodejsFunction(this, 'PollogramHono', {
      runtime: Runtime.NODEJS_20_X,
      entry: 'src/handler.ts',
      handler: 'handler',
      environment: {
        NODE_ENV: 'production',
        DATABASE_URL: process.env.DATABASE_URL || '',
      },
      timeout: cdk.Duration.seconds(10),
      bundling: {
        nodeModules: [],
        externalModules: ['aws-sdk'],
        minify: true,
        commandHooks: {
          beforeBundling(_inputDir: string, _outputDir: string): string[] {
            return []
          },
          beforeInstall(_inputDir: string, _outputDir: string) {
            return ['npx prisma generate']
          },
          afterBundling(inputDir: string, outputDir: string): string[] {
            return [
              `cp ${inputDir}/node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node ${outputDir}`,
              `cp ${inputDir}/prisma/schema.prisma ${outputDir}`,
            ]
          },
        },
        forceDockerBundling: false,
      },
    })

    new LambdaRestApi(this, 'PollogramHonoAPIGW', {
      handler: pollogramLambdaFn,
      proxy: true,
      deployOptions: {
        stageName: stage,
      },
    })
  }
}
