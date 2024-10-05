<template>
  <v-container fluid class="d-flex flex-column justify-center items-center chat-container" style="height: 100vh; padding: 0;">
    <MessageList :messages="messages" class="flex-grow-1 overflow-y-auto" />
    <MessageInput v-model="newMessage" @send="sendMessage" class="input-area" />
  </v-container>
</template>

<script>
import MessageList from './MessageList.vue';
import MessageInput from './MessageInput.vue';

export default {
  name: 'ChatInterface',
  components: {
    MessageList,
    MessageInput
  },
  data() {
    return {
      messages: [],
      newMessage: ''
    }
  },
  methods: {
    sendMessage() {
      if (this.newMessage.trim() === '') return;
      this.messages.push({ sender: 'user', text: this.newMessage });
      this.newMessage = '';
    }
  }
}
</script>

<style scoped>
.chat-container {
  max-width: 1024px;
  width: 100%;
  margin: 0 auto;
}
.input-area {
  padding: 16px;
  width: 100%;
}
</style>