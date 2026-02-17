import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  PhotoSource: a.enum(['viber', 'web']),
  MediaType: a.enum(['image', 'video']),

  Photo: a
    .model({
      albumId: a.string(),
      s3Key: a.string().required(),
      thumbnailKey: a.string(),
      originalFilename: a.string(),
      caption: a.string(),
      tags: a.string().array(),
      source: a.ref('PhotoSource'),
      mediaType: a.ref('MediaType'),
      width: a.integer(),
      height: a.integer(),
      fileSize: a.integer(),
      duration: a.integer(), // For videos: duration in seconds
    })
    .authorization((allow) => [allow.owner(), allow.publicApiKey().to(['read'])]),

  Album: a
    .model({
      name: a.string().required(),
      description: a.string(),
      coverPhotoId: a.string(),
      photoCount: a.integer(),
    })
    .authorization((allow) => [allow.owner(), allow.publicApiKey().to(['read'])]),

  ShareLink: a
    .model({
      albumId: a.string().required(),
      createdBy: a.string(),
      expiresAt: a.datetime(),
      viewCount: a.integer(),
    })
    .authorization((allow) => [allow.owner(), allow.publicApiKey().to(['read'])]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 365,
    },
  },
});
