<template>
	<v-app>
		<v-app-bar app dense>
			<v-btn icon size="small" @click="toggleDrawer" class="d-lg-none">
				<v-icon size="small">mdi-menu</v-icon>
			</v-btn>
			<v-btn icon size="small" @click="addConversation" class="d-lg-none">
				<v-icon size="small">mdi-plus</v-icon>
			</v-btn>
			<v-toolbar-title class="ml-2">{{ currentConversation?.name }}</v-toolbar-title>
			<v-spacer></v-spacer>
			<span class="selected-voice mt-1 mr-2">{{ selectedVoice }}</span>
			<v-btn icon tile size="small" style="background-color: transparent;" class="elevation-0"
				@click="dialog = true">
				<v-icon>mdi-cog</v-icon>
			</v-btn>
		</v-app-bar>

		<ConversationList :conversations="conversations" :currentConversation="currentConversation"
			@add-conversation="addConversation" @select-conversation="selectConversation"
			@delete-conversation="deleteConversation" @rename-conversation="renameConversation" v-model:drawer="drawer"
			:isMobile="isMobile" />

		<v-main class="d-flex flex-column" style="min-height: 0;">
			<v-container fluid class="d-flex flex-column flex-grow-1" style="padding: 0; min-height: 0;">
				<MessageList ref="messageList" :messages="currentConversation?.messages || []"
					class="message-list" @edit="handleEditMessage" @delete="handleDeleteMessage" />
				<MessageInput v-model="newMessage" @send="sendMessage" />
				<SettingsDialog :dialog="dialog" @update:dialog="dialog = $event" :voices="voices"
					:selectedVoice="selectedVoice" @update:selectedVoice="updateSelectedVoice($event)"
					:language="selectedLanguage" @update:language="updateSelectedLanguage($event)"
					:selectedSpeed="selectedSpeed" @update:selectedSpeed="updateSelectedSpeed($event)"
					:darkTheme="darkTheme" @update:darkTheme="updateDarkTheme($event)" />
			</v-container>
		</v-main>
	</v-app>
</template>

<script>
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import MessageList from './MessageList.vue';
import MessageInput from './MessageInput.vue';
import SettingsDialog from './SettingsDialog.vue';
import ConversationList from './ConversationList.vue';
import LocalDatabaseService from '../services/LocalDatabaseService.js';
import SpeechSynthesisService from '../services/SpeechSynthesisService.js';
import GuidUtils from '../utils/GuidUtils.js';
import { useTheme } from 'vuetify';
import { useI18n } from 'vue-i18n';
import { messages as localeMessages } from '../locales.js';
import { useDisplay } from 'vuetify';
import { stripFormatting } from '../utils/TextUtils.js';

