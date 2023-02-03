import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Appbar, Button, Portal, Text } from 'react-native-paper';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { BarcodeFormat, useScanBarcodes } from 'vision-camera-code-scanner';

import { RootStackParamList } from '../App';
import AccountInfo from '../components/AccountInfo';
import SignMessageButton from '../components/SignMessageButton';
import useAuthorization from '../utils/useAuthorization';

export default function MainScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList>) {
  const { accounts, onChangeAccount, selectedAccount } = useAuthorization();
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const devices = useCameraDevices();
  const device = devices.back;
  const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE], {
    checkInverted: true,
  });

  async function getCameraPermission() {
    const permission = await Camera.getCameraPermissionStatus();
    setHasCameraPermission(permission === 'authorized');
  }

  useEffect(() => {
    getCameraPermission();
  }, []);

  async function requestCameraPermission() {
    const status = await Camera.requestCameraPermission();
    setHasCameraPermission(status === 'authorized');
  }

  useEffect(() => {
    const barcode = barcodes.find(b => b.displayValue !== undefined);
    if (!barcode) {
      return;
    }

    navigation.navigate('Request', { url: barcode.displayValue as string });
  }, [barcodes, navigation]);

  return (
    <>
      <Appbar.Header elevated mode="center-aligned">
        <Appbar.Content title="Message Signing Wallet" />
      </Appbar.Header>
      <Portal.Host>
        <ScrollView contentContainerStyle={styles.container}>
          <Text variant="bodySmall">
            Camera permission: {hasCameraPermission.toString()}
          </Text>
          <Button mode="outlined" onPress={requestCameraPermission}>
            Request camera permission
          </Button>
          <Button
            mode="outlined"
            onPress={() => setShowCamera(true)}
            disabled={!hasCameraPermission}>
            Scan
          </Button>
          {showCamera && device ? (
            <>
              <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                frameProcessor={frameProcessor}
                frameProcessorFps={5}
              />
              <Button style={styles.top} onPress={() => setShowCamera(false)}>
                Close
              </Button>
            </>
          ) : (
            <SignMessageButton message={'just connecting :)'}>
              Connect wallet
            </SignMessageButton>
          )}
        </ScrollView>
        {accounts && selectedAccount ? (
          <AccountInfo
            accounts={accounts}
            onChange={onChangeAccount}
            selectedAccount={selectedAccount}
          />
        ) : null}
      </Portal.Host>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    minHeight: '90%',
  },
  shell: {
    height: '100%',
  },
  spacer: {
    marginVertical: 16,
    width: '100%',
  },
  textInput: {
    width: '100%',
  },
  top: {
    position: 'absolute',
    top: 0,
  },
  barcodeTextURL: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
});
