<template>
	<v-container fluid class="d-flex flex-column justify-center items-center chat-container"
		style="height: 100vh; padding: 0;">
		<v-row class="w-full" align="center" justify="end">
			<span class="selected-voice mt-1 mr-2">{{ selectedVoice }}</span>
			<v-btn icon @click="dialog = true">
				<v-icon>mdi-cog</v-icon>
			</v-btn>
		</v-row>
		<MessageList :messages="messages" class="flex-grow-1 overflow-y-auto" @edit-message="handleEditMessage"
			@delete-message="handleDeleteMessage" />
		<MessageInput v-model="newMessage" @send="sendMessage" class="input-area" />
		<SettingsDialog :dialog="dialog" @update:dialog="dialog = $event" :voices="voices"
			:selectedVoice="selectedVoice" @update:selectedVoice="updateSelectedVoice($event)"
			:language="selectedLanguage" @update:language="updateSelectedLanguage($event)" />
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
		this.loadMessages();
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
		loadMessages() {
			const savedMessages = LocalDatabaseService.load('messages');
			if (savedMessages && Array.isArray(savedMessages)) {
				this.messages = savedMessages;
			}
		},
		sendMessage() {
			if (this.newMessage.trim() === '') return;
			const newMsg = { sender: 'user', text: this.newMessage };
			this.messages.push(newMsg);
			LocalDatabaseService.save('messages', this.messages);
			this.newMessage = '';
		},
		updateSelectedVoice(newVoice) {
			this.selectedVoice = newVoice;
		},
		updateSelectedLanguage(newLanguage) {
			this.selectedLanguage = newLanguage;
		},
		handleEditMessage({ index, message }) {
			if (index >= 0 && index < this.messages.length) {
				this.messages.splice(index, 1, message);
				LocalDatabaseService.save('messages', this.messages);
			}
		},
		handleDeleteMessage({ index }) {
			if (index >= 0 && index < this.messages.length) {
				this.messages.splice(index, 1);
				LocalDatabaseService.save('messages', this.messages);
			}
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