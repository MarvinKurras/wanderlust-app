import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { de } from '@/i18n/de';

export default function SammlungScreen() {
  return (
    <PlaceholderScreen
      variant="pine"
      eyebrow={de.platzhalter.sammlungEyebrow}
      title={de.platzhalter.sammlungTitle}
      body={de.platzhalter.sammlungBody}
    />
  );
}
