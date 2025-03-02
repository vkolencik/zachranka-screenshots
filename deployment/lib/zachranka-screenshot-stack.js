"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZachrankaScreenshotStack = void 0;
const cdk = require("aws-cdk-lib");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const aws_lambda_1 = require("aws-cdk-lib/aws-lambda");
const s3 = require("aws-cdk-lib/aws-s3");
const aws_scheduler_1 = require("aws-cdk-lib/aws-scheduler");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
class ZachrankaScreenshotStack extends cdk.Stack {
    constructor(scope, id, props = {}) {
        super(scope, id, props);
        // Resources
        const s3Bucket = new s3.Bucket(this, 'S3Bucket', {
            bucketName: `zachranka-screenshots-new-${this.account}`,
            accessControl: s3.BucketAccessControl.PUBLIC_READ,
            objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS, // Allow public access via policies
        });
        const screenshotRole = new aws_iam_1.Role(this, 'screenshot-role', { assumedBy: new aws_iam_1.ServicePrincipal('lambda.amazonaws.com') });
        const snapshotFunction = new lambda.Function(this, 'SnapshotFunction', {
            code: aws_lambda_1.Code.fromAsset('../screenshot-lambda/lambda'),
            functionName: 'zachranka-screenshot-new-function',
            handler: 'app.handler',
            memorySize: 4096,
            runtime: aws_lambda_1.Runtime.NODEJS_20_X,
            timeout: aws_cdk_lib_1.Duration.minutes(2),
            environment: {
                TARGET_URL: 'https://kapacita.zachranka.cz/',
                S3_BUCKET: s3Bucket.bucketName,
            },
            role: screenshotRole,
            layers: [
                aws_lambda_1.LayerVersion.fromLayerVersionArn(this, 'layer-version', `arn:aws:lambda:eu-central-1:764866452798:layer:chrome-aws-lambda:42`),
            ],
        });
        s3Bucket.grantPut(snapshotFunction);
        s3Bucket.grantPutAcl(snapshotFunction);
        screenshotRole.assumeRolePolicy?.addStatements(new aws_iam_1.PolicyStatement({
            actions: ['sts:AssumeRole'],
            principals: [new aws_iam_1.ServicePrincipal('scheduler.amazonaws.com')],
        }));
        new aws_scheduler_1.CfnSchedule(this, 'trigger-schedule', {
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
            flexibleTimeWindow: { mode: "OFF" }
        });
    }
}
exports.ZachrankaScreenshotStack = ZachrankaScreenshotStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiemFjaHJhbmthLXNjcmVlbnNob3Qtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ6YWNocmFua2Etc2NyZWVuc2hvdC1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBa0M7QUFDbEMsNkNBQXNDO0FBQ3RDLGlEQUFnRDtBQUNoRCx1REFBb0U7QUFDcEUseUNBQXdDO0FBQ3hDLDZEQUF1RDtBQUN2RCxpREFBNkU7QUFLN0UsTUFBYSx3QkFBeUIsU0FBUSxHQUFHLENBQUMsS0FBSztJQUNyRCxZQUFvQixLQUFjLEVBQUUsRUFBVSxFQUFFLFFBQXVDLEVBQUU7UUFDdkYsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFFdkIsWUFBWTtRQUNaLE1BQU0sUUFBUSxHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFO1lBQy9DLFVBQVUsRUFBRSw2QkFBNkIsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUN2RCxhQUFhLEVBQUUsRUFBRSxDQUFDLG1CQUFtQixDQUFDLFdBQVc7WUFDakQsZUFBZSxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUMsYUFBYTtZQUNqRCxpQkFBaUIsRUFBRSxFQUFFLENBQUMsaUJBQWlCLENBQUMsVUFBVSxFQUFFLG1DQUFtQztTQUN4RixDQUFDLENBQUE7UUFFRixNQUFNLGNBQWMsR0FBRyxJQUFJLGNBQUksQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsRUFBQyxTQUFTLEVBQUUsSUFBSSwwQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQyxFQUFDLENBQUMsQ0FBQTtRQUVuSCxNQUFNLGdCQUFnQixHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUU7WUFDckUsSUFBSSxFQUFFLGlCQUFJLENBQUMsU0FBUyxDQUFDLDZCQUE2QixDQUFDO1lBQ25ELFlBQVksRUFBRSxtQ0FBbUM7WUFDakQsT0FBTyxFQUFFLGFBQWE7WUFDdEIsVUFBVSxFQUFFLElBQUk7WUFDaEIsT0FBTyxFQUFFLG9CQUFPLENBQUMsV0FBVztZQUM1QixPQUFPLEVBQUUsc0JBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQzVCLFdBQVcsRUFBRTtnQkFDWCxVQUFVLEVBQUUsZ0NBQWdDO2dCQUM1QyxTQUFTLEVBQUUsUUFBUSxDQUFDLFVBQVU7YUFDL0I7WUFDRCxJQUFJLEVBQUUsY0FBYztZQUNwQixNQUFNLEVBQUU7Z0JBQ04seUJBQVksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLHFFQUFxRSxDQUFDO2FBQy9IO1NBQ0YsQ0FBQyxDQUFBO1FBRUYsUUFBUSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO1FBQ25DLFFBQVEsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtRQUV0QyxjQUFjLENBQUMsZ0JBQWdCLEVBQUUsYUFBYSxDQUFDLElBQUkseUJBQWUsQ0FBQztZQUNqRSxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztZQUMzQixVQUFVLEVBQUUsQ0FBQyxJQUFJLDBCQUFnQixDQUFDLHlCQUF5QixDQUFDLENBQUM7U0FDOUQsQ0FBQyxDQUFDLENBQUE7UUFFSCxJQUFJLDJCQUFXLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQ3hDLGtCQUFrQixFQUFFLG9CQUFvQjtZQUN4QywwQkFBMEIsRUFBRSxlQUFlO1lBQzNDLE1BQU0sRUFBRTtnQkFDTixHQUFHLEVBQUUsZ0JBQWdCLENBQUMsV0FBVztnQkFDakMsV0FBVyxFQUFFO29CQUNYLHdCQUF3QixFQUFFLEdBQUc7b0JBQzdCLG9CQUFvQixFQUFFLENBQUM7aUJBQ3hCO2dCQUNELE9BQU8sRUFBRSxjQUFjLENBQUMsT0FBTzthQUNoQztZQUNELGtCQUFrQixFQUFFLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBQztTQUNsQyxDQUFDLENBQUE7SUFDSixDQUFDO0NBQ0Y7QUFyREQsNERBcURDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJ1xyXG5pbXBvcnQgeyBEdXJhdGlvbiB9IGZyb20gJ2F3cy1jZGstbGliJ1xyXG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSdcclxuaW1wb3J0IHsgQ29kZSwgTGF5ZXJWZXJzaW9uLCBSdW50aW1lIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSdcclxuaW1wb3J0ICogYXMgczMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzJ1xyXG5pbXBvcnQgeyBDZm5TY2hlZHVsZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1zY2hlZHVsZXInXHJcbmltcG9ydCB7IFBvbGljeVN0YXRlbWVudCwgUm9sZSwgU2VydmljZVByaW5jaXBhbCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFphY2hyYW5rYVNjcmVlbnNob3RTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgWmFjaHJhbmthU2NyZWVuc2hvdFN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IgKHNjb3BlOiBjZGsuQXBwLCBpZDogc3RyaW5nLCBwcm9wczogWmFjaHJhbmthU2NyZWVuc2hvdFN0YWNrUHJvcHMgPSB7fSkge1xyXG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcylcclxuXHJcbiAgICAvLyBSZXNvdXJjZXNcclxuICAgIGNvbnN0IHMzQnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCAnUzNCdWNrZXQnLCB7XHJcbiAgICAgIGJ1Y2tldE5hbWU6IGB6YWNocmFua2Etc2NyZWVuc2hvdHMtbmV3LSR7dGhpcy5hY2NvdW50fWAsXHJcbiAgICAgIGFjY2Vzc0NvbnRyb2w6IHMzLkJ1Y2tldEFjY2Vzc0NvbnRyb2wuUFVCTElDX1JFQUQsXHJcbiAgICAgIG9iamVjdE93bmVyc2hpcDogczMuT2JqZWN0T3duZXJzaGlwLk9CSkVDVF9XUklURVIsXHJcbiAgICAgIGJsb2NrUHVibGljQWNjZXNzOiBzMy5CbG9ja1B1YmxpY0FjY2Vzcy5CTE9DS19BQ0xTLCAvLyBBbGxvdyBwdWJsaWMgYWNjZXNzIHZpYSBwb2xpY2llc1xyXG4gICAgfSlcclxuXHJcbiAgICBjb25zdCBzY3JlZW5zaG90Um9sZSA9IG5ldyBSb2xlKHRoaXMsICdzY3JlZW5zaG90LXJvbGUnLCB7YXNzdW1lZEJ5OiBuZXcgU2VydmljZVByaW5jaXBhbCgnbGFtYmRhLmFtYXpvbmF3cy5jb20nKX0pXHJcblxyXG4gICAgY29uc3Qgc25hcHNob3RGdW5jdGlvbiA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1NuYXBzaG90RnVuY3Rpb24nLCB7XHJcbiAgICAgIGNvZGU6IENvZGUuZnJvbUFzc2V0KCcuLi9zY3JlZW5zaG90LWxhbWJkYS9sYW1iZGEnKSxcclxuICAgICAgZnVuY3Rpb25OYW1lOiAnemFjaHJhbmthLXNjcmVlbnNob3QtbmV3LWZ1bmN0aW9uJyxcclxuICAgICAgaGFuZGxlcjogJ2FwcC5oYW5kbGVyJyxcclxuICAgICAgbWVtb3J5U2l6ZTogNDA5NixcclxuICAgICAgcnVudGltZTogUnVudGltZS5OT0RFSlNfMjBfWCxcclxuICAgICAgdGltZW91dDogRHVyYXRpb24ubWludXRlcygyKSxcclxuICAgICAgZW52aXJvbm1lbnQ6IHtcclxuICAgICAgICBUQVJHRVRfVVJMOiAnaHR0cHM6Ly9rYXBhY2l0YS56YWNocmFua2EuY3ovJyxcclxuICAgICAgICBTM19CVUNLRVQ6IHMzQnVja2V0LmJ1Y2tldE5hbWUsXHJcbiAgICAgIH0sXHJcbiAgICAgIHJvbGU6IHNjcmVlbnNob3RSb2xlLFxyXG4gICAgICBsYXllcnM6IFtcclxuICAgICAgICBMYXllclZlcnNpb24uZnJvbUxheWVyVmVyc2lvbkFybih0aGlzLCAnbGF5ZXItdmVyc2lvbicsIGBhcm46YXdzOmxhbWJkYTpldS1jZW50cmFsLTE6NzY0ODY2NDUyNzk4OmxheWVyOmNocm9tZS1hd3MtbGFtYmRhOjQyYCksXHJcbiAgICAgIF0sXHJcbiAgICB9KVxyXG5cclxuICAgIHMzQnVja2V0LmdyYW50UHV0KHNuYXBzaG90RnVuY3Rpb24pXHJcbiAgICBzM0J1Y2tldC5ncmFudFB1dEFjbChzbmFwc2hvdEZ1bmN0aW9uKVxyXG5cclxuICAgIHNjcmVlbnNob3RSb2xlLmFzc3VtZVJvbGVQb2xpY3k/LmFkZFN0YXRlbWVudHMobmV3IFBvbGljeVN0YXRlbWVudCh7XHJcbiAgICAgIGFjdGlvbnM6IFsnc3RzOkFzc3VtZVJvbGUnXSxcclxuICAgICAgcHJpbmNpcGFsczogW25ldyBTZXJ2aWNlUHJpbmNpcGFsKCdzY2hlZHVsZXIuYW1hem9uYXdzLmNvbScpXSxcclxuICAgIH0pKVxyXG5cclxuICAgIG5ldyBDZm5TY2hlZHVsZSh0aGlzLCAndHJpZ2dlci1zY2hlZHVsZScsIHtcclxuICAgICAgc2NoZWR1bGVFeHByZXNzaW9uOiAnY3Jvbig1MCA2ICogKiA/ICopJyxcclxuICAgICAgc2NoZWR1bGVFeHByZXNzaW9uVGltZXpvbmU6ICdFdXJvcGUvUHJhZ3VlJyxcclxuICAgICAgdGFyZ2V0OiB7XHJcbiAgICAgICAgYXJuOiBzbmFwc2hvdEZ1bmN0aW9uLmZ1bmN0aW9uQXJuLFxyXG4gICAgICAgIHJldHJ5UG9saWN5OiB7XHJcbiAgICAgICAgICBtYXhpbXVtRXZlbnRBZ2VJblNlY29uZHM6IDYwMCxcclxuICAgICAgICAgIG1heGltdW1SZXRyeUF0dGVtcHRzOiA1XHJcbiAgICAgICAgfSxcclxuICAgICAgICByb2xlQXJuOiBzY3JlZW5zaG90Um9sZS5yb2xlQXJuLFxyXG4gICAgICB9LFxyXG4gICAgICBmbGV4aWJsZVRpbWVXaW5kb3c6IHttb2RlOiBcIk9GRlwifVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuIl19