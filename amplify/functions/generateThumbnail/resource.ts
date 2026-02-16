import { defineFunction } from '@aws-amplify/backend';
import { Duration } from 'aws-cdk-lib';
import { Runtime, Code, LayerVersion } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const generateThumbnail = defineFunction(
  (scope) => {
    const sharpLayer = new LayerVersion(scope, 'SharpLayer', {
      code: Code.fromAsset(path.join(__dirname, '..', '..', 'layers', 'sharp')),
      compatibleRuntimes: [Runtime.NODEJS_20_X],
      description: 'Sharp image processing library',
    });

    return new NodejsFunction(scope, 'generateThumbnail', {
      entry: path.join(__dirname, 'handler.ts'),
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(60),
      memorySize: 512,
      layers: [sharpLayer],
      bundling: {
        externalModules: ['sharp'],
      },
    });
  },
  { resourceGroupName: 'storage' }
);
