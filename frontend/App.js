import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import CameraScreen from './screens/CameraScreen';
import FeedScreen from './screens/FeedScreen';
import IncentivesScreen from './screens/IncentivesScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Camera"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Camera') {
              iconName = focused ? 'camera' : 'camera-outline';
            } else if (route.name === 'Feed') {
              iconName = focused ? 'earth' : 'earth-outline';
            } else if (route.name === 'Incentives') {
              iconName = focused ? 'star' : 'star-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2ecc71',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: { backgroundColor: '#111', borderTopWidth: 0 },
        })}
      >
        <Tab.Screen name="Feed" component={FeedScreen} />
        <Tab.Screen name="Camera" component={CameraScreen} />
        <Tab.Screen name="Incentives" component={IncentivesScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
