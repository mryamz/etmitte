<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container">
        <a class="navbar-brand" href="../">TeddyCoin</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <router-link to="/about" class="nav-link" aria-current="page" href="#">
                About
              </router-link>
            </li>
          </ul>
          <span v-if="loggedIn">
            <div class="btn-group">
              <button class="btn btn-outline-dark dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false">{{ truncateAddress(wallet.address) }}</button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item" href="#" v-on:click="logout">Disconnect</a>
                </li>
              </ul>
            </div>
          </span>
          <span v-else>
            <button class="btn btn-outline-dark" v-on:click="login">Connect Wallet</button>
          </span>
        </div>
      </div>
    </nav>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { isLoggedIn } from 'axios-jwt';

import * as Auth from '../util/auth';
import * as Tezos from '../util/tezos';

export default Vue.extend({
  name: 'Header',
  data: () => ({
    loggedIn: isLoggedIn(),
    wallet: { address: '' },
    walletAssets: []
  }),
  mounted: async function () {
    this.wallet = await Tezos.getActiveAccount();
  },
  methods: {
    login: async function() {
      this.loggedIn = await Auth.login();
      this.wallet = await Tezos.getActiveAccount();
    },
    logout: async function() {
      await Auth.logout();
      location.reload();
    },
    truncateAddress: function(address) {
      if (address === undefined) { return ''; }
      return address.substr(0, 5) + '...' + address.substr(address.length - 5, 5);
    }
  }
});
</script>