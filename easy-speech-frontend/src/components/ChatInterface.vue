<template>
  <v-container fluid class="d-flex flex-column justify-center items-center chat-container" style="height: 100vh; padding: 0;">
    <v-row class="w-full" align="center" justify="end">
      <span class="selected-voice mr-2">{{ selectedVoice }}</span>
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
import LocalDatabaseService from '../services/LocalDatabaseService.js';
import SpeechSynthesisService from '../services/SpeechSynthesisService.js';

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
      selectedVoice: '',
      voices: []
    }
  },
  mounted() {
    this.loadVoices();
  },
  beforeUnmount() {
    // No event listeners to remove since the service handles them
  },
  watch: {
    selectedVoice(newVal) {
      LocalDatabaseService.save('selectedVoice', newVal);
    }
  },
  methods: {
    async loadVoices() {
      this.voices = await SpeechSynthesisService.getVoicesList();
      const savedVoice = LocalDatabaseService.load('selectedVoice');
      if (savedVoice && this.voices.includes(savedVoice)) {
        this.selectedVoice = savedVoice;
      } else if (this.voices.length > 0) {
        this.selectedVoice = this.voices[0];
      } else {
        this.selectedVoice = 'Standaard - Build in';
      }
    },
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
  width: 100%;
}
.input-area {
  padding: 16px;
  width: 100%;
}
.selected-voice {
  font-weight: bold;
}
</style>