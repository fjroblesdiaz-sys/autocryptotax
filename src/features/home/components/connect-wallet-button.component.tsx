'use client';

/**
 * Connect Wallet Button Component
 * Custom wrapper for Thirdweb ConnectButton with custom styling
 * Includes support for Web3 wallets and social login
 */

import { ConnectButton } from 'thirdweb/react';
import { createWallet, inAppWallet } from 'thirdweb/wallets';
import { client } from '@/lib/thirdweb-client';

const wallets = [
  inAppWallet({
    auth: {
      options: [
        'google',
        'apple',
        'facebook',
        'email',
        'phone',
      ],
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.rabby"),
  createWallet("app.phantom"),
  createWallet("walletConnect"),
];

export function ConnectWalletButton() {
  return (
    <ConnectButton 
      client={client}
      wallets={wallets}
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
      connectModal={{
        size: "wide",
        titleIcon: "",
        showThirdwebBranding: false,
      }}
      showAllWallets={true}
    />
  );
}

