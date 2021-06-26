<template>
  <div class="messenger">
    <div class="container mt-4 mb-4">
      <div>
        <div class='row'>
          <div class="col-9 align-middle">
            <div class="pt-2 align-middle">
                <input type="text" id="recipients" v-model="recipients" placeholder="Enter addresses (comma seperated)" />
                <input type="text" id="title" v-model="title" placeholder="Enter Message Title"/>
                <input type="text" id="body" v-model="body" placeholder="Enter Message Body" />
                <button v-on:click="send">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script lang="ts">
import Vue from 'vue';

import * as Tezos from '../util/tezos';

export default Vue.extend({
  name: 'Messenger',
  data: () => ({
      recipients: undefined,
      title: undefined,
      body: undefined
  }),
  mounted: async function () {

  },
  methods: {
    send() {
      Tezos.sendMessage(this.recipients, this.title, this.body);
    }
  }
});
</script>