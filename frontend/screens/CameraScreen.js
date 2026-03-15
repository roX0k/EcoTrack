import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Platform, TextInput, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import axios from 'axios';
import { API_URL } from '../config';

export default function CameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState('Found some pollution');
  const [location, setLocation] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
      }
    })();
  }, []);

  if (!permission) {
    return <View />;
  }
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', color: 'white' }}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.text}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const options = { quality: 0.5, base64: true };
      const data = await cameraRef.current.takePictureAsync(options);
      setPhoto(data);
      
      // Auto fetch location invisibly in background
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    }
  };

  const cancelReport = () => {
    setPhoto(null);
    setDescription('Found some pollution');
  };

  const uploadReport = async () => {
    if (!photo || !location) {
      Alert.alert("Wait a second!", "Location is still loading or photo is missing.");
      return;
    }
    
    setUploading(true);
    try {
      // 1. Send the report
      const payload = {
        imageUrl: `data:image/jpeg;base64,${photo.base64}`,
        latitude: location.latitude,
        longitude: location.longitude,
        description: description,
      };

      await axios.post(`${API_URL}/report`, payload);
      
      // 2. Clear out the photo
      setPhoto(null);
      
      // 3. Immediately fetch encouragement to give Locket-style popup
      const encRes = await axios.get(`${API_URL}/encouragement`);
      Alert.alert("Report Sent! 🌍", encRes.data.message);
      
    } catch (error) {
      console.error(error);
      Alert.alert("Upload Failed", "Make sure your backend server is running and accessible.");
    } finally {
      setUploading(false);
    }
  };

  // If a photo was taken, show the preview and upload flow
  if (photo) {
    return (
      <View style={styles.container}>
        <Image style={styles.preview} source={{ uri: photo.uri }} />
        <View style={styles.overlay}>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Add a quick note..."
            placeholderTextColor="#ccc"
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={cancelReport}>
              <Text style={styles.text}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.submitBtn]} onPress={uploadReport} disabled={uploading}>
              {uploading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.text}>Send 🚀</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Live Camera View (Locket Style default screen)
  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing="back">
        <View style={styles.snapContainer}>
          <TouchableOpacity style={styles.snapButton} onPress={takePicture}>
            <View style={styles.snapInner} />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  snapContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 40,
  },
  snapButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  snapInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  preview: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    padding: 15,
    borderRadius: 10,
    flex: 0.48,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#555',
  },
  submitBtn: {
    backgroundColor: '#2ecc71',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});
