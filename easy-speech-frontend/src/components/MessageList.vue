<template>
	<div ref="messagesContainer" class="messages d-flex flex-column align-start p-4" style="height: 100%;">
		<MessageItem v-for="(message, index) in messages" :key="index" :message="message" :index="index"
			@edit="handleEdit(index, $event)" @delete="handleDelete(index, $event)" />
	</div>
</template>

<script>
import MessageItem from './MessageItem.vue';

export default {
	name: 'MessageList',
	components: {
		MessageItem
	},
	props: {
		messages: {
			type: Array,
			required: true
		}
	},
	methods: {
		handleEdit(index, updatedMessage) {
			this.$emit('edit-message', { index, message: updatedMessage });
		},
		handleDelete(index, messageToDelete) {
			this.$emit('delete-message', { index, message: messageToDelete });
		}
	},
	watch: {
		messages: {
			handler() {
				this.$nextTick(() => {
					this.$refs.messagesContainer.scrollTo({
						top: this.$refs.messagesContainer.scrollHeight,
						behavior: 'smooth'
					});
				});
			},
			deep: true
		}
	}
}
</script>

<style scoped>
.messages {
	width: 100%;
	margin: 0 auto;
}
</style>