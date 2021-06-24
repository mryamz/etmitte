import { BeaconWallet } from '@taquito/beacon-wallet';
import { TezosToolkit } from '@taquito/taquito';
import { tzip12 } from '@taquito/tzip12';
import axios from 'axios';

const Tzip12Module = require('@taquito/tzip12').Tzip12Module;
const Tzip16Module = require('@taquito/tzip16').Tzip16Module;

const Tezos = new TezosToolkit(process.env.VUE_APP_TEZOS_RPC_URL);

Tezos.addExtension(new Tzip12Module());
Tezos.addExtension(new Tzip16Module());

const wallet = new BeaconWallet({
  name: process.env.VUE_APP_TEZOS_DAPP_NAME,
  preferredNetwork: process.env.VUE_APP_TEZOS_NETWORK,
  colorMode: 'dark'
});

Tezos.setWalletProvider(wallet);

const network = {
  type: process.env.VUE_APP_TEZOS_NETWORK,
  rpcUrl: process.env.VUE_APP_TEZOS_RPC_URL
};

const signMessage = async (msg, address) => {
  msg = "Tezos Signed Message: " + msg;
  const input = Buffer.from(msg);
  const prefix = Buffer.from("0501", "hex");
  const len_bytes = Buffer.from(msg.length.toString(16).padStart(8, '0'), "hex");
  msg = Buffer.concat([prefix, len_bytes, input], prefix.length + len_bytes.length + input.length);
  msg = msg.toString('hex');

  let signedMsg = false;
  try {
    signedMsg = (await wallet.client.requestSignPayload({ payload: msg, sourceAddress: address })).signature;
  } catch(signPayloadError) {
    console.error(signPayloadError);
  }

  return { msg, signedMsg };
};

const signLoginRequest = async () => {
  const acct = await getActiveAccount();
  return await signMessage(
    JSON.stringify({
      type: 'auth',
      name: process.env.VUE_APP_TEZOS_DAPP_NAME,
      pkh: await acct.address,
      expires: new Date().getTime() + (5 * 60 * 1000)
    }),
    acct.address
  );
};

const clearActiveAccount = () => {
  wallet.clearActiveAccount();
};

const disconnect = () => {
  wallet.disconnect();
};

const getActiveAccount = async () => {
  return await wallet.client.getActiveAccount();
};

const getNetworkPermission = async () => {
  const activeAccount = await wallet.client.getActiveAccount();

  if (!activeAccount) {
    await wallet.requestPermissions({ network });
    return getActiveAccount();
  }
}

const sendMessage = async(recipients, title, body) => {
  var to = recipients.split(',');

  console.log(to, title, body);
}

const getTokenContract = async (contractAddress) => {
  return await Tezos.contract.at(contractAddress, tzip12);
}

const getTokenMetadata = async (tokenContract, tokenId) => {
  return await tokenContract.tzip12().getTokenMetadata(tokenId)
    .then (tokenMetadata => {
      // let token = JSON.stringify(tokenMetadata, null, 2);
      return tokenMetadata;
    })
    .catch(error => console.log(`Error: ${JSON.stringify(error, null, 2)}`));
}

const getWalletAssets = async (address) => {
  if (address === null || address === '') { return []; }

  const network = 'mainnet';
  let balances = [];
  let page = 0;
  let size = 10;
  let url = `https://api.better-call.dev/v1/account/${network}/${address}/token_balances`;
  const results = await axios.get(url);
  balances.push(...results.data.balances);
  while (results.data.total > balances.length) {
    page += 1;
    url = `https://api.better-call.dev/v1/account/${network}/${address}/token_balances?offset=${page * size}`;
    console.log(url);
    const results = await axios.get(url);
    balances.push(...results.data.balances);
  }

  return balances;
}

export {
  Tezos,
  wallet,
  clearActiveAccount,
  disconnect,
  getActiveAccount,
  getNetworkPermission,
  getTokenContract,
  getTokenMetadata,
  getWalletAssets,
  signLoginRequest,
  signMessage,
  sendMessage
};
