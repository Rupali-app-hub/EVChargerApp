import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, PermissionsAndroid, Platform, ToastAndroid } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import ViewShot from 'react-native-view-shot';
import RNFS from 'react-native-fs';
import Geolocation from '@react-native-community/geolocation';
import { uploadToGoogleDrive } from './src/UploadDrive';
import { configureGoogleSignIn } from './src/utils/utils';
import { chargersData } from './src/data/chargersData';
import { styles } from './src/styles';

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
      <TextInput style={styles.searchBar} placeholder="Search for chargers" placeholderTextColor="#ccc" />
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
      
      <FlatList
        horizontal
        data={chargersData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>{item.name}</Text>
            <Text style={styles.infoText}>{item.address} <Text style={styles.distanceText}>{item.distance}</Text></Text>
            <Text style={styles.infoText}>Supported Connectors:</Text>
            {item.connectors.map((connector, index) => (
              <Text key={index} style={styles.connectorText}> {connector}</Text>
            ))}
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={captureAndUpload}>
        <Text style={styles.fabText}>Capture</Text>
      </TouchableOpacity>
    </View>
  );
};

export default App;
