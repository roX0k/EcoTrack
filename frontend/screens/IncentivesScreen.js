import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function IncentivesScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="leaf" size={100} color="#2ecc71" />
      <Text style={styles.title}>Your Impact</Text>
      <View style={styles.statsCard}>
        <Text style={styles.statLine}>📸 Reports Submitted: <Text style={styles.bold}>Tracked Automatically!</Text></Text>
        <Text style={styles.statLine}>💖 Eco-Points Earned: <Text style={styles.bold}>Coming Soon</Text></Text>
      </View>
      <Text style={styles.message}>
        Keep snapping photos of pollution to help civic cleaners target problem areas in your neighborhood.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 40,
  },
  statsCard: {
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 15,
    width: '100%',
    marginBottom: 30,
  },
  statLine: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 10,
  },
  bold: {
    color: '#2ecc71',
    fontWeight: 'bold',
  },
  message: {
    color: '#888',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
});
