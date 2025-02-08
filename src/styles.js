
import {StyleSheet} from "react-native"

export const styles = StyleSheet.create({
    container: { flex: 1 },
    searchBar: {
      backgroundColor: '#222',
      color: '#fff',
      padding: 10,
      margin: 10,
      borderRadius: 5,
    },
    mapContainer: { flex: 5 },
    map: { flex: 5},
    marker: {
      backgroundColor: '#fc03a9',
      width: 30,
      height: 30,
      borderRadius: 15,
    },
    infoBox: {
      backgroundColor: '#000',
      padding: 10,
      margin: 10,
      borderRadius: 10,
      width: 250,
      height: 300,
    },
    infoTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    infoText: { color: '#ccc', fontSize: 14 },
    distanceText: { color: 'orange' },
    connectorText: { color: '#0f0', fontSize: 14 },
    fab: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      backgroundColor: '#000',
      padding: 15,
      borderRadius: 50,
      elevation: 5,
    },
    fabText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  });