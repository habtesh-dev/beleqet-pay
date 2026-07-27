import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WalletScreen from './app/wallet';
import QrGeneratorScreen from './app/qr-generator';
import HomeScreen from './app/index';

const Stack = createNativeStackNavigator();

/**
 * Merchant Mobile App shell — three core screens for the on-the-go merchant:
 * live wallet balance, a Telebirr/CBE-Birr dynamic QR generator for
 * in-person collection, and a transactions home feed. Push notifications
 * would subscribe to the same Redis Pub/Sub channel the API's
 * Real-time Notification Publisher writes to (wired in the API's queues
 * module) — the Expo push-token registration endpoint is left as the one
 * piece needing a real Expo project ID to test end-to-end.
 */
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#065F46' }, headerTintColor: '#fff' }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Wallet" component={WalletScreen} />
        <Stack.Screen name="Generate QR" component={QrGeneratorScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
