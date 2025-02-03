import React, {useState, useEffect, useRef} from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, PermissionsAndroid, Platform , ToastAndroid, Image} from 'react-native';
import MapView , { Marker }from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ViewShot from 'react-native-view-shot';
import RNFS from 'react-native-fs';
import Geolocation from '@react-native-community/geolocation';
import { uploadToGoogleDrive } from './src/UploadDrive';
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { WEB_ID } from '@env';


const chargersData = [
  {
    id: '1',
    name: 'Expressway Charging - Mariam Enterprise',
    address: 'Connaught Place, Delhi',
    distance: '2.1 Km',
    connectors: ['Level 1 DC - 15kW', 'Level 2 DC - 50kW', 'Normal AC - 3kW']
  },
  {
    id: '2',
    name: 'Green EV Charging Hub',
    address: 'Karol Bagh, Delhi',
    distance: '3.5 Km',
    connectors: ['Level 1 DC - 10kW', 'Normal AC - 5kW']
  }
];
const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    scopes: ["https://www.googleapis.com/auth/drive.file"], 
    webClientId: WEB_ID, 
    offlineAccess: true,
  });
};

const App = () => {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);

  const viewShotRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    configureGoogleSignIn();
  }, []);


  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getCurrentLocation();
      }
    } else {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      },
      (error) => console.log(error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };
  // const captureMap = async () => {
  //   try {
  //     if (!viewShotRef.current) {
  //       Alert.alert("Error", "ViewShot reference is not available.");
  //       return;
  //     }
  
  //     // Capture screenshot
  //     const uri = await viewShotRef.current.capture({ format: 'jpg', quality: 0.9 });
  
     
  //     const fileName = `map_capture_${Date.now()}.jpg`; 
  //     const filePath = Platform.OS === 'android' 
  //       ? `${RNFS.PicturesDirectoryPath}/${fileName}`  
  //       : `${RNFS.LibraryDirectoryPath}/${fileName}`; 
  
  //     // Move the file to a permanent location
  //     await RNFS.moveFile(uri, filePath);
  
  //     // Check if file exists
  //     const fileExists = await RNFS.exists(filePath);
  //     if (fileExists) {
  //       console.log('Screenshot saved at:', filePath);
  
  //       // Show success message
  //       if (Platform.OS === 'android') {
         
  //         ToastAndroid.show(`Screenshot saved: ${filePath}`, ToastAndroid.LONG);
  //       } else {
  //         Alert.alert("Screenshot Saved", `Saved at: ${filePath}`);
  //       }
  //     } else {
  //       Alert.alert("Error", "Failed to save screenshot.");
  //     }
  
  //   } catch (error) {
  //     console.error("Capture Error:", error);
  //     Alert.alert("Error", "Something went wrong while capturing the screenshot.");
  //   }
  // };
  const captureAndUpload = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      console.log("Captured image:", uri);
      
      // Save file locally
      const newPath = `${RNFS.DocumentDirectoryPath}/map-screenshot.jpg`;
      await RNFS.moveFile(uri, newPath);
      ToastAndroid.show(`Screenshot saved: ${newPath}`, ToastAndroid.LONG);
      
      // Upload to Google Drive
      await uploadToGoogleDrive(newPath);
    } catch (error) {
      console.error("Error capturing and uploading:", error);
    }
  };
  return (
    <View style={{ flex: 1 }}>
     
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search for the compatible chargers"
          placeholderTextColor="#ccc"
        />
      </View>

     
      <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }} style={{ flex: 1 }}>
      <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={
            location || {
              latitude: 28.6139,
              longitude: 77.209,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }
          }
          showsUserLocation={true}
          showsMyLocationButton={true}
           >
            {/* Charger Locations */}
            {console.log(location, "location====>")}
          {location && (
            <Marker coordinate={location}>
              <View style={{ backgroundColor: '#fc03a9', width: 30, height: 30, borderRadius: 30/2 }} />
              {/* <Image source={require("./src/assets/pink-marker.png")} style={{ width: 40, height: 40 }} /> */}
            </Marker>
          )}
      </MapView>
      </ViewShot>
    
     

      {/* Scrollable Charger Info Cards */}
      <View style={{ position: 'absolute', bottom: 0, width: '100%' }}>
      <FlatList
        horizontal
        data={chargersData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>{item.name}</Text>
            <View style={{flexDirection:"row"}}><Text style={styles.infoText}>{item.address} <Text style={{color:"orange"}}>{item.distance}</Text></Text>
          </View>
            <Text style={styles.infoText}>Supported Connectors:</Text>
            {item.connectors.map((connector, index) => (
              <Text key={index} style={styles.connectorText}>• {connector}</Text>
            ))}
          </View>
        )}
      />
      </View>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity style={styles.fab} onPress={captureAndUpload}>
        <View style={{backgroundColor:"white", borderRadius:5, padding:10}} >
          <Text>Capture</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  searchBarContainer: {
    backgroundColor: '#000',
    padding: 10,
  },
  searchBar: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
  },
  infoBox: {
    backgroundColor: '#000',
    padding: 10,
    margin: 10,
    borderRadius: 10,
    width: 250,
    height:300
  },
  infoTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    color: '#ccc',
    fontSize: 14,
  },
  connectorText: {
    color: '#0f0',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 50,
    elevation: 5,
  },
});

export default App;
