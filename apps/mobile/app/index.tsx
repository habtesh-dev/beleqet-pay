import { View, Text, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fetan Ride — Merchant ID 7039636</Text>
      <Button title="View Wallet" onPress={() => navigation.navigate('Wallet')} />
      <View style={{ height: 12 }} />
      <Button title="Generate Payment QR" onPress={() => navigation.navigate('Generate QR')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 12, justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
});
