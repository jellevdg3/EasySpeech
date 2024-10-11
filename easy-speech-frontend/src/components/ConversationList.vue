<template>
	<v-navigation-drawer :model-value="drawer" @update:model-value="$emit('update:drawer', $event)" app
		:permanent="!isMobile" :temporary="isMobile" class="conversation-drawer">
		<v-list dense>
			<v-list-item>
				<div class="d-flex align-center">
					<v-list-item-title class="headline">{{ $t('conversations') }}</v-list-item-title>
					<v-btn icon size="x-small" class="ml-2 mb-1 d-none d-lg-flex elevation-0"
						@click="$emit('add-conversation')">
						<v-icon size="x-small">mdi-plus</v-icon>
					</v-btn>
				</div>
			</v-list-item>
			<v-divider class=" mb-2"></v-divider>
			<v-list-item v-for="(conv) in conversations" :key="conv.id" :active="conv.id === currentConversation?.id"
				@click="selectConversation(conv)">
				<div class="d-flex justify-space-between align-center" style="width: 100%;">
					<v-list-item-title>{{ conv.name }}</v-list-item-title>
					<div>
						<v-btn icon size="small" class="elevation-0" style="background-color: transparent;"
							@click.stop="openRenameDialog(conv)">
							<v-icon size="small">mdi-pencil</v-icon>
						</v-btn>
						<v-btn icon size="small" class="elevation-0" style="background-color: transparent;"
							@click.stop="confirmDelete(conv)">
							<v-icon size="small">mdi-trash-can</v-icon>
						</v-btn>
					</div>
				</div>
			</v-list-item>
		</v-list>
		<v-dialog v-model="deleteDialog" max-width="400">
			<v-card>
				<v-card-title class="headline">{{ $t('confirmDeletion') }}</v-card-title>
				<v-card-text>{{ $t('confirmDeletionMessage') }}</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn text @click="deleteDialog = false">{{ $t('cancel') }}</v-btn>
					<v-btn color="red" text @click="deleteConversation">{{ $t('delete') }}</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="renameDialog" max-width="400">
			<v-card>
				<v-card-title class="headline">{{ $t('renameConversation') }}</v-card-title>
				<v-card-text>
					<v-text-field v-model="newName" :label="$t('newName')" />
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn text @click="renameDialog = false">{{ $t('cancel') }}</v-btn>
					<v-btn color="blue" text @click="renameConversation">{{ $t('rename') }}</v-btn>
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
		const renameDialog = ref(false);
		const conversationToRename = ref(null);
		const newName = ref('');

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

		const openRenameDialog = (conv) => {
			conversationToRename.value = conv;
			newName.value = conv.name;
			renameDialog.value = true;
		};

		const renameConversation = () => {
			if (conversationToRename.value && newName.value.trim() !== '') {
				emit('rename-conversation', conversationToRename.value.id, newName.value.trim());
				conversationToRename.value = null;
				newName.value = '';
			}
			renameDialog.value = false;
		};

		const selectConversation = (conv) => {
			emit('select-conversation', conv);
		};

		return {
			deleteDialog,
			conversationToDelete,
			confirmDelete,
			deleteConversation,
			renameDialog,
			conversationToRename,
			newName,
			openRenameDialog,
			renameConversation,
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