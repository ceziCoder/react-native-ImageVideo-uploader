import "dotenv/config";

export default {
  runtimeVersion: "1.0.0",
  updates: {
    url: "https://u.expo.dev/a4e12a8c-a44c-4146-91c0-895277b2ef2a",
  },
  platforms: ["ios", "android", "web"],
  extra: {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    tinyUrl: process.env.TINY_URL,
    eas: {
      projectId: "a4e12a8c-a44c-4146-91c0-895277b2ef2a",
    },
  },
};
