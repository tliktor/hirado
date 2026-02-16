import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import { Construct } from 'constructs';

export class HiradoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const accountId = this.account;
    const region = this.region;

    // S3 Bucket
    const bucket = new s3.Bucket(this, 'HiradoBucket', {
      bucketName: `hirado-photos-${accountId}-${region}`,
      cors: [{
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
        exposedHeaders: ['ETag'],
      }],
      lifecycleRules: [{
        prefix: 'uploads/temp/',
        expiration: cdk.Duration.days(1),
      }],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // DynamoDB Table
    const table = new dynamodb.Table(this, 'MetadataTable', {
      tableName: 'hirado-metadata',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda Execution Role
    const lambdaRole = new iam.Role(this, 'LambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    bucket.grantReadWrite(lambdaRole);
    table.grantReadWriteData(lambdaRole);

    // Auth Lambda
    const authLambda = new lambda.Function(this, 'AuthLambda', {
      functionName: 'hirado-auth',
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/auth'),
      environment: {
        SHARED_PASSWORD: 'k1cs1nyfalumban',
      },
      timeout: cdk.Duration.seconds(10),
    });

    // Upload Lambda (presigned URL)
    const uploadLambda = new lambda.Function(this, 'UploadLambda', {
      functionName: 'hirado-upload',
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/upload'),
      role: lambdaRole,
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
      timeout: cdk.Duration.seconds(30),
    });

    // Process Lambda (EXIF + move)
    const processLambda = new lambda.Function(this, 'ProcessLambda', {
      functionName: 'hirado-process',
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/process'),
      role: lambdaRole,
      environment: {
        BUCKET_NAME: bucket.bucketName,
        TABLE_NAME: table.tableName,
      },
      timeout: cdk.Duration.seconds(60),
      memorySize: 1024,
    });

    // S3 trigger for process Lambda
    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(processLambda),
      { prefix: 'uploads/temp/' }
    );

    // API Gateway
    const api = new apigateway.RestApi(this, 'HiradoApi', {
      restApiName: 'hirado-api',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['*'],
      },
    });

    // Authorizer
    const authorizer = new apigateway.RequestAuthorizer(this, 'Authorizer', {
      handler: authLambda,
      identitySources: [apigateway.IdentitySource.header('Authorization')],
      resultsCacheTtl: cdk.Duration.minutes(5),
    });

    // /upload endpoint
    const upload = api.root.addResource('upload');
    upload.addMethod('POST', new apigateway.LambdaIntegration(uploadLambda), {
      authorizer,
    });

    // Outputs
    new cdk.CfnOutput(this, 'BucketName', { value: bucket.bucketName });
    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url });
    new cdk.CfnOutput(this, 'TableName', { value: table.tableName });
  }
}
