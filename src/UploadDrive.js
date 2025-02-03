import  {GoogleSignin}  from "@react-native-google-signin/google-signin";
import RNFS from "react-native-fs";

export const uploadToGoogleDrive = async (filePath) => {
  try {
    
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (!isSignedIn) {
      await GoogleSignin.signIn();
    }

    // Get user tokens
    const tokens = await GoogleSignin.getTokens();
    const accessToken = tokens.accessToken;

    // Read file data
    const fileData = await RNFS.readFile(filePath, "base64");

    // Upload to Google Drive
    const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "multipart/related; boundary=foo_bar_baz",
      },
      body: `
--foo_bar_baz
Content-Type: application/json; charset=UTF-8

{
  "name": "map-screenshot.jpg"
}

--foo_bar_baz
Content-Type: image/jpeg
Content-Transfer-Encoding: base64

${fileData}
--foo_bar_baz--
      `,
    });

    const result = await response.json();
    console.log("Uploaded file:", result);
  } catch (error) {
    console.error("Upload error:", error);
  }
};
