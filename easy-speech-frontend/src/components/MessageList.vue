<template>
	<div class="message-list" ref="messageList">
		<MessageItem v-for="(message, index) in messages" :key="message.id" :message="message" :index="index"
			@highlight="handleHighlight" @unhighlight="handleUnhighlight" @speech-started="handleSpeechStarted"
			@speech-stopped="handleSpeechStopped" @edit="handleEdit" @delete="handleDelete" />
	</div>
</template>

<script>
import MessageItem from './MessageItem.vue';

export default {
	name: 'MessageList',
	components: {
		MessageItem,
	},
	props: {
		messages: {
			type: Array,
			required: true,
		},
	},
	data() {
		return {
			currentlyHighlighted: {
				messageIndex: null,
				partIndex: null,
			},
			currentlyPlayingMessage: null,
		};
	},
	methods: {
		handleHighlight(payload) {
			if (
				payload &&
				typeof payload.messageIndex !== 'undefined' &&
				typeof payload.partIndex !== 'undefined'
			) {
				this.currentlyHighlighted.messageIndex = payload.messageIndex;
				this.currentlyHighlighted.partIndex = payload.partIndex;

				// Auto-scroll to the highlighted part only if it's out of view
				this.$nextTick(() => {
					const elementId = `message-${payload.messageIndex}-part-${payload.partIndex}`;
					const element = document.getElementById(elementId);
					const container = this.$refs.messageList;

					if (element && container) {
						const containerRect = container.getBoundingClientRect();
						const elementRect = element.getBoundingClientRect();

						// Check if the element is out of the container's visible bounds
						if (
							elementRect.top < containerRect.top ||
							elementRect.bottom > containerRect.bottom
						) {
							element.scrollIntoView({ behavior: 'smooth', block: 'start' });
						}
					}
				});
			} else {
				this.currentlyHighlighted.messageIndex = null;
				this.currentlyHighlighted.partIndex = null;
			}
		},
		handleUnhighlight() {
			this.currentlyHighlighted.messageIndex = null;
			this.currentlyHighlighted.partIndex = null;
		},
		handleSpeechStarted(messageIndex) {
			this.currentlyPlayingMessage = messageIndex;
		},
		handleSpeechStopped(messageIndex) {
			if (this.currentlyPlayingMessage === messageIndex) {
				this.currentlyPlayingMessage = null;
			}
		},
		handleEdit(updatedMessage) {
			this.$emit('edit', updatedMessage);
		},
		handleDelete(message) {
			this.$emit('delete', message);
		},
		scrollToBottom() {
			this.$nextTick(() => {
				const container = this.$refs.messageList;
				if (container) {
					container.scrollTop = container.scrollHeight;
				}
			});
		},
	},
};
</script>

<style scoped>
.message-list {
	height: 100%;
	display: flex;
	flex-direction: column;
	gap: 16px;
	overflow-y: auto;
	/* Ensure the container can scroll */
}
</style>