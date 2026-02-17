import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'photovaultStorage',
  access: (allow) => ({
    'photos/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
    'videos/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
    'thumbnails/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
      allow.authenticated.to(['read']),
    ],
    'public/*': [
      allow.authenticated.to(['read', 'write']),
    ],
  }),
});
