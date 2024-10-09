<template>
	<div ref="messagesContainer" class="messages d-flex flex-column align-start p-4">
		<MessageItem v-for="(message, index) in messages" :key="index" ref="messageItems" :message="message"
			:index="index" @edit="handleEdit(index, $event)" @delete="handleDelete(index, $event)"
			@highlight="handleHighlight" @speech-started="handleSpeechStarted" @speech-stopped="handleSpeechStopped" />
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
	data() {
		return {
			currentlyPlayingMessageIndex: null,
		};
	},
	methods: {
		handleEdit(index, updatedMessage) {
			this.$emit('edit-message', { index, message: updatedMessage });
		},
		handleDelete(index, messageToDelete) {
			this.$emit('delete-message', { index, message: messageToDelete });
		},
		handleHighlight({ messageIndex, partIndex }) {
			const elementId = `message-${messageIndex}-part-${partIndex}`;
			const element = document.getElementById(elementId);
			const container = this.$refs.messagesContainer;
			if (element && container) {
				const containerRect = container.getBoundingClientRect();
				const elementRect = element.getBoundingClientRect();

				const isVisible = (
					elementRect.top >= containerRect.top &&
					elementRect.bottom <= containerRect.bottom - 100
				);

				if (!isVisible) {
					element.scrollIntoView({
						behavior: 'smooth',
						block: 'start',
						inline: 'nearest'
					});
				}
			}
		},
		handleSpeechStarted(index) {
			if (this.currentlyPlayingMessageIndex !== null && this.currentlyPlayingMessageIndex !== index) {
				// Stop the currently playing message
				const currentMessageItem = this.$refs.messageItems[this.currentlyPlayingMessageIndex];
				if (currentMessageItem) {
					currentMessageItem.stopSpeech();
				}
			}
			this.currentlyPlayingMessageIndex = index;
		},
		handleSpeechStopped(index) {
			if (this.currentlyPlayingMessageIndex === index) {
				this.currentlyPlayingMessageIndex = null;
			}
		},
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