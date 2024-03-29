import { BeaconWallet } from '@taquito/beacon-wallet';
import { TezosToolkit } from '@taquito/taquito';
import { tzip12 } from '@taquito/tzip12';
import axios from 'axios';

const Tzip12Module = require('@taquito/tzip12').Tzip12Module;
const Tzip16Module = require('@taquito/tzip16').Tzip16Module;

const Tezos = new TezosToolkit(process.env.VUE_APP_TEZOS_RPC_URL);

Tezos.addExtension(new Tzip12Module());
Tezos.addExtension(new Tzip16Module());

const contractAddress = process.env.VUE_APP_TEDDY_MESSENGER;

const wallet = new BeaconWallet({
  name: process.env.VUE_APP_TEZOS_DAPP_NAME,
  preferredNetwork: process.env.VUE_APP_TEZOS_NETWORK,
  colorMode: 'dark'
});

//Tezos.setWalletProvider(wallet);
Tezos.setProvider({ wallet });

const network = {
  type: process.env.VUE_APP_TEZOS_NETWORK,
  rpcUrl: process.env.VUE_APP_TEZOS_RPC_URL
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
  var activeAccount = await getActiveAccount();

  if (!activeAccount) {
    await wallet.requestPermissions({network});
    activeAccount = getActiveAccount();
  }

  return activeAccount;
}

const sendMessage = async(recipients, subject, body) => {
  getNetworkPermission();
  var to = recipients.split(',');

  console.log(to, subject, body);

  const userAddress = await wallet.getPKH();

  console.log(userAddress);

  //wallet.client.getActiveAccount().then((account) => { console.log(account) });

  Tezos.wallet
  .at(contractAddress)
  .then((sc) => sc.methods.entrypoint_0(to, subject, body).send({ amount: 30000, mutez: true }))
  .then((op) => {
    console.log(`Awaiting for ${op.hash} to be confirmed...`);
    return op.hash;
  })
  .then((hash) => {
    //contract.tokenBalance = contract.tokenBalance - orderAmount;
    
    console.log(`Operation injected: https://edo.tzstats.com/${hash}`)

    /*fs.appendFile(logFile, hash + ", " + date.toDateString() + ' ' + date.toLocaleTimeString() + ', ' +  contract.ticker + ", " + operation + ", " + contract.currentPrice + ', ' + output + ', ' + orderAmount + '\n', 
    function (err) {
      if (err) throw err;
    });*/
  })
  .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`));


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
  sendMessage
};
