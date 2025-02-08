import React from 'react';
import { View, Text, FlatList, Image } from 'react-native';
import {styles} from './styles';

interface Charger {
  id: number;
  name: string;
  address: string;
  distance: string;
  connectors: string[];
}

interface Props {
  chargers: Charger[];
}

const ChargerList: React.FC<Props> = ({ chargers }) => {
  return (
    <FlatList
      horizontal
      data={chargers}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>{item.name}</Text>
          <Text style={styles.infoText}>
            {item.address} <Text style={styles.distanceText}>{item.distance}</Text>
          </Text>
          <Text style={styles.infoText}>Supported Connectors:</Text>
          {item.connectors.map((connector, index) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image 
                source={require('./assets/img.png')} 
                style={{ width: 26, height: 26, margin: 5, tintColor:"white" }} 
              />
              <Text style={styles.connectorText}>{connector}</Text>
            </View>
          ))}
        </View>
      )}
    />
  );
};

export default ChargerList;
