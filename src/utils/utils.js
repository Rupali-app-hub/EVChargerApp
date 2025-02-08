import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { WEB_ID } from '@env';

export const configureGoogleSignIn = () => {
    GoogleSignin.configure({
      scopes: ["https://www.googleapis.com/auth/drive.file"], 
      webClientId: WEB_ID, 
      offlineAccess: true,
    });
  };
  