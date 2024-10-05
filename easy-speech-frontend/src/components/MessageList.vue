<template>
  <div class="messages d-flex flex-column align-center p-4">
    <MessageItem
      v-for="(message, index) in messages"
      :key="index"
      :message="message"
      :index="index"
    />
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
  }
}
</script>

<style scoped>
.messages {
  width: 100%;
}
</style>