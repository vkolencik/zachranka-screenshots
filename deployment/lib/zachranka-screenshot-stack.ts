import * as cdk from 'aws-cdk-lib'
import { Duration } from 'aws-cdk-lib'
import * as events from 'aws-cdk-lib/aws-events'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { Code, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda'
import * as s3 from 'aws-cdk-lib/aws-s3'
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets'

export interface ZachrankaScreenshotStackProps extends cdk.StackProps {
}

export class ZachrankaScreenshotStack extends cdk.Stack {
  public constructor (scope: cdk.App, id: string, props: ZachrankaScreenshotStackProps = {}) {
    super(scope, id, props)

    // Resources
    const s3Bucket = new s3.Bucket(this, 'S3Bucket', {
      bucketName: `zachranka-screenshots-${scope.account}`
    })

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
      layers: [
        LayerVersion.fromLayerVersionArn(this, 'layer-version', `arn:aws:lambda:${this.region}:764866452798:layer:chrome-aws-lambda:22`),
      ],
    })

    s3Bucket.grantPut(snapshotFunction)
    s3Bucket.grantPutAcl(snapshotFunction)

    let schedule = events.Schedule.expression('50 6 * * ? *')
    const snapshotFunctionCheckWebsiteScheduledEvent = new events.Rule(this, 'Rule', {
      schedule: schedule,
      targets: [new LambdaFunction(snapshotFunction, {retryAttempts: 5, maxEventAge: Duration.minutes(10)})]
    });
  }
}
