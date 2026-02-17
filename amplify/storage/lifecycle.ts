import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';

/**
 * Add S3 Intelligent-Tiering lifecycle rules to reduce storage costs
 *
 * Cost optimization:
 * - Objects automatically moved to lower-cost tiers after 30/90 days of no access
 * - Frequent Access: Standard pricing ($0.023/GB)
 * - Infrequent Access: ~$0.0125/GB (46% cheaper)
 * - Archive Instant: ~$0.004/GB (83% cheaper)
 * - Small monitoring fee: $0.0025 per 1000 objects
 *
 * Estimated savings: 30-50% on infrequently accessed media
 */
export function addIntelligentTieringLifecycle(bucket: s3.IBucket, stack: cdk.Stack) {
  const cfnBucket = bucket.node.defaultChild as s3.CfnBucket;

  // Use the correct property name for filter
  cfnBucket.lifecycleConfiguration = {
    rules: [
      {
        id: 'IntelligentTieringForMedia',
        status: 'Enabled',
        // Apply to photos and videos folders using prefix
        prefix: 'photos/',
        transitions: [
          {
            storageClass: 'INTELLIGENT_TIERING',
            transitionInDays: 0, // Immediately use Intelligent-Tiering
          },
        ],
      },
      {
        id: 'IntelligentTieringForVideos',
        status: 'Enabled',
        prefix: 'videos/',
        transitions: [
          {
            storageClass: 'INTELLIGENT_TIERING',
            transitionInDays: 0,
          },
        ],
      },
      {
        id: 'IntelligentTieringForThumbnails',
        status: 'Enabled',
        prefix: 'thumbnails/',
        transitions: [
          {
            storageClass: 'INTELLIGENT_TIERING',
            transitionInDays: 0,
          },
        ],
      },
      {
        id: 'DeleteIncompleteUploads',
        status: 'Enabled',
        abortIncompleteMultipartUpload: {
          daysAfterInitiation: 7, // Clean up failed multipart uploads after 7 days
        },
      },
    ],
  };

  // Output cost savings info
  new cdk.CfnOutput(stack, 'S3IntelligentTieringEnabled', {
    value: 'true',
    description: 'S3 Intelligent-Tiering enabled for cost optimization (30-50% savings on inactive media)',
  });
}
