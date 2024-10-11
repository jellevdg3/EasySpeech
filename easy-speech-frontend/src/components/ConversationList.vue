<template>
	<v-navigation-drawer :model-value="drawer" @update:model-value="$emit('update:drawer', $event)" app
		:permanent="!isMobile" :temporary="isMobile" class="conversation-drawer">
		<v-list dense>
			<v-list-item>
				<div class="d-flex align-center">
					<v-list-item-title class="headline">Conversations</v-list-item-title>
					<v-btn icon size="x-small" class="ml-2 mb-1 d-none d-lg-flex" @click="$emit('add-conversation')">
						<v-icon size="x-small">mdi-plus</v-icon>
					</v-btn>
				</div>
			</v-list-item>
			<v-divider></v-divider>
			<v-list-item v-for="(conv) in conversations" :key="conv.id" :active="conv.id === currentConversation?.id"
				@click="selectConversation(conv)">
				<div class="d-flex justify-space-between align-center" style="width: 100%;">
					<v-list-item-title>{{ conv.name }}</v-list-item-title>
					<v-btn icon size="small" class="elevation-0" style="background-color: transparent;"
						@click.stop="confirmDelete(conv)">
						<v-icon size="small">mdi-trash-can</v-icon>
					</v-btn>
				</div>
			</v-list-item>
		</v-list>
		<v-dialog v-model="deleteDialog" max-width="400">
			<v-card>
				<v-card-title class="headline">Confirm Deletion</v-card-title>
				<v-card-text>Are you sure you want to delete this conversation?</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn text @click="deleteDialog = false">Cancel</v-btn>
					<v-btn color="red" text @click="deleteConversation">Delete</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</v-navigation-drawer>
</template>

<script>
import { ref } from 'vue';

export default {
	name: 'ConversationList',
	props: {
		conversations: {
			type: Array,
			required: true
		},
		currentConversation: {
			type: Object,
			default: null
		},
		drawer: {
			type: Boolean,
			required: true
		},
		isMobile: {
			type: Boolean,
			required: true
		}
	},
	setup(props, { emit }) {
		const deleteDialog = ref(false);
		const conversationToDelete = ref(null);

		const confirmDelete = (conv) => {
			conversationToDelete.value = conv;
			deleteDialog.value = true;
		};

		const deleteConversation = () => {
			if (conversationToDelete.value) {
				emit('delete-conversation', conversationToDelete.value.id);
				conversationToDelete.value = null;
			}
			deleteDialog.value = false;
		};

		const selectConversation = (conv) => {
			emit('select-conversation', conv);
		};

		return {
			deleteDialog,
			conversationToDelete,
			confirmDelete,
			deleteConversation,
			selectConversation
		};
	}
}
</script>

<style scoped>
.conversation-drawer {
	width: 250px;
}
</style>