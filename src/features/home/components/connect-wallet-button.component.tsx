'use client';

/**
 * Connect Wallet Button Component
 * Custom wrapper for Thirdweb ConnectButton with custom styling
 */

import { ConnectButton } from 'thirdweb/react';
import { client } from '@/lib/thirdweb-client';

export function ConnectWalletButton() {
  return (
    <ConnectButton 
      client={client} 
      theme="dark"
      locale='es_ES'
      connectButton={{
        label: "Conectar Wallet",
        style: {
          height: "40px",
          fontSize: "14px",
          paddingLeft: "20px",
          paddingRight: "20px",
          borderRadius: "6px",
          fontWeight: "500",
        },
      }}
      detailsButton={{
        style: {
          height: "40px",
          fontSize: "14px",
        },
      }}
    />
  );
}

