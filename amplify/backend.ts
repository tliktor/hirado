import { defineBackend } from '@aws-amplify/backend';
import { EventType } from 'aws-cdk-lib/aws-s3';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { generateThumbnail } from './functions/generateThumbnail/resource';
import { addIntelligentTieringLifecycle } from './storage/lifecycle';

const backend = defineBackend({
  auth,
  data,
  storage,
  generateThumbnail,
});

const s3Bucket = backend.storage.resources.bucket;
const thumbnailLambda = backend.generateThumbnail.resources.lambda;

// S3 event notifications for thumbnail generation
s3Bucket.addEventNotification(
  EventType.OBJECT_CREATED,
  new LambdaDestination(thumbnailLambda),
  { prefix: 'photos/' }
);

// Also generate thumbnails for videos
s3Bucket.addEventNotification(
  EventType.OBJECT_CREATED,
  new LambdaDestination(thumbnailLambda),
  { prefix: 'videos/' }
);

s3Bucket.grantRead(thumbnailLambda);
s3Bucket.grantPut(thumbnailLambda);

// Enable S3 Intelligent-Tiering for cost optimization
addIntelligentTieringLifecycle(s3Bucket, backend.storage.stack);
