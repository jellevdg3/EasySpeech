<template>
  <v-dialog v-model="localDialog" max-width="400">
    <v-card>
      <v-card-title>Settings</v-card-title>
      <v-card-text>
        <v-select
          :items="voices"
          label="Select Voice"
          :value="localSelectedVoice"
          @input="updateSelectedVoice"
        ></v-select>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="closeDialog">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'SettingsDialog',
  props: {
    dialog: {
      type: Boolean,
      required: true
    },
    voices: {
      type: Array,
      required: true
    },
    selectedVoice: {
      type: String,
      required: false,
      default: null
    }
  },
  data() {
    return {
      localDialog: this.dialog,
      localSelectedVoice: this.selectedVoice
    }
  },
  watch: {
    dialog(newVal) {
      this.localDialog = newVal;
    },
    localDialog(newVal) {
      this.$emit('update:dialog', newVal);
    },
    selectedVoice(newVal) {
      this.localSelectedVoice = newVal;
    }
  },
  methods: {
    closeDialog() {
      this.localDialog = false;
    },
    updateSelectedVoice(value) {
      this.localSelectedVoice = value;
      this.$emit('update:selectedVoice', value);
    }
  }
}
</script>