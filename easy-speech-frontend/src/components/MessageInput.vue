<template>
	<v-form @submit.prevent="handleSubmit" class="d-flex w-full input-container">
		<v-textarea v-model="message" rows="1" auto-grow max-rows="10" :placeholder="$t('typeMessage')"
			class="flex-grow-1"></v-textarea>
		<v-btn icon class="ml-2" @click="handleSubmit">
			<v-icon>mdi-send</v-icon>
		</v-btn>
	</v-form>
</template>

<script>
import { useI18n } from 'vue-i18n';

export default {
	name: 'MessageInput',
	props: {
		modelValue: {
			type: String,
			default: ''
		}
	},
	data() {
		return {
			message: this.modelValue
		}
	},
	setup() {
		const { t } = useI18n();
		return { t };
	},
	watch: {
		modelValue(val) {
			this.message = val;
		},
		message(val) {
			this.$emit('update:modelValue', val);
		}
	},
	methods: {
		handleSubmit() {
			this.$emit('send');
		}
	}
}
</script>

<style scoped>
.input-container {
	width: 100%;
	max-width: 1024px;
	margin: 0 auto;
	padding: 16px;
	box-sizing: border-box;
}
</style>