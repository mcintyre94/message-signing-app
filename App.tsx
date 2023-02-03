import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { clusterApiUrl, PublicKey, PublicKeyInitData } from '@solana/web3.js';
import React, { Suspense } from 'react';
import {
  ActivityIndicator,
  AppState,
  SafeAreaView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Cache, SWRConfig } from 'swr';

import SnackbarProvider from './components/SnackbarProvider';
import MainScreen from './screens/MainScreen';
import RequestScreen from './screens/RequestScreen';

const DEVNET_ENDPOINT = /*#__PURE__*/ clusterApiUrl('devnet');

function cacheReviver(key: string, value: any) {
  if (key === 'publicKey') {
    return new PublicKey(value as PublicKeyInitData);
  } else {
    return value;
  }
}

const STORAGE_KEY = 'app-cache';
let initialCacheFetchPromise: Promise<void>;
let initialCacheFetchResult: any;
function asyncStorageProvider() {
  if (initialCacheFetchPromise == null) {
    initialCacheFetchPromise = AsyncStorage.getItem(STORAGE_KEY).then(
      result => {
        initialCacheFetchResult = result;
      },
    );
    throw initialCacheFetchPromise;
  }
  let storedAppCache;
  try {
    storedAppCache = JSON.parse(initialCacheFetchResult, cacheReviver);
  } catch { }
  const map = new Map(storedAppCache || []);
  initialCacheFetchResult = undefined;
  function persistCache() {
    const appCache = JSON.stringify(Array.from(map.entries()));
    AsyncStorage.setItem(STORAGE_KEY, appCache);
  }
  AppState.addEventListener('change', state => {
    if (state !== 'active') {
      persistCache();
    }
  });
  AppState.addEventListener('memoryWarning', () => {
    persistCache();
  });
  return map as Cache<any>;
}

export type RootStackParamList = {
  Home: undefined;
  Request: { url: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const scheme = useColorScheme();

  return (
    <ConnectionProvider
      config={{ commitment: 'processed' }}
      endpoint={DEVNET_ENDPOINT}>
      <SafeAreaView style={styles.shell}>
        <PaperProvider>
          <SnackbarProvider>
            <Suspense
              fallback={
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size="large"
                    style={styles.loadingIndicator}
                  />
                </View>
              }>
              <SWRConfig value={{ provider: asyncStorageProvider }}>
                <NavigationContainer
                  theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
                  <Stack.Navigator initialRouteName="Home">
                    <Stack.Screen name="Home" component={MainScreen} />
                    <Stack.Screen
                      name="Request"
                      component={RequestScreen}
                      initialParams={{
                        url: 'solana:https%3A//signing-prototype-dapp.vercel.app/api/signing?channelId%3D0dfb7326-bd03-4f5b-ba0f-6e85eff3027d',
                      }}
                    />
                  </Stack.Navigator>
                </NavigationContainer>
              </SWRConfig>
            </Suspense>
          </SnackbarProvider>
        </PaperProvider>
      </SafeAreaView>
    </ConnectionProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    height: '100%',
    justifyContent: 'center',
  },
  loadingIndicator: {
    marginVertical: 'auto',
  },
  shell: {
    height: '100%',
  },
});
