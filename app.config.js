import 'dotenv/config';

export default {
  owner: 'cezicoder',
  "updates": {
    "url": "https://u.expo.dev/a4e12a8c-a44c-4146-91c0-895277b2ef2a"
  },
  "runtimeVersion": "1.0.0",
    extra: {

        apiKey: process.env.API_KEY,
        authDomain: process.env.AUTH_DOMAIN,
        projectId: process.env.PROJECT_ID,
        storageBucket: process.env.STORAGE_BUCKET,
        messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
   
  
      }



}