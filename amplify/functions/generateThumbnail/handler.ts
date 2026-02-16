import type { S3Event } from 'aws-lambda';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const s3 = new S3Client({});

export const handler = async (event: S3Event): Promise<void> => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    if (!key.startsWith('photos/')) continue;

    try {
      const { Body } = await s3.send(
        new GetObjectCommand({ Bucket: bucket, Key: key })
      );
      const imageBuffer = await Body?.transformToByteArray();
      if (!imageBuffer) continue;

      const thumbnail = await sharp(Buffer.from(imageBuffer))
        .resize(400, null, { withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      const thumbnailKey = key.replace('photos/', 'thumbnails/');
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: thumbnailKey,
          Body: thumbnail,
          ContentType: 'image/jpeg',
        })
      );

      console.log(`Generated thumbnail: ${thumbnailKey}`);
    } catch (error) {
      console.error(`Error processing ${key}:`, error);
    }
  }
};
