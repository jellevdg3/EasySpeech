<template>
  <div ref="messagesContainer" class="messages d-flex flex-column align-start p-4" style="height: 100%;">
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
}
</style>