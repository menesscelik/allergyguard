import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { PRIMARY, PrimaryButton } from '@/components/form';
import { Palette, Radius } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

type ScannedDrug = {
  name: string;
  barcode: string;
  ingredients: string[];
};

export default function ScanScreen() {
  const { session } = useAuth();
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

    const { data: res, error } = await supabase.functions.invoke('scan-barcode', {
      body: { barcode: data },
    });

    setBusy(false);
    if (error || !res?.found) {
      setNotFound(data);
      return;
    }
    setDrug(res.drug as ScannedDrug);
  }

  function resetScan() {
    setDrug(null);
    setNotFound(null);
    setLocked(false);
  }

  async function addToAllergies() {
    if (!drug || !session) return;
    setAdding(true);
    const { error } = await supabase.from('allergies').insert({
      user_id: session.user.id,
      drug_name: drug.name,
      active_ingredients: drug.ingredients,
      barcode: drug.barcode,
      severity: 'unknown',
    });
    setAdding(false);
    if (error) {
      Alert.alert('Hata', 'Eklenemedi: ' + error.message);
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
        <Stack.Screen options={{ title: 'Barkod Tara' }} />
        <View style={styles.center}>
          <Text style={styles.permissionText}>
            Barkod okumak için kamera izni gerekiyor.
          </Text>
          <PrimaryButton title="Kameraya İzin Ver" onPress={requestPermission} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Barkod Tara' }} />
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
              <Text style={styles.hint}> Barkod sorgulanıyor...</Text>
            </View>
          )}

          {!busy && !drug && !notFound && (
            <Text style={styles.hint}>
              📷 İlaç kutusunun altındaki çizgili barkodu kameraya göster
            </Text>
          )}

          {!busy && notFound && (
            <>
              <Text style={styles.notFoundTitle}>Barkod bulunamadı</Text>
              <Text style={styles.hint}>
                {notFound} — TİTCK listesinde yok. İsimle aramayı deneyebilirsin.
              </Text>
              <PrimaryButton title="Tekrar Tara" onPress={resetScan} />
            </>
          )}

          {!busy && drug && (
            <>
              <Text style={styles.drugName}>{drug.name}</Text>
              <Text style={styles.ingredients}>
                Etken madde: {drug.ingredients.join(', ')}
              </Text>
              <PrimaryButton
                title="🧪 Riski Test Et"
                onPress={testDrug}
              />
              <Pressable style={styles.secondaryButton} onPress={addToAllergies} disabled={adding}>
                <Text style={styles.secondaryButtonText}>
                  {adding ? 'Ekleniyor...' : '➕ Alerjilerime Ekle'}
                </Text>
              </Pressable>
              <Pressable onPress={resetScan}>
                <Text style={styles.rescanText}>Tekrar tara</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.black,
  },
  camera: {
    flex: 1,
  },
  panel: {
    backgroundColor: Palette.surface,
    borderTopLeftRadius: Radius.large,
    borderTopRightRadius: Radius.large,
    padding: 20,
    paddingBottom: 36,
    gap: 10,
  },
  center: {
    flex: 1,
    backgroundColor: Palette.surface,
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: 24,
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: Palette.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  hint: {
    fontSize: 14,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  notFoundTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.warning,
    textAlign: 'center',
  },
  drugName: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.text,
  },
  ingredients: {
    fontSize: 14,
    color: Palette.textSecondary,
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: PRIMARY,
    borderRadius: Radius.medium,
    paddingVertical: 13,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: PRIMARY,
    fontSize: 16,
    fontWeight: '700',
  },
  rescanText: {
    color: Palette.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    textDecorationLine: 'underline',
  },
});
