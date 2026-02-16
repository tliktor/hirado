import { defineFunction } from '@aws-amplify/backend';

export const generateThumbnail = defineFunction({
  name: 'generateThumbnail',
  entry: './handler.ts',
  runtime: 20,
  timeoutSeconds: 60,
  memoryMB: 512,
  bundling: {
    externalPackages: ['sharp'],
  },
});
