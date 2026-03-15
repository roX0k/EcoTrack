import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Image, Dimensions } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../config';

export default function FeedScreen() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const res = await axios.get(`${API_URL}/reports`);
      setReports(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [])
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#2ecc71" style={{ marginTop: 100 }} />
      ) : (
        <MapView 
          style={styles.map}
          initialRegion={{
            latitude: reports[0]?.latitude || 37.78825,
            longitude: reports[0]?.longitude || -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {reports.map((report) => (
            <Marker
              key={report._id}
              coordinate={{ latitude: report.latitude, longitude: report.longitude }}
              pinColor="#2ecc71"
            >
              <Callout tooltip>
                <View style={styles.calloutContainer}>
                  <Text style={styles.desc}>{report.description}</Text>
                  <Text style={styles.time}>{new Date(report.timestamp).toLocaleString()}</Text>
                  {/* Note: React Native Maps callouts have known issues rendering external images reliably on Android depending on the package version, but text always works. */}
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      )}
      <View style={styles.headerOverlay}>
        <Text style={styles.headerText}>Global EcoMap</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  headerOverlay: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  headerText: {
    color: '#2ecc71',
    fontWeight: 'bold',
    fontSize: 20,
  },
  calloutContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    width: 200,
  },
  desc: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
  },
  time: {
    color: '#666',
    fontSize: 12,
  }
});
