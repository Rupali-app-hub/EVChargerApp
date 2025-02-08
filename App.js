import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, PermissionsAndroid, Platform, ToastAndroid, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import ViewShot from 'react-native-view-shot';
import RNFS from 'react-native-fs';
import Geolocation from '@react-native-community/geolocation';
import { uploadToGoogleDrive } from './src/UploadDrive';
import { configureGoogleSignIn } from './src/utils/utils';
import { chargersData } from './src/data/chargersData';
import { styles } from './src/styles';
import ChargerList from './src/ChargerList';

const App = () => {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);

  const viewShotRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    requestLocationPermission();
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
        setRegion({ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
      },
      (error) => console.log(error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const captureAndUpload = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      const newPath = `${RNFS.DocumentDirectoryPath}/map-screenshot.jpg`;
      await RNFS.moveFile(uri, newPath);
      ToastAndroid.show(`Screenshot saved: ${newPath}`, ToastAndroid.LONG);
      await uploadToGoogleDrive(newPath);
    } catch (error) {
      console.error("Error capturing and uploading:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        <Image
          source={require('./src/assets/threebar.png')}
          style={styles.imgStyle}
          tintColor={"gray"}
        />
        <TextInput
          style={styles.textStyle}
          placeholder="Search for chargers"
          placeholderTextColor="#ccc"
        />
      </View>


      <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }} style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region || { latitude: 28.6139, longitude: 77.209, latitudeDelta: 0.1, longitudeDelta: 0.1 }}
          showsUserLocation
          showsMyLocationButton
        >
          {location && <Marker coordinate={location} style={styles.marker} />}
        </MapView>
      </ViewShot>
      
      <View >
        <ChargerList chargers={chargersData} />
      </View>
      <TouchableOpacity style={styles.fab} onPress={captureAndUpload}>
        <Text style={styles.fabText}>Capture</Text>
      </TouchableOpacity>
    </View>
  );
};

export default App;
