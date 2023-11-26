import 'dotenv/config';

export default {

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