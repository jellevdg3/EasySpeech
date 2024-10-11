<template>
	<v-dialog v-model="localDialog" max-width="400">
		<v-card>
			<v-card-title>{{ $t('settings') }}</v-card-title>
			<v-card-text>
				<v-select :items="voices" :label="$t('selectVoice')" v-model="localSelectedVoice"></v-select>
				<v-select :items="languages" :label="$t('selectLanguage')" v-model="localLanguage"
					class="mt-4"></v-select>
				<v-slider v-model="localSpeed" :label="$t('voiceSpeed')" :min="-100" :max="100" step="10"
					:ticks="{ size: 4 }" :thumb-label="true" class="mt-5">
					<template v-slot:append>
						<span>{{ localSpeed }}%</span>
					</template>
				</v-slider>
				<v-row align="center" class="mt-1 ml-2">
					<span class="mr-2 label-color">{{ $t('theme') }}</span>
					<v-icon left class="ml-6 mr-2">mdi-weather-sunny</v-icon>
					<v-switch v-model="localDarkTheme" />
					<v-icon right class="ml-2">mdi-weather-night</v-icon>
				</v-row>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn text @click="closeDialog">{{ $t('close') }}</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
import { useTheme } from 'vuetify';
import { useI18n } from 'vue-i18n';
import LocalDatabaseService from '../services/LocalDatabaseService.js';

export default {
	name: 'SettingsDialog',
	props: {
		dialog: {
			type: Boolean,
			required: true
		},
		voices: {
			type: Array,
			required: true
		},
		selectedVoice: {
			type: String,
			required: false,
			default: null
		},
		language: {
			type: String,
			required: true,
			default: 'Nederlands'
		},
		selectedSpeed: {
			type: Number,
			required: true,
			default: 0
		},
		darkTheme: {
			type: Boolean,
			required: true,
			default: false
		}
	},
	data() {
		return {
			localDialog: this.dialog,
			localSelectedVoice: this.selectedVoice,
			localLanguage: this.language,
			localSpeed: this.selectedSpeed,
			localDarkTheme: this.darkTheme,
			languages: [
				'Nederlands',
				'English',
				'Spanish',
				'French',
				'German',
				'Chinese',
				'Japanese',
				'Russian',
				'Italian',
				'Portuguese'
			]
		}
	},
	setup() {
		const theme = useTheme();
		useI18n();
		return { theme };
	},
	watch: {
		dialog(newVal) {
			this.localDialog = newVal;
		},
		localDialog(newVal) {
			this.$emit('update:dialog', newVal);
			if (!newVal) {
				this.$emit('update:selectedVoice', this.localSelectedVoice);
				this.$emit('update:language', this.localLanguage);
				this.$emit('update:selectedSpeed', this.localSpeed);
				this.$i18n.locale = this.mapLanguageToLocale(this.localLanguage);
				LocalDatabaseService.save('language', this.localLanguage);
			}
		},
		localDarkTheme(newVal) {
			this.$emit('update:darkTheme', newVal);
			this.theme.global.name.value = newVal ? 'customDark' : 'customLight';
		},
		selectedVoice(newVal) {
			this.localSelectedVoice = newVal;
		},
		language(newVal) {
			this.localLanguage = newVal;
		},
		selectedSpeed(newVal) {
			this.localSpeed = newVal;
		},
		darkTheme(newVal) {
			this.localDarkTheme = newVal;
		}
	},
	methods: {
		closeDialog() {
			this.localDialog = false;
		},
		mapLanguageToLocale(language) {
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
		}
	}
}
</script>

<style scoped>
.mt-4 {
	margin-top: 16px;
}

.mr-2 {
	margin-right: 8px;
}

.label-color {
	color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
	opacity: var(--v-medium-emphasis-opacity);
}
</style>