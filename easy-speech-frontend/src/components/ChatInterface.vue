<template>
	<v-container fluid class="d-flex flex-column justify-center items-center chat-container"
		style="height: 100vh; padding: 0;">
		<v-row class="w-full" align="center" justify="end">
			<span class="selected-voice mt-1 mr-2">{{ selectedVoice }}</span>
			<v-btn icon tile size="small" style="background-color: transparent;" class="elevation-0"
				@click="dialog = true">
				<v-icon>mdi-cog</v-icon>
			</v-btn>
		</v-row>
		<MessageList ref="messageList" :messages="messages" class="flex-grow-1 overflow-y-auto"
			@edit="handleEditMessage" @delete="handleDeleteMessage" />
		<MessageInput v-model="newMessage" @send="sendMessage" class="input-area" />
		<SettingsDialog :dialog="dialog" @update:dialog="dialog = $event" :voices="voices"
			:selectedVoice="selectedVoice" @update:selectedVoice="updateSelectedVoice($event)"
			:language="selectedLanguage" @update:language="updateSelectedLanguage($event)"
			:selectedSpeed="selectedSpeed" @update:selectedSpeed="updateSelectedSpeed($event)" :darkTheme="darkTheme"
			@update:darkTheme="updateDarkTheme($event)" />
	</v-container>
</template>

<script>
import { ref, onMounted } from 'vue';
import MessageList from './MessageList.vue';
import MessageInput from './MessageInput.vue';
import SettingsDialog from './SettingsDialog.vue';
import LocalDatabaseService from '../services/LocalDatabaseService.js';
import SpeechSynthesisService from '../services/SpeechSynthesisService.js';
import GuidUtils from '../utils/GuidUtils.js';
import { useTheme } from 'vuetify';

