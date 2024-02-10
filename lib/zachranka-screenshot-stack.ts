import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';

export interface ZachrankaScreenshotStackProps extends cdk.StackProps {
}

/**
 * Take regular screenshots of a website and store in an S3 bucket.
 */
export class ZachrankaScreenshotStack extends cdk.Stack {
  /**
   * SnapshotFunction function name
   */
  public readonly consumerFunction;

  public constructor(scope: cdk.App, id: string, props: ZachrankaScreenshotStackProps = {}) {
    super(scope, id, props);

    // Resources
    const s3Bucket = new s3.CfnBucket(this, 'S3Bucket', {
    });
    s3Bucket.cfnOptions.metadata = {
      SamResourceId: 'S3Bucket',
    };

    const snapshotFunctionRole = new iam.CfnRole(this, 'SnapshotFunctionRole', {
      assumeRolePolicyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: [
              'sts:AssumeRole',
            ],
            Effect: 'Allow',
            Principal: {
              Service: [
                'lambda.amazonaws.com',
              ],
            },
          },
        ],
      },
      managedPolicyArns: [
        'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
      ],
      policies: [
        {
          policyName: 'SnapshotFunctionRolePolicy0',
          policyDocument: {
            Statement: [
              {
                Action: [
                  's3:PutObject',
                  's3:PutObjectAcl',
                  's3:PutLifecycleConfiguration',
                ],
                Effect: 'Allow',
                Resource: [
                  `arn:${this.partition}:s3:::${s3Bucket.ref}`,
                  `arn:${this.partition}:s3:::${s3Bucket.ref}/*`,
                ],
              },
            ],
          },
        },
      ],
      tags: [
        {
          key: 'lambda:createdBy',
          value: 'SAM',
        },
      ],
    });

    const snapshotFunction = new lambda.CfnFunction(this, 'SnapshotFunction', {
      code: {
        s3Bucket: 'aws-sam-cli-managed-default-samclisourcebucket-2ccosbgr6mwe',
        s3Key: '1ba292c49494822619cee015fc375f74',
      },
      handler: 'app.handler',
      memorySize: 4096,
      role: snapshotFunctionRole.attrArn,
      runtime: 'nodejs14.x',
      timeout: 15,
      environment: {
        variables: {
          targetUrl: 'https://kapacita.zachranka.cz/',
          s3Bucket: s3Bucket.ref,
        },
      },
      tags: [
        {
          key: 'lambda:createdBy',
          value: 'SAM',
        },
      ],
      layers: [
        `arn:aws:lambda:${this.region}:764866452798:layer:chrome-aws-lambda:22`,
      ],
    });
    snapshotFunction.cfnOptions.metadata = {
      SamResourceId: 'SnapshotFunction',
    };

    const snapshotFunctionCheckWebsiteScheduledEvent = new events.CfnRule(this, 'SnapshotFunctionCheckWebsiteScheduledEvent', {
      scheduleExpression: 'rate(15 minutes)',
      targets: [
        {
          arn: snapshotFunction.attrArn,
          id: 'SnapshotFunctionCheckWebsiteScheduledEventLambdaTarget',
        },
      ],
    });

    const snapshotFunctionCheckWebsiteScheduledEventPermission = new lambda.CfnPermission(this, 'SnapshotFunctionCheckWebsiteScheduledEventPermission', {
      action: 'lambda:InvokeFunction',
      functionName: snapshotFunction.ref,
      principal: 'events.amazonaws.com',
      sourceArn: snapshotFunctionCheckWebsiteScheduledEvent.attrArn,
    });

    // Outputs
    this.consumerFunction = snapshotFunction.ref;
    new cdk.CfnOutput(this, 'CfnOutputConsumerFunction', {
      key: 'ConsumerFunction',
      description: 'SnapshotFunction function name',
      value: this.consumerFunction!.toString(),
    });
  }
}
