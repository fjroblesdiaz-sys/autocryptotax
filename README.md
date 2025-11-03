# Auto Crypto Tax 🪙💰

**Auto Crypto Tax** is a web application designed to simplify cryptocurrency tax declarations for Spanish citizens. The platform enables users to connect their cryptocurrency wallets and automatically generate tax reports ready to submit to the Agencia Tributaria (Hacienda).

## 📋 Overview

Managing cryptocurrency tax obligations in Spain can be complex and time-consuming. Auto Crypto Tax streamlines this process by:

- **Connecting to multiple wallets**: Integrate various cryptocurrency wallets to consolidate all your transactions
- **Automated report generation**: Automatically calculate gains, losses, and generate compliant tax reports
- **Spain-specific compliance**: Reports formatted according to Spanish tax authority (Hacienda) requirements
- **User-friendly interface**: Modern, intuitive UI built with best practices in mind

## 🎯 Purpose

The Spanish tax system requires citizens to declare cryptocurrency holdings and transactions. This includes:

- Model 720: Declaration of assets and rights abroad
- Model 100: Personal Income Tax (IRPF) - for gains and losses
- Model 714: Wealth Tax (Impuesto sobre el Patrimonio)

Auto Crypto Tax aims to automate the generation of these declarations, reducing errors and saving time for Spanish cryptocurrency investors.

## 🚀 Tech Stack

This project is built with modern web technologies:

- **[Next.js 15](https://nextjs.org)**: React framework with App Router
- **[TypeScript](https://www.typescriptlang.org)**: Type-safe development
- **[Tailwind CSS](https://tailwindcss.com)**: Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com)**: High-quality, accessible UI components
- **[pnpm](https://pnpm.io)**: Fast, efficient package manager

## 🛠️ Getting Started

### Prerequisites

- Node.js 18.x or higher
- pnpm (recommended) or npm/yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/miguel/crypto-tax.git
cd crypto-tax
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
pnpm build
pnpm start
```

## 📁 Project Structure

```
crypto-tax/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components (including shadcn/ui)
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utility functions and helpers
├── public/              # Static assets
└── ...config files
```

## ✅ Implemented Features

- [x] Multi-wallet integration (MetaMask, WalletConnect, etc.)
- [x] Blockchain transaction import (Ethereum, Base, Polygon, etc.)
- [x] Exchange integration:
  - [x] Binance (via API Key)
  - [x] Coinbase Advanced Trade (via CDP API Key)
  - [ ] WhiteBit (in progress)
- [x] Automated tax calculation based on Spanish regulations (FIFO method)
- [x] Model 100 report generation (IRPF)
- [x] Historical transaction tracking
- [x] Capital gains/loss calculation (FIFO method)
- [x] PDF export functionality
- [x] Server-side report generation for reliability

## 🔮 Planned Features

- [ ] Model 720 and 714 report generation
- [ ] CSV export functionality
- [ ] Multi-year tax history
- [ ] User authentication and data encryption
- [ ] Subscription system with annual limits
- [ ] Admin panel for business management
- [ ] White-label template system for third parties
- [ ] Dark/Light mode

## 🔒 Security & Privacy

Cryptocurrency tax information is sensitive. This project will implement:

- End-to-end encryption for wallet data
- Secure authentication
- No storage of private keys
- Compliance with GDPR regulations

## 🤝 Contributing

Contributions are welcome! This project is in active development.

## 📄 License

This project is for personal use. License information to be determined.

## ⚠️ Disclaimer

This tool is designed to assist with tax reporting but does not constitute financial or legal advice. Always consult with a qualified tax professional regarding your specific tax situation. The accuracy of generated reports should be verified before submission to tax authorities.

---

**Status**: 🚧 In Development

Built with ❤️ for the Spanish crypto community