export default {
	name: 'ChatInterface',
	components: {
		MessageList,
		MessageInput,
		SettingsDialog
	},
	setup() {
		const messages = ref([]);
		const newMessage = ref('');
		const dialog = ref(false);
		const selectedVoice = ref('');
		const selectedLanguage = ref('Nederlands');
		const voices = ref([]);
		const selectedSpeed = ref(0);
		const darkTheme = ref(false);
		const theme = useTheme();

		const loadVoices = async () => {
			voices.value = await SpeechSynthesisService.getVoicesList();
			const savedVoice = LocalDatabaseService.load('selectedVoice');
			const savedLanguage = LocalDatabaseService.load('selectedLanguage');
			const savedSpeed = LocalDatabaseService.load('selectedSpeed');
			if (savedLanguage) {
				selectedLanguage.value = savedLanguage;
			} else {
				selectedLanguage.value = 'Nederlands';
			}
			if (savedVoice && voices.value.includes(savedVoice)) {
				selectedVoice.value = savedVoice;
			} else if (voices.value.length > 0) {
				selectedVoice.value = voices.value[0];
			} else {
				selectedVoice.value = 'Standaard - Build in';
			}
			if (savedSpeed !== null && savedSpeed !== undefined) {
				selectedSpeed.value = savedSpeed;
			} else {
				selectedSpeed.value = 0;
			}
			SpeechSynthesisService.setLanguage(selectedLanguage.value);
		};

		const loadMessages = () => {
			const savedMessages = LocalDatabaseService.load('messages');
			if (savedMessages && Array.isArray(savedMessages)) {
				messages.value = savedMessages.map(msg => {
					if (!msg.id) {
						return { ...msg, id: GuidUtils.generateGuid() };
					}
					return msg;
				});
				LocalDatabaseService.save('messages', messages.value);
			}

			if (messages.value.length === 0) {
				messages.value = [
					{
						id: GuidUtils.generateGuid(),
						sender: 'bot',
						text: `**De Kleine Robot en de Verdwaalde Kat**

Er was eens een kleine robot genaamd Bolt, die leefde in een stad vol wolkenkrabbers en vliegende auto's. Hoewel Bolt heel slim en sterk was, voelde hij zich vaak eenzaam. Op een dag, terwijl hij door een verlaten park liep, hoorde hij een zacht gemiauw. Verrast keek hij om zich heen en zag een kleine, grijze kat die vastzat in een hoge boom.

"Hoe ben jij daar boven gekomen?" vroeg Bolt verbaasd, terwijl hij zijn hoofd kantelde.

De kat miauwde nog een keer, alsof hij hulp vroeg. Bolt activeerde zijn jetpacks en vloog soepel naar de tak waar de kat zat. Voorzichtig pakte hij de kat op en zette hem veilig op de grond. De kat keek Bolt met grote, dankbare ogen aan en begon te spinnen.

Van dat moment af waren Bolt en de kat onafscheidelijk. Samen zwierven ze door de stad, op zoek naar nieuwe avonturen. Bolt voelde zich nooit meer alleen, en de kat had een nieuwe vriend gevonden die altijd voor haar zorgde.

"Soms," dacht Bolt, terwijl hij naar de ondergaande zon keek, "is het vinden van een vriend alles wat je nodig hebt."`
					}
				];
				LocalDatabaseService.save('messages', messages.value);
			}
		};

		const loadSpeed = () => {
			const savedSpeed = LocalDatabaseService.load('selectedSpeed');
			if (savedSpeed !== null && savedSpeed !== undefined) {
				selectedSpeed.value = savedSpeed;
			} else {
				selectedSpeed.value = 0;
			}
		};

		const loadTheme = () => {
			const savedTheme = LocalDatabaseService.load('darkTheme');
			if (savedTheme !== null && savedTheme !== undefined) {
				darkTheme.value = savedTheme;
			} else {
				darkTheme.value = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
				LocalDatabaseService.save('darkTheme', darkTheme.value);
			}
			theme.global.name.value = darkTheme.value ? 'customDark' : 'customLight';
		};

		const updateVuetifyTheme = (isDark) => {
			theme.global.name.value = isDark ? 'customDark' : 'customLight';
		};

		const sendMessage = () => {
			if (newMessage.value.trim() === '') return;
			const newMsg = {
				id: GuidUtils.generateGuid(),
				sender: 'user',
				text: newMessage.value
			};
			messages.value.push(newMsg);
			LocalDatabaseService.save('messages', messages.value);
			newMessage.value = '';
			// Assuming messageList has a method scrollToBottom
			// You might need to use refs differently in setup
		};

		const updateSelectedVoice = (newVoice) => {
			selectedVoice.value = newVoice;
		};

		const updateSelectedLanguage = (newLanguage) => {
			selectedLanguage.value = newLanguage;
		};

		const updateSelectedSpeed = (newSpeed) => {
			selectedSpeed.value = newSpeed;
		};

		const updateDarkTheme = (newTheme) => {
			darkTheme.value = newTheme;
			updateVuetifyTheme(newTheme);
			LocalDatabaseService.save('darkTheme', newTheme);
		};

		const handleEditMessage = (updatedMessage) => {
			const index = messages.value.findIndex(msg => msg.id === updatedMessage.id);
			if (index !== -1) {
				messages.value.splice(index, 1, updatedMessage);
				LocalDatabaseService.save('messages', messages.value);
			}
		};

		const handleDeleteMessage = (message) => {
			const index = messages.value.findIndex(msg => msg.id === message.id);
			if (index !== -1) {
				messages.value.splice(index, 1);
				LocalDatabaseService.save('messages', messages.value);
			}
		};

		onMounted(() => {
			loadVoices();
			loadMessages();
			loadSpeed();
			loadTheme();
		});

		return {
			messages,
			newMessage,
			dialog,
			selectedVoice,
			selectedLanguage,
			voices,
			selectedSpeed,
			darkTheme,
			sendMessage,
			updateSelectedVoice,
			updateSelectedLanguage,
			updateSelectedSpeed,
			updateDarkTheme,
			handleEditMessage,
			handleDeleteMessage
		};
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