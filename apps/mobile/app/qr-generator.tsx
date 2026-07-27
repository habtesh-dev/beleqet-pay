import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

/**
 * Encodes a Beleqet Pay checkout deep link (tx amount + merchant id) into a
 * QR the customer scans in Telebirr/CBE Birr apps — mirroring how Chapa's
 * own merchant app QR flow works.
 */
export default function QrGeneratorScreen() {
  const [amount, setAmount] = useState('');
  const merchantId = '7039636';

  const payload = amount
    ? `beleqetpay://checkout?merchant=${merchantId}&amount=${amount}&currency=ETB`
    : null;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Amount in ETB"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      {payload && <QRCode value={payload} size={220} />}
      <Text style={styles.hint}>Customer scans this in their mobile money app to pay.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 10, width: '100%' },
  hint: { color: '#64748B', fontSize: 12, textAlign: 'center' },
});
