<template>
	<v-dialog v-model="dialog" max-width="600px">
		<v-card>
			<v-card-title>
				<span class="headline">{{ t('editMessage') }}</span>
			</v-card-title>
			<v-card-text>
				<v-textarea v-model="localText" :rules="[v => !!v || t('typeMessage')]" :label="t('editMessage')" auto-grow></v-textarea>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn color="blue darken-1" text @click="cancel">{{ t('cancel') }}</v-btn>
				<v-btn color="blue darken-1" text @click="save" :disabled="!localText">{{ t('save') }}</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
import { useI18n } from 'vue-i18n';

export default {
	name: 'EditMessageDialog',
	props: {
		modelValue: {
			type: Boolean,
			required: true,
		},
		initialText: {
			type: String,
			required: true,
		},
	},
	data() {
		return {
			localText: this.initialText,
		};
	},
	computed: {
		dialog: {
			get() {
				return this.modelValue;
			},
			set(value) {
				this.$emit('update:modelValue', value);
			},
		},
	},
	watch: {
		initialText(newVal) {
			this.localText = newVal;
		},
		modelValue(val) {
			if (!val) {
				this.localText = this.initialText;
			}
		},
	},
	setup() {
		const { t } = useI18n();
		return { t };
	},
	methods: {
		save() {
			this.$emit('edit', this.localText);
			this.dialog = false;
		},
		cancel() {
			this.dialog = false;
		},
	},
};
</script>