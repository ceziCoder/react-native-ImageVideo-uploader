import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import Constants from "expo-constants";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: Constants.expoConfig.extra.apiKey,

  authDomain: Constants.expoConfig.extra.authDomain,

  projectId: Constants.expoConfig.extra.projectId,

  storageBucket: Constants.expoConfig.extra.storageBucket,

  messagingSenderId: Constants.expoConfig.extra.messagingSenderId,

  appId: Constants.expoConfig.extra.appId,
};

// Initialize Firebase

 const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const database = getFirestore();
export const storage = getStorage();