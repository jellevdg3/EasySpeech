<template>
  <div :class="alignment" class="message-container">
    <v-card
      :color="cardColor"
      class="ma-2 message-card"
    >
      <v-card-text class="message-text">{{ message.text }}</v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'MessageItem',
  props: {
    message: {
      type: Object,
      required: true
    }
  },
  computed: {
    alignment() {
      return {
        'text-right': this.message.sender === 'user',
        'text-left': this.message.sender === 'bot'
      };
    },
    cardColor() {
      return this.message.sender === 'user' ? 'blue lighten-5' : 'grey lighten-2';
    }
  }
}
</script>

<style scoped>
.message-container {
  width: 100%;
  display: flex;
  justify-content: center;
}
.message-card {
  width: 100%;
}
.message-text {
  white-space: pre-wrap;
}
</style>