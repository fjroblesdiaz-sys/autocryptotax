import { useActiveAccount, useActiveWalletConnectionStatus, useActiveWallet, useDisconnect } from 'thirdweb/react';

export const useAuth = () => {
  const account = useActiveAccount();
  const connectionStatus = useActiveWalletConnectionStatus();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();

  const isConnected = connectionStatus === 'connected' && !!account;
  const isConnecting = connectionStatus === 'connecting';
  const address = account?.address;

  const logout = async () => {
    try {
      if (wallet) {
        await disconnect(wallet);
        console.log('Disconnected successfully');
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  return {
    account,
    address,
    isConnected,
    isConnecting,
    connectionStatus,
    logout,
  };
};
