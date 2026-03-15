import Constants from 'expo-constants';

// Dynamically grab the IP address of the computer running the Expo packager
const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost?.split(':')[0];

export const API_URL = localhost 
  ? `http://${localhost}:3000` 
  : 'http://192.168.1.100:3000'; // Fallback
