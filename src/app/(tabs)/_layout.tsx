import { Tabs } from 'expo-router';

import { TabBar } from '@/components/TabBar';
import { de } from '@/i18n/de';

/** Drei Tabs (verbindlich): Karte · Orte · Sammlung — mit schwebender Glas-Leiste (AP-D). */
export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: de.tabs.karte }} />
      <Tabs.Screen name="orte" options={{ title: de.tabs.orte }} />
      <Tabs.Screen name="sammlung" options={{ title: de.tabs.sammlung }} />
    </Tabs>
  );
}
