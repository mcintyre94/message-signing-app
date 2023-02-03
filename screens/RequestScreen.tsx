import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Divider, Text } from 'react-native-paper';

import { RootStackParamList } from '../App';
import ImageUri from '../components/ImageUri';
import SignMessageButton from '../components/SignMessageButton';
import useAuthorization from '../utils/useAuthorization';

type Props = NativeStackScreenProps<RootStackParamList, 'Request'>;

export default function RequestScreen({ route }: Props) {
  const { selectedAccount } = useAuthorization();

  // GET response
  const [label, setLabel] = useState<string | undefined>(undefined);
  const [icon, setIcon] = useState<string | undefined>(undefined);

  // POST response
  const [data, setData] = useState<string | undefined>(undefined);
  const [state, setState] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState<string | undefined>(undefined);

  // Sign response
  const [signature, setSignature] = useState<Uint8Array | undefined>(undefined);

  // PUT response
  const [isComplete, setIsComplete] = useState('');

  const { url } = route.params;

  const apiUrl = decodeURIComponent(url.slice(7));

  async function getRequest() {
    const response = await fetch(apiUrl, { method: 'GET' });
    const json = await response.json();
    setLabel(json.label);
    setIcon(json.icon);
  }

  useEffect(() => {
    getRequest();
  }, []);

  async function postRequest() {
    if (!label || !selectedAccount) {
      return;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: JSON.stringify({ account: selectedAccount.publicKey.toBase58() }),
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await response.json();
    setData(json.data);
    setState(json.state);
    setMessage(json.message);
  }

  useEffect(() => {
    if (!label || !selectedAccount) {
      return;
    }

    postRequest();
  }, [label, icon, selectedAccount]);

  async function putRequest() {
    if (!selectedAccount || !data || !state || !signature) {
      return;
    }

    const input = {
      account: selectedAccount.publicKey.toBase58(),
      data,
      state,
      signature: Buffer.from(signature).toString('base64'),
    };

    const response = await fetch(apiUrl, {
      method: 'PUT',
      body: JSON.stringify(input),
      headers: { 'Content-Type': 'application/json' },
    });


    setIsComplete(response.status.toString());
  }

  useEffect(() => {
    if (!selectedAccount || !data || !state || !signature) {
      return;
    }
    putRequest();
  }, [selectedAccount, data, state, signature]);

  if (!url.startsWith('solana:')) {
    return <Text variant="bodyLarge">Invalid URL</Text>;
  }

  let toSign = null;
  if (data) {
    const msg = Buffer.from(data, 'base64').toString();
    toSign = msg;
  }

  const canSign = toSign && state && selectedAccount;

  return (
    <>
      <ScrollView style={styles.container}>
        {/* <Text variant="bodySmall">API URL: {apiUrl}</Text>
        <Text variant="bodySmall">
          Connected wallet: {selectedAccount?.publicKey.toBase58()}
        </Text> */}

        <View style={styles.labelIcon}>
          {label ? (
            <Text variant="titleLarge">{label}</Text>
          ) : (
            <Text>Loading...</Text>
          )}
          {icon && <ImageUri uri={icon} height={200} width={200} />}
        </View>

        <Divider style={styles.spacer} />

        {message && <Text>{message}</Text>}

        <Divider style={styles.spacer} />

        {toSign && canSign && (
          <SignMessageButton message={toSign} onSigned={setSignature}>
            Sign!
          </SignMessageButton>
        )}

        <Text>{isComplete ? '✅' : '⏳'}</Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    minHeight: '90%',
  },
  labelIcon: {
    display: 'flex',
    flexDirection: 'row',
  },
  spacer: {
    marginVertical: 16,
    width: '100%',
  },
});
