import {
  isLoggedIn,
  setAuthTokens,
  clearAuthTokens
} from "axios-jwt";
import * as Tezos from './tezos';

const login = async () => {
  if (isLoggedIn()) {
    return isLoggedIn();
  }

  const activeAccount = await Tezos.getNetworkPermission();
  console.log("Tezos.getActiveAccount", activeAccount);

  // const { msg, signedMsg } = await Tezos.signLoginRequest();
  // console.log('Tezos.signLoginRequest', { msg, signedMsg });

  setAuthTokens({
    accessToken: 'coming_soon',
    refreshToken: 'coming_soon'
  });
  return isLoggedIn();
};

const logout = () => {
  clearAuthTokens();
  Tezos.disconnect();
}

export {
  isLoggedIn,
  login,
  logout
};
