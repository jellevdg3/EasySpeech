<template>
	<div class="message-list">
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
			if (payload && typeof payload.messageIndex !== 'undefined' && typeof payload.partIndex !== 'undefined') {
				this.currentlyHighlighted.messageIndex = payload.messageIndex;
				this.currentlyHighlighted.partIndex = payload.partIndex;
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
	},
};
</script>

<style scoped>
.message-list {
	display: flex;
	flex-direction: column;
	gap: 16px;
}
</style>