<template>
	<div class="message-container">
		<MessageItemSpeech ref="speech" :message="message" :index="index" @toggle-speech="handleToggleSpeech"
			@highlight="handleHighlight" @unhighlight="handleUnhighlight" />
		<v-card :color="cardColor" class="ma-2 message-card">
			<v-menu bottom right>
				<template #activator="{ props }">
					<v-btn icon tile :aria-haspopup="props['aria-haspopup']" :aria-expanded="props['aria-expanded']"
						@click="props.onClick" class="menu-button elevation-0" style="background-color: transparent;">
						<v-icon color="black">mdi-dots-vertical</v-icon>
					</v-btn>
				</template>
				<v-list>
					<v-list-item @click="openEditDialog">
						<v-list-item-title>Edit</v-list-item-title>
					</v-list-item>
					<v-list-item @click="deleteMessage">
						<v-list-item-title>Delete</v-list-item-title>
					</v-list-item>
				</v-list>
			</v-menu>
			<v-card-text class="message-text">
				<template v-for="(part, idx) in parts" :key="idx">
					<span v-if="part.type === 'sentence'" :class="[
						'sentence',
						{
							'hover-highlight': hoverHighlightIndex === part.index,
							'playing-highlight': playingHighlightIndex === part.index,
						},
					]" @mouseenter="highlightSentence(part.index)" @mouseleave="unhighlightSentence"
						@click="speakFromSentence(part.index)">{{ part.text }}</span>
					<span v-else-if="part.type === 'space'"> </span>
					<br v-else-if="part.type === 'newline'" />
				</template>
			</v-card-text>

			<!-- Edit Message Dialog -->
			<v-dialog v-model="editDialog" max-width="600px">
				<v-card>
					<v-card-title>
						<span class="headline">Edit Message</span>
					</v-card-title>
					<v-card-text>
						<v-textarea v-model="editedText" :rules="[v => !!v || 'Message cannot be empty']"
							label="Message" auto-grow></v-textarea>
					</v-card-text>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn color="blue darken-1" text @click="closeEditDialog">Cancel</v-btn>
						<v-btn color="blue darken-1" text @click="saveEdit" :disabled="!editedText">Save</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>
		</v-card>
	</div>
</template>

<script>
import SpeechSynthesisService from '../services/SpeechSynthesisService.js';
import MessageItemSpeech from './MessageItemSpeech.vue';

export default {
	name: 'MessageItem',
	components: {
		MessageItemSpeech,
	},
	props: {
		message: {
			type: Object,
			required: true,
		},
		index: {
			type: Number,
			required: true,
		},
	},
	data() {
		return {
			hoverHighlightIndex: null,
			playingHighlightIndex: null,
			editDialog: false,
			editedText: '',
		};
	},
	computed: {
		cardColor() {
			return this.index % 2 === 0 ? '#d4ebf2' : '#add8e6';
		},
		splitResult() {
			return SpeechSynthesisService.splitIntoParts(this.message.text);
		},
		parts() {
			return this.splitResult.parts;
		},
		sentences() {
			return this.splitResult.sentences;
		},
	},
	methods: {
		handleToggleSpeech(isPlaying) {
			this.isPlaying = isPlaying;
		},
		handleHighlight(idx) {
			this.playingHighlightIndex = idx;
		},
		handleUnhighlight() {
			this.playingHighlightIndex = null;
		},
		highlightSentence(idx) {
			this.hoverHighlightIndex = idx;
		},
		unhighlightSentence() {
			this.hoverHighlightIndex = null;
		},
		speakFromSentence(startIdx) {
			this.$refs.speech.speakFromSentence(startIdx);
		},
		openEditDialog() {
			this.editedText = this.message.text;
			this.editDialog = true;
		},
		closeEditDialog() {
			this.editDialog = false;
			this.editedText = '';
		},
		saveEdit() {
			const updatedMessage = { ...this.message, text: this.editedText };
			this.$emit('edit', updatedMessage);
			this.closeEditDialog();
		},
		deleteMessage() {
			this.$emit('delete', this.message);
		},
	},
	beforeUnmount() {
		if (this.$refs.speech) {
			this.$refs.speech.cancelSpeech();
		}
	},
};
</script>

<style scoped>
.message-container {
	width: 100%;
	max-width: 1024px;
	margin: 0 auto;
	display: flex;
	align-items: center;
}

.message-card {
	width: 100%;
	color: black;
	position: relative;
}

.menu-button {
	float: right;
	padding: 4px;
}

.message-text {
	white-space: pre-wrap;
}

.sentence {
	cursor: pointer;
	transition: background-color 0.3s;
	color: black;
}

.sentence:hover {
	background-color: #ffffff;
}

.hover-highlight {
	background-color: #ffffff;
}

.playing-highlight {
	background-color: #ffffff;
}
</style>
