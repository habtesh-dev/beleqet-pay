import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

export default function WalletScreen() {
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/v1/merchants/me/balance`)
      .then((r) => r.json())
      .then((d) => setBalance(d.balance ?? '0.00'))
      .catch(() => setBalance('0.00'));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Ledger balance</Text>
      {balance === null ? <ActivityIndicator /> : <Text style={styles.balance}>{balance} ETB</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  label: { color: '#64748B' },
  balance: { fontSize: 32, fontWeight: '700' },
});
