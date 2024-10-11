<template>
	<v-form @submit.prevent="handleSubmit" class="d-flex w-full input-container">
		<v-textarea v-model="message" rows="1" auto-grow max-rows="10" placeholder="Typ je bericht..."
			class="flex-grow-1"></v-textarea>
		<v-btn icon @click="handleSubmit">
			<v-icon>mdi-send</v-icon>
		</v-btn>
	</v-form>
</template>

<script>
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
}

.v-textarea textarea {
	max-height: calc(1.5em * 10);
	overflow-y: auto;
}
</style>