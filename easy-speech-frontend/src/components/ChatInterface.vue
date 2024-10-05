<template>
  <v-container fluid class="d-flex flex-column justify-center items-center chat-container" style="height: 100vh; padding: 0;">
    <v-row class="w-full" align="center" justify="end">
      <v-btn icon @click="dialog = true">
        <v-icon>mdi-cog</v-icon>
      </v-btn>
    </v-row>
    <MessageList :messages="messages" class="flex-grow-1 overflow-y-auto" />
    <MessageInput v-model="newMessage" @send="sendMessage" class="input-area" />
    <SettingsDialog
      :dialog="dialog"
      @update:dialog="dialog = $event"
      :voices="voices"
      :selectedVoice="selectedVoice"
      @update:selectedVoice="selectedVoice = $event"
    />
  </v-container>
</template>

<script>
import MessageList from './MessageList.vue';
import MessageInput from './MessageInput.vue';
import SettingsDialog from './SettingsDialog.vue';

export default {
  name: 'ChatInterface',
  components: {
    MessageList,
    MessageInput,
    SettingsDialog
  },
  data() {
    return {
      messages: [],
      newMessage: '',
      dialog: false,
      selectedVoice: null,
      voices: [
        'Voice 1',
        'Voice 2',
        'Voice 3',
        'Voice 4',
        'Voice 5',
        'Voice 6',
        'Voice 7',
        'Voice 8',
        'Voice 9',
        'Voice 10'
      ]
    }
  },
  methods: {
    sendMessage() {
      if (this.newMessage.trim() === '') return;
      this.messages.push({ sender: 'user', text: this.newMessage });
      this.newMessage = '';
    }
  }
}
</script>

<style scoped>
.chat-container {
  max-width: 1024px;
  width: 100%;
  margin: 0 auto;
}
.input-area {
  padding: 16px;
  width: 100%;
}
</style>