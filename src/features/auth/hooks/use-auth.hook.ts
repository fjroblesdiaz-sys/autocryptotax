import { useActiveAccount, useActiveWalletConnectionStatus } from 'thirdweb/react';

export const useAuth = () => {
  const account = useActiveAccount();
  const connectionStatus = useActiveWalletConnectionStatus();

  const isConnected = connectionStatus === 'connected' && !!account;
  const isConnecting = connectionStatus === 'connecting';
  const address = account?.address;

  return {
    account,
    address,
    isConnected,
    isConnecting,
    connectionStatus,
  };
};
