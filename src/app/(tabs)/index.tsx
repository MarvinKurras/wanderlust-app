import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { de } from '@/i18n/de';

export default function KarteScreen() {
  return (
    <PlaceholderScreen
      eyebrow={de.platzhalter.karteEyebrow}
      title={de.platzhalter.karteTitle}
      body={de.platzhalter.karteBody}
    />
  );
}
