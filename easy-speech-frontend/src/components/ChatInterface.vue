<template>
	<v-container fluid class="d-flex flex-column justify-center items-center chat-container"
		style="height: 100vh; padding: 0;">
		<v-row class="w-full" align="center" justify="end">
			<span class="selected-voice mt-1 mr-2">{{ selectedVoice }}</span>
			<v-btn icon @click="dialog = true">
				<v-icon>mdi-cog</v-icon>
			</v-btn>
		</v-row>
		<MessageList ref="messageList" :messages="messages" class="flex-grow-1 overflow-y-auto" @edit="handleEditMessage"
			@delete="handleDeleteMessage" />
		<MessageInput v-model="newMessage" @send="sendMessage" class="input-area" />
		<SettingsDialog :dialog="dialog" @update:dialog="dialog = $event" :voices="voices"
			:selectedVoice="selectedVoice" @update:selectedVoice="updateSelectedVoice($event)"
			:language="selectedLanguage" @update:language="updateSelectedLanguage($event)"
			:selectedSpeed="selectedSpeed" @update:selectedSpeed="updateSelectedSpeed($event)" />
	</v-container>
</template>

<script>
import MessageList from './MessageList.vue';
import MessageInput from './MessageInput.vue';
import SettingsDialog from './SettingsDialog.vue';
import LocalDatabaseService from '../services/LocalDatabaseService.js';
import SpeechSynthesisService from '../services/SpeechSynthesisService.js';
import GuidUtils from '../utils/GuidUtils.js';

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
			voices: [],
			selectedSpeed: 0 // Added for voice speed
		}
	},
	mounted() {
		this.loadVoices();
		this.loadMessages();
		this.loadSpeed(); // Load speed on mount
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
		},
		selectedSpeed(newVal) { // Watcher for selectedSpeed
			LocalDatabaseService.save('selectedSpeed', newVal);
		}
	},
	methods: {
		async loadVoices() {
			this.voices = await SpeechSynthesisService.getVoicesList();
			const savedVoice = LocalDatabaseService.load('selectedVoice');
			const savedLanguage = LocalDatabaseService.load('selectedLanguage');
			const savedSpeed = LocalDatabaseService.load('selectedSpeed');
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
			if (savedSpeed !== null && savedSpeed !== undefined) {
				this.selectedSpeed = savedSpeed;
			} else {
				this.selectedSpeed = 0; // Default speed
			}
			SpeechSynthesisService.setLanguage(this.selectedLanguage);
		},
		loadMessages() {
			const savedMessages = LocalDatabaseService.load('messages');
			if (savedMessages && Array.isArray(savedMessages)) {
				// Ensure each message has a unique id
				this.messages = savedMessages.map(msg => {
					if (!msg.id) {
						return { ...msg, id: GuidUtils.generateGuid() };
					}
					return msg;
				});
				LocalDatabaseService.save('messages', this.messages);
			}

			if (this.messages.length === 0) {
				this.messages = [
					{
						id: GuidUtils.generateGuid(), // Assigned unique id
						sender: 'bot',
						text: `**De Kleine Robot en de Verdwaalde Kat**

Er was eens een kleine robot genaamd Bolt, die leefde in een stad vol wolkenkrabbers en vliegende auto's. Hoewel Bolt heel slim en sterk was, voelde hij zich vaak eenzaam. Op een dag, terwijl hij door een verlaten park liep, hoorde hij een zacht gemiauw. Verrast keek hij om zich heen en zag een kleine, grijze kat die vastzat in een hoge boom.

"Hoe ben jij daar boven gekomen?" vroeg Bolt verbaasd, terwijl hij zijn hoofd kantelde.

De kat miauwde nog een keer, alsof hij hulp vroeg. Bolt activeerde zijn jetpacks en vloog soepel naar de tak waar de kat zat. Voorzichtig pakte hij de kat op en zette hem veilig op de grond. De kat keek Bolt met grote, dankbare ogen aan en begon te spinnen.

Van dat moment af waren Bolt en de kat onafscheidelijk. Samen zwierven ze door de stad, op zoek naar nieuwe avonturen. Bolt voelde zich nooit meer alleen, en de kat had een nieuwe vriend gevonden die altijd voor haar zorgde.

"Soms," dacht Bolt, terwijl hij naar de ondergaande zon keek, "is het vinden van een vriend alles wat je nodig hebt."`
					}
				];
				LocalDatabaseService.save('messages', this.messages);
			}
		},
		loadSpeed() {
			const savedSpeed = LocalDatabaseService.load('selectedSpeed');
			if (savedSpeed !== null && savedSpeed !== undefined) {
				this.selectedSpeed = savedSpeed;
			} else {
				this.selectedSpeed = 0; // Default speed
			}
		},
		sendMessage() {
			if (this.newMessage.trim() === '') return;
			const newMsg = {
				id: GuidUtils.generateGuid(),
				sender: 'user',
				text: this.newMessage
			};
			this.messages.push(newMsg);
			LocalDatabaseService.save('messages', this.messages);
			this.newMessage = '';
			this.$nextTick(() => {
				if (this.$refs.messageList) {
					this.$refs.messageList.scrollToBottom();
				}
			});
		},
		updateSelectedVoice(newVoice) {
			this.selectedVoice = newVoice;
		},
		updateSelectedLanguage(newLanguage) {
			this.selectedLanguage = newLanguage;
		},
		updateSelectedSpeed(newSpeed) { // Method to update selectedSpeed
			this.selectedSpeed = newSpeed;
		},
		handleEditMessage(updatedMessage) {
			const index = this.messages.findIndex(msg => msg.id === updatedMessage.id);
			if (index !== -1) {
				this.messages.splice(index, 1, updatedMessage);
				LocalDatabaseService.save('messages', this.messages);
			}
		},
		handleDeleteMessage(message) {
			const index = this.messages.findIndex(msg => msg.id === message.id);
			if (index !== -1) {
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