import { useIsFocused } from 'expo-router';
import { StatusBar, type StatusBarStyle } from 'expo-status-bar';

/**
 * Statusleisten-Stil für genau den sichtbaren Screen. Tabs bleiben gemountet —
 * darum gilt der Stil nur, solange der Screen fokussiert ist; sonst greift
 * wieder der Standard aus dem Root-Layout (dunkel auf Pergament).
 */
export function FocusStatusBar({ style }: { style: StatusBarStyle }) {
  const focused = useIsFocused();
  return focused ? <StatusBar style={style} /> : null;
}
