import Feather from '@expo/vector-icons/Feather';
import { Tabs } from 'expo-router';

import { colors, fonts } from '@/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brassLight,
        tabBarInactiveTintColor: colors.paperOnPineDim,
        tabBarStyle: {
          backgroundColor: colors.pine,
          borderTopColor: colors.pineSoft,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.monoMedium,
          fontSize: 10,
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Karte',
          tabBarIcon: ({ color, size }) => <Feather name="map" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="orte"
        options={{
          title: 'Orte',
          tabBarIcon: ({ color, size }) => <Feather name="list" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="sammlung"
        options={{
          title: 'Sammlung',
          tabBarIcon: ({ color, size }) => <Feather name="award" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
