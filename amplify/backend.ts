import { defineBackend } from '@aws-amplify/backend';
import { EventType } from 'aws-cdk-lib/aws-s3';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { generateThumbnail } from './functions/generateThumbnail/resource';

const backend = defineBackend({
  auth,
  data,
  storage,
  generateThumbnail,
});

const s3Bucket = backend.storage.resources.bucket;
const thumbnailLambda = backend.generateThumbnail.resources.lambda;

s3Bucket.addEventNotification(
  EventType.OBJECT_CREATED,
  new LambdaDestination(thumbnailLambda),
  { prefix: 'photos/' }
);

s3Bucket.grantRead(thumbnailLambda);
s3Bucket.grantPut(thumbnailLambda);
