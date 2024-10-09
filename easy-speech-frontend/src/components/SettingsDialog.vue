<template>
	<v-dialog v-model="localDialog" max-width="400">
		<v-card>
			<v-card-title>Settings</v-card-title>
			<v-card-text>
				<v-select :items="voices" label="Select Voice" v-model="localSelectedVoice"></v-select>
				<v-select :items="languages" label="Select Language" v-model="localLanguage" class="mt-4"></v-select>
				<v-slider
					v-model="localSpeed"
					label="Voice Speed"
					:min="-100"
					:max="100"
					step="10"
					ticks
					tick-size="4"
					thumb-label="always"
					class="mt-4"
				>
					<template v-slot:append>
						<span>{{ localSpeed }}%</span>
					</template>
				</v-slider>
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
		},
		selectedSpeed: { // New prop for speed
			type: Number,
			required: true,
			default: 0
		}
	},
	data() {
		return {
			localDialog: this.dialog,
			localSelectedVoice: this.selectedVoice,
			localLanguage: this.language,
			localSpeed: this.selectedSpeed, // Local data for speed
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
				this.$emit('update:selectedSpeed', this.localSpeed); // Emit speed on dialog close
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
		},
		selectedSpeed(newVal) { // Watcher for external speed changes
			this.localSpeed = newVal;
		},
		localSpeed(newVal) { // Emit speed changes
			this.$emit('update:selectedSpeed', newVal);
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