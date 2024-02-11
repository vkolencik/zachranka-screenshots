import * as cdk from 'aws-cdk-lib'
import { Duration } from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { Code, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda'
import * as s3 from 'aws-cdk-lib/aws-s3'
import { CfnSchedule } from 'aws-cdk-lib/aws-scheduler'
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'

export interface ZachrankaScreenshotStackProps extends cdk.StackProps {
}

export class ZachrankaScreenshotStack extends cdk.Stack {
  public constructor (scope: cdk.App, id: string, props: ZachrankaScreenshotStackProps = {}) {
    super(scope, id, props)

    // Resources
    const s3Bucket = new s3.Bucket(this, 'S3Bucket', {
      bucketName: `zachranka-screenshots-${this.account}`
    })

    const screenshotRole = new Role(this, 'screenshot-role', {assumedBy: new ServicePrincipal('lambda.amazonaws.com')})

    const snapshotFunction = new lambda.Function(this, 'SnapshotFunction', {
      code: Code.fromAsset('../screenshot-lambda'),
      functionName: 'zachranka-screenshot-function',
      handler: 'app.handler',
      memorySize: 4096,
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.minutes(2),
      environment: {
        targetUrl: 'https://kapacita.zachranka.cz/',
        s3Bucket: s3Bucket.bucketArn,
      },
      role:screenshotRole,
      layers: [
        LayerVersion.fromLayerVersionArn(this, 'layer-version', `arn:aws:lambda:${this.region}:764866452798:layer:chrome-aws-lambda:22`),
      ],
    })

    s3Bucket.grantPut(snapshotFunction)
    s3Bucket.grantPutAcl(snapshotFunction)

    screenshotRole.assumeRolePolicy?.addStatements(new PolicyStatement({
      actions: ['sts:AssumeRole'],
      principals: [new ServicePrincipal('scheduler.amazonaws.com')],
    }))

    new CfnSchedule(this, 'trigger-schedule', {
      scheduleExpression: 'cron(50 6 * * ? *)',
      scheduleExpressionTimezone: 'Europe/Prague',
      target: {
        arn: snapshotFunction.functionArn,
        retryPolicy: {
          maximumEventAgeInSeconds: 600,
          maximumRetryAttempts: 5
        },
        roleArn: screenshotRole.roleArn,
      },
      flexibleTimeWindow: {mode: "OFF"}
    })
  }
}
