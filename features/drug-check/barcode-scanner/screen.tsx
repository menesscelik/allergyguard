import { styles } from './styles';
import { addScannedAllergy, scanBarcode, type ScannedDrug } from './service';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';

import { PRIMARY, PrimaryButton } from '@/components/form';
import { useAuth } from '@/lib/auth-context';
import { useLocalization } from '@/lib/localization-context';

export default function ScanScreen() {
  const { session } = useAuth();
  const { t } = useLocalization();
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const [drug, setDrug] = useState<ScannedDrug | null>(null);
  const [notFound, setNotFound] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [adding, setAdding] = useState(false);

  async function handleBarcode({ data }: { data: string }) {
    if (locked || busy) return;
    setLocked(true);
    setBusy(true);

    const { drug: scannedDrug, found, error } = await scanBarcode(data);

    setBusy(false);
    if (error || !found || !scannedDrug) {
      setNotFound(data);
      return;
    }
    setDrug(scannedDrug);
  }

  function resetScan() {
    setDrug(null);
    setNotFound(null);
    setLocked(false);
  }

  async function addToAllergies() {
    if (!drug || !session) return;
    setAdding(true);
    const { error } = await addScannedAllergy(session.user.id, drug);
    setAdding(false);
    if (error) {
      Alert.alert(t('common.error'), error.message);
      return;
    }
    Alert.alert('Eklendi ✅', `"${drug.name}" alerji listene eklendi.`, [
      { text: 'Tamam', onPress: () => router.back() },
    ]);
  }

  function testDrug() {
    if (!drug) return;
    router.replace({
      pathname: '/drug-result',
      params: { name: drug.name, ingredients: JSON.stringify(drug.ingredients) },
    });
  }

  if (!permission) {
    return <View style={styles.center} />;
  }

  if (!permission.granted) {
    return (
      <>
        <Stack.Screen options={{ title: t('scan.title') }} />
        <View style={styles.center}>
          <Text style={styles.permissionText}>{t('scan.permission')}</Text>
          <PrimaryButton title={t('scan.allow')} onPress={requestPermission} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t('scan.title') }} />
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8'] }}
          onBarcodeScanned={locked ? undefined : handleBarcode}
        />

        {/* Alt bilgi kartı */}
        <View style={styles.panel}>
          {busy && (
            <View style={styles.centerRow}>
              <ActivityIndicator color={PRIMARY} />
              <Text style={styles.hint}> {t('scan.querying')}</Text>
            </View>
          )}

          {!busy && !drug && !notFound && (
            <Text style={styles.hint}>📷 {t('scan.hint')}</Text>
          )}

          {!busy && notFound && (
            <>
              <Text style={styles.notFoundTitle}>{t('scan.notFound')}</Text>
              <Text style={styles.hint}>{t('scan.notFoundMessage', { barcode: notFound })}</Text>
              <PrimaryButton title={t('scan.retry')} onPress={resetScan} />
            </>
          )}

          {!busy && drug && (
            <>
              <Text style={styles.drugName}>{drug.name}</Text>
              <Text style={styles.ingredients}>
                Etken madde: {drug.ingredients.join(', ')}
              </Text>
              <PrimaryButton
                title={`🧪 ${t('scan.test')}`}
                onPress={testDrug}
              />
              <Pressable style={styles.secondaryButton} onPress={addToAllergies} disabled={adding}>
                <Text style={styles.secondaryButtonText}>
                  {adding ? t('common.loading') : `➕ ${t('scan.add')}`}
                </Text>
              </Pressable>
              <Pressable onPress={resetScan}>
                <Text style={styles.rescanText}>{t('scan.rescan')}</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </>
  );
}