export default {
	name: 'ChatInterface',
	components: {
		MessageList,
		MessageInput,
		SettingsDialog,
		ConversationList
	},
	setup() {
		const conversations = ref([]);
		const currentConversation = ref(null);
		const newMessage = ref('');
		const dialog = ref(false);
		const selectedVoice = ref('');
		const selectedLanguage = ref('English');
		const voices = ref([]);
		const selectedSpeed = ref(0);
		const darkTheme = ref(false);
		const theme = useTheme();
		const { t, locale } = useI18n();
		const messageList = ref(null);
		const { mobile } = useDisplay();
		const isMobile = computed(() => mobile.value);
		const drawer = ref(!isMobile.value);
		const selectedConversationId = ref(null);

		const languageMapping = {
			'Nederlands': 'nl',
			'English': 'en',
			'Spanish': 'es',
			'French': 'fr',
			'German': 'de',
			'Chinese': 'zh',
			'Japanese': 'ja',
			'Russian': 'ru',
			'Italian': 'it',
			'Portuguese': 'pt'
		};

		const reverseLanguageMapping = Object.keys(languageMapping).reduce((acc, key) => {
			acc[languageMapping[key]] = key;
			return acc;
		}, {});

		const loadVoices = async () => {
			voices.value = await SpeechSynthesisService.getVoicesList();
			const savedVoice = LocalDatabaseService.load('selectedVoice');
			const savedLanguageCode = LocalDatabaseService.load('language');
			let savedLanguageName = reverseLanguageMapping[savedLanguageCode] || 'English';
			const systemLocale = navigator.language.split('-')[0];
			if (savedLanguageCode && Object.prototype.hasOwnProperty.call(localeMessages, savedLanguageCode)) {
				savedLanguageName = reverseLanguageMapping[savedLanguageCode];
			} else {
				savedLanguageName = reverseLanguageMapping[Object.prototype.hasOwnProperty.call(localeMessages, systemLocale) ? systemLocale : 'en'];
			}
			selectedLanguage.value = savedLanguageName;
			locale.value = mapLanguageToLocale(savedLanguageName);
			if (savedVoice && voices.value.includes(savedVoice)) {
				selectedVoice.value = savedVoice;
			} else if (voices.value.length > 0) {
				selectedVoice.value = voices.value[0];
			} else {
				selectedVoice.value = 'Standaard - Build in';
			}
			const savedSpeed = LocalDatabaseService.load('selectedSpeed');
			if (savedSpeed !== null && savedSpeed !== undefined) {
				selectedSpeed.value = savedSpeed;
			} else {
				selectedSpeed.value = 0;
			}
			SpeechSynthesisService.setLanguage(selectedLanguage.value);
		};

		const loadConversations = () => {
			const savedConversations = LocalDatabaseService.loadCompressed('conversations');
			if (savedConversations && Array.isArray(savedConversations)) {
				conversations.value = savedConversations.map(conv => {
					if (!conv.id) {
						return { ...conv, id: GuidUtils.generateGuid() };
					}
					return conv;
				});
				LocalDatabaseService.saveCompressed('conversations', conversations.value);
			}

			if (conversations.value.length === 0) {
				conversations.value = [
					{
						id: GuidUtils.generateGuid(),
						name: t('conversationName', { number: 1 }),
						messages: [
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
						]
					}
				];
				LocalDatabaseService.saveCompressed('conversations', conversations.value);
			}
			const savedConvId = LocalDatabaseService.load('selectedConversationId');
			if (savedConvId) {
				const foundConv = conversations.value.find(conv => conv.id === savedConvId);
				currentConversation.value = foundConv || conversations.value[0];
			} else {
				currentConversation.value = conversations.value[0];
			}
			if (currentConversation.value) {
				selectedConversationId.value = currentConversation.value.id;
				LocalDatabaseService.save('selectedConversationId', selectedConversationId.value);
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
			updateVuetifyTheme(darkTheme.value);
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
			currentConversation.value.messages.push(newMsg);

			if (/^Conversation \d+$/.test(currentConversation.value.name)) {
				const firstWords = stripFormatting(newMsg.text).split(' ').slice(0, 3).join(' ');
				currentConversation.value.name = firstWords || currentConversation.value.name;
			}

			LocalDatabaseService.saveCompressed('conversations', conversations.value);
			newMessage.value = '';
			nextTick(() => {
				if (messageList.value && typeof messageList.value.scrollToBottom === 'function') {
					messageList.value.scrollToBottom();
				}
			});
		};

		const addConversation = () => {
			const newConv = {
				id: GuidUtils.generateGuid(),
				name: t('conversationName', { number: conversations.value.length + 1 }),
				messages: []
			};
			conversations.value.push(newConv);
			LocalDatabaseService.saveCompressed('conversations', conversations.value);
			currentConversation.value = newConv;
			selectedConversationId.value = newConv.id;
			LocalDatabaseService.save('selectedConversationId', selectedConversationId.value);
			if (isMobile.value) {
				drawer.value = false;
			}
		};

		const selectConversation = (conv) => {
			currentConversation.value = conv;
			selectedConversationId.value = conv.id;
			LocalDatabaseService.save('selectedConversationId', selectedConversationId.value);
			if (isMobile.value) {
				drawer.value = false;
			}
		};

		const deleteConversation = (convId) => {
			const index = conversations.value.findIndex(conv => conv.id === convId);
			if (index !== -1) {
				conversations.value.splice(index, 1);
				LocalDatabaseService.saveCompressed('conversations', conversations.value);
				if (currentConversation.value.id === convId) {
					currentConversation.value = conversations.value[0] || null;
					selectedConversationId.value = currentConversation.value ? currentConversation.value.id : null;
					LocalDatabaseService.save('selectedConversationId', selectedConversationId.value);
				}
			}
		};

		const renameConversation = (convId, newName) => {
			const conv = conversations.value.find(c => c.id === convId);
			if (conv) {
				conv.name = newName;
				LocalDatabaseService.saveCompressed('conversations', conversations.value);
				if (currentConversation.value.id === convId) {
					currentConversation.value = conv;
				}
			}
		};

		const updateSelectedVoice = (newVoice) => {
			selectedVoice.value = newVoice;
			LocalDatabaseService.save('selectedVoice', newVoice);
		};

		const updateSelectedLanguage = (newLanguage) => {
			selectedLanguage.value = newLanguage;
			locale.value = mapLanguageToLocale(newLanguage);
			SpeechSynthesisService.setLanguage(newLanguage);
			LocalDatabaseService.save('language', languageMapping[newLanguage]);
		};

		const updateSelectedSpeed = (newSpeed) => {
			selectedSpeed.value = newSpeed;
			LocalDatabaseService.save('selectedSpeed', newSpeed);
		};

		const updateDarkTheme = (newTheme) => {
			darkTheme.value = newTheme;
			updateVuetifyTheme(newTheme);
			LocalDatabaseService.save('darkTheme', newTheme);
		};

		const handleEditMessage = (updatedMessage) => {
			const index = currentConversation.value.messages.findIndex(msg => msg.id === updatedMessage.id);
			if (index !== -1) {
				currentConversation.value.messages.splice(index, 1, updatedMessage);
				LocalDatabaseService.saveCompressed('conversations', conversations.value);
			}
		};

		const handleDeleteMessage = (message) => {
			const index = currentConversation.value.messages.findIndex(msg => msg.id === message.id);
			if (index !== -1) {
				currentConversation.value.messages.splice(index, 1);
				LocalDatabaseService.saveCompressed('conversations', conversations.value);
			}
		};

		const mapLanguageToLocale = (language) => {
			const mapping = {
				'Nederlands': 'nl',
				'English': 'en',
				'Spanish': 'es',
				'French': 'fr',
				'German': 'de',
				'Chinese': 'zh',
				'Japanese': 'ja',
				'Russian': 'ru',
				'Italian': 'it',
				'Portuguese': 'pt'
			};
			return mapping[language] || 'en';
		};

		onMounted(() => {
			loadVoices();
			loadConversations();
			loadSpeed();
			loadTheme();
		});

		watch(selectedLanguage, (newLang) => {
			LocalDatabaseService.save('language', languageMapping[newLang]);
		});

		watch(isMobile, (val) => {
			if (!val) {
				drawer.value = true;
			} else {
				drawer.value = false;
			}
		});

		const toggleDrawer = () => {
			drawer.value = !drawer.value;
		};

		return {
			conversations,
			currentConversation,
			newMessage,
			dialog,
			selectedVoice,
			selectedLanguage,
			voices,
			selectedSpeed,
			darkTheme,
			sendMessage,
			addConversation,
			selectConversation,
			deleteConversation,
			renameConversation,
			updateSelectedVoice,
			updateSelectedLanguage,
			updateSelectedSpeed,
			updateDarkTheme,
			handleEditMessage,
			handleDeleteMessage,
			messageList,
			drawer,
			isMobile,
			toggleDrawer
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

.conversation-drawer {
	width: 250px;
}

.message-list {
	flex: 1;
	overflow-y: auto;
	min-height: 0;
}
</style>