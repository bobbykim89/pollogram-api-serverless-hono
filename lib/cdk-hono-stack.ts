import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Runtime, Alias } from 'aws-cdk-lib/aws-lambda'
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway'

export class CdkHonoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const stage: string = process.env.STAGE || 'prod' // default 'prod'
    const pollogramApiFn = new NodejsFunction(this, 'PollogramHono', {
      runtime: Runtime.NODEJS_20_X,
      entry: 'src/handler.ts',
      handler: 'handler',
      memorySize: 256,
      environment: {
        NODE_ENV: 'production',
        DATABASE_URL: process.env.DATABASE_URL || '',
        DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED || '',
      },
      timeout: cdk.Duration.seconds(10),
      bundling: {
        nodeModules: [],
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

    const alias = new Alias(this, 'ApiAlias', {
      aliasName: 'pollogram-hono-live',
      version: pollogramApiFn.currentVersion,
    })

    new LambdaRestApi(this, 'PollogramHonoAPIGateway', {
      handler: alias,
      proxy: true,
      deployOptions: {
        stageName: stage,
        cachingEnabled: true,
        cacheTtl: cdk.Duration.minutes(5),
      },
    })
  }
}
