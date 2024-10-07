--- src/components/SettingsDialog.vue ---
```vue
<template>
	<v-dialog v-model="localDialog" max-width="400">
		<v-card>
			<v-card-title>Settings</v-card-title>
			<v-card-text>
				<v-select :items="voices" label="Select Voice" v-model="localSelectedVoice"></v-select>
				<v-select :items="languages" label="Select Language" v-model="localLanguage" class="mt-4"></v-select>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn text @click="closeDialog">Close</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
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
		}
	},
	data() {
		return {
			localDialog: this.dialog,
			localSelectedVoice: this.selectedVoice,
			localLanguage: this.language,
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
	watch: {
		dialog(newVal) {
			this.localDialog = newVal;
		},
		localDialog(newVal) {
			this.$emit('update:dialog', newVal);
			if (!newVal) {
				this.$emit('update:selectedVoice', this.localSelectedVoice);
				this.$emit('update:language', this.localLanguage);
			}
		},
		selectedVoice(newVal) {
			this.localSelectedVoice = newVal;
		},
		localSelectedVoice(newVal) {
			this.$emit('update:selectedVoice', newVal);
		},
		language(newVal) {
			this.localLanguage = newVal;
		},
		localLanguage(newVal) {
			this.$emit('update:language', newVal);
		}
	},
	methods: {
		closeDialog() {
			this.localDialog = false;
		}
	}
}
</script>

<style scoped>
.mt-4 {
	margin-top: 16px;
}
</style>
```