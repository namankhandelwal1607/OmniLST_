# 🧠 OmniLST Smart Contracts

**OmniLST** is a cross-chain, yield-optimizing Liquid Staking Token (LST) aggregator. Users can deposit ETH and receive `oLST`, a synthetic token backed by a diversified basket of LSTs across chains (e.g., stETH, rETH, LsETH). OmniLST abstracts chain/protocol complexity and allows seamless staking and withdrawal with real-time execution via Chainlink CCIP, Automation, and Functions.

---

## 📁 Directory Overview

This repository contains all core smart contracts for the OmniLST protocol, including:

- **Mock LST protocols** for local testing (Lido, Rocket Pool, Stader)
- **Adapters** for staking protocols
- **Deposit and Withdrawal Managers**
- **CCIP sender/receiver contracts for bridging**
- **Vaults and Burners for `oLST` redemption**
- **Base-specific payout vaults**

---

## 🛠️ Core Components

| Component | Description |
|----------|-------------|
| `DepositManager` | Accepts ETH and splits into LSTs via adapters |
| `WithdrawalManager` | Handles withdrawal from adapters and initiates payouts |
| `VaultReceiver` | Receives bridged ETH from other chains |
| `CCIPSender/Receiver` | Handles cross-chain communication and asset movement |
| `OLstBurn` | Burns `oLST` and emits redemption events |
| `Forwarder` | Sends ETH to user after redemption |
| `PayoutVault` | Base chain payout logic |

---

## 🌐 Deployed Contract Addresses

### 🔵 Ethereum Sepolia

| Contract | Address |
|---------|---------|
| MockLido | `0x9f650e247f428298fdfF482a5c3287a2E1c38112` |
| LidoAdapter | `0x08B618c6606841B2D59735208fB451208Ad6599E` |
| MockStETH | `0xc17475AE77d913C93cb1Adc0bB0AE69cfFCC89f2` |
| MockRocketPool | `0x3De0bE54548218D9337dB01A5f283Ad3266ca4eB` |
| RocketPoolAdapter | `0x091b11C7bD09428fDe740e21Edad707F78691813` |
| RETHAddress | `0x927379D1277de970F06BbFc93761565F3e50d7Ed` |
| MockStader | `0x08cdFC644aAfA4844481D7dA2e590ac98AFB0835` |
| StaderAdapter | `0x481C385DF5cDee3b306089fa20B9E3C08AB6C0b0` |
| MockLsETH | `0x78861580d0017990bC297ca344C23Bc10EAf9046` |
| DepositManagerEthereum | `0xda508d7b40e999b2382260E7fedfd9714D12eA13` |
| WithdrawalManager | `0x83370aef25Ef4730682c7245BAdD84bC88B85Dcd` |
| OLstBurnEthereum | `0xe183376a59905ecDb90deA16FB29E481e44ff056` |
| Forwarder | `0x4957FC9Dc3050815B5a71E3Fcef6Fb3F99fd8E3e` |
| EthereumVaultReceiverArbitrum | `0xe566FD759A60Da902699216Fab491733dC5159DE` |
| EthereumVaultReceiverBase | `0x261ba9F01b075066946c7Aba074eC1674a4AdB84` |
| CCIPWithdrawalSenderArbitrum | `0x87Cd43F5Ca0bDC7957D8cAc1Ce19a928E5EAD3d1` |

---

### 🟣 Arbitrum Sepolia

| Contract | Address |
|---------|---------|
| CCIPSenderArbitrum | `0xF27bB064e75bAA84803D4aB590AC2FcA60B0b894` |
| DepositManagerArbitrum | `0x8A4CB2A3770bD1ABc8Aa416f067E67537Ba552e9` |
| OLstBurnArbitrum | `0x1F39DeF495178b1505f47685FB62AA25A25e2D24` |
| CCIPWithdrawalReceiverArbitrum | `0x2F8C66A81de13d4DB44166F162F516937DB284aD` |

---

### 🟢 Base Sepolia

| Contract | Address |
|---------|---------|
| WETH | `0x2F8C66A81de13d4DB44166F162F516937DB284aD` |
| DepositManagerBase | `0x52A0fD607130A4A5c82FAAB354abc6bD9E10800f` |
| CCIPSenderBase | `0xEaeEf56650b0E31Cc71B351c70f2bb7B762A7b70` |
| OLstBurnBase | `0x5decEbEb932bCa7158520b169236855317a472C3` |
| BasePayoutVault | `0xEFcc8ee17eB0070c02e9aCbD5Bf51eEd7b232b39` |

---