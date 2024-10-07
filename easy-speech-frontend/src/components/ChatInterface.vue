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
      @update:selectedVoice="updateSelectedVoice($event)"
      :language="selectedLanguage"
      @update:language="updateSelectedLanguage($event)"
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
      selectedLanguage: 'Nederlands',
      voices: []
    }
  },
  mounted() {
    this.loadVoices();

    this.messages.push({
      sender: 'initial',
      text: `De snelle bruine vos springt over de luie hond, die met halfgesloten ogen in de zon ligt te dommelen. Terwijl de vos sierlijk door de lucht zweeft, hoort hij in de verte het zachte geritsel van bladeren, een teken dat er meer leven in het bos is dan alleen hij en de hond. Met een soepele landing op de zachte bosgrond kijkt de vos nieuwsgierig om zich heen.

Niet ver van hen vandaan ritselt er iets in de struiken. De vos spitst zijn oren en zet zich stilletjes schrap. Het lijkt een gewone dag, maar de lucht is geladen met iets nieuws, iets onverklaarbaars. Wat zou er op komst zijn?

Plotseling opent de hond één oog en bromt zachtjes: "Er komt een storm aan." De vos knikt langzaam, wetend dat de hond altijd gelijk heeft als het op het weer aankomt. Wat ze niet weten, is dat deze storm meer met zich meebrengt dan alleen regen...`
    });
  },
  beforeUnmount() {
    // No event listeners to remove since the service handles them
  },
  watch: {
    selectedVoice(newVal) {
      LocalDatabaseService.save('selectedVoice', newVal);
    },
    selectedLanguage(newVal) {
      LocalDatabaseService.save('selectedLanguage', newVal);
      SpeechSynthesisService.setLanguage(newVal);
    }
  },
  methods: {
    async loadVoices() {
      this.voices = await SpeechSynthesisService.getVoicesList();
      const savedVoice = LocalDatabaseService.load('selectedVoice');
      const savedLanguage = LocalDatabaseService.load('selectedLanguage');
      if (savedLanguage) {
        this.selectedLanguage = savedLanguage;
      } else {
        this.selectedLanguage = 'Nederlands';
      }
      if (savedVoice && this.voices.includes(savedVoice)) {
        this.selectedVoice = savedVoice;
      } else if (this.voices.length > 0) {
        this.selectedVoice = this.voices[0];
      } else {
        this.selectedVoice = 'Standaard - Build in';
      }
      SpeechSynthesisService.setLanguage(this.selectedLanguage);
    },
    sendMessage() {
      if (this.newMessage.trim() === '') return;
      this.messages.push({ sender: 'user', text: this.newMessage });
      this.newMessage = '';
    },
    updateSelectedVoice(newVoice) {
      this.selectedVoice = newVoice;
    },
    updateSelectedLanguage(newLanguage) {
      this.selectedLanguage = newLanguage;
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