<template>
  <BaseModal ref="modal">
    <div class="device-selector">
      <h3>Select <span>{{ type}}</span> Device</h3>
      <div class="form">
        <div class="group">
          <label for="devices">Devices</label>
          <select name="devices" v-model="deviceId">
            <template v-if="devices.length > 0">
              <option :value="null" disabled>Choose device</option>
              <option
                v-for="device in devices"
                :key="device.value"
                :value="device.value"
                >{{ device.label }}</option>
            </template>
            <template v-else>
              <option :value="null" disabled>No Device found</option>
            </template>
          </select>
        </div>
      </div>
      <div class="actions">
        <button type="button" @click="handleAction('cancel')">Cancel</button>
        <button type="button" @click="handleAction('confirm')">Select</button>
      </div>
    </div>
  </BaseModal>
</template>

<script>
  import BaseModal from '@/components/ui/BaseModal.vue';
  import { WebMidi } from 'webmidi';

  export default {
    name: 'DeviceSelectorModal',
    components: {
      BaseModal,
    },
    //---------------------------------------------------
    //
    //  Properties
    //
    //---------------------------------------------------
    props: {
      type: {
        type: String,
        default: null,
      },
    },
    //---------------------------------------------------
    //
    //  Data model
    //
    //---------------------------------------------------
    data() {
      return {
        deviceId: null,
        devices: [],
      };
    },
    //---------------------------------------------------
    //
    //  Computed Properties
    //
    //---------------------------------------------------
    computed: {},
    //---------------------------------------------------
    //
    //  Watch Properties
    //
    //---------------------------------------------------
    watch: {},
    //---------------------------------------------------
    //
    //  Filter Properties
    //
    //---------------------------------------------------
    // filters: {},
    //---------------------------------------------------
    //
    //  Validation Properties
    //
    //---------------------------------------------------
    // validations: {},
    //---------------------------------------------------
    //
    //  Vue Lifecycle
    //
    //---------------------------------------------------
    // beforeCreate() {},
    async mounted() {
      const type = this.type;
      if (type === 'audio') {
        const rawDevices = await navigator.mediaDevices.enumerateDevices();
        this.devices = rawDevices
          .filter(d => d.kind === 'audioinput')
          .map(d => ({ value: d.deviceId, label: d.label }));
      } else if (type === 'midi') {
        this.devices = WebMidi.inputs.map(d => ({ value: d.name, label: d.name }));
      }
    },
    // beforeMount() {},
    // render(h) { return h(); },
    // async mounted() {},
    // beforeUpdate() {},
    // updated() {},
    // beforeDestroy() {},
    // destroyed() {},
    //---------------------------------------------------
    //
    //  Methods
    //
    //---------------------------------------------------
    methods: {
      //----------------------------------
      // Event Handlers
      //----------------------------------
      handleAction(action) {
        this.$emit('selected', { action, value: this.deviceId });
      },
    },
  };
</script>

<style lang="scss">

.device-selector {
  padding: 15px;
  border-radius: 4px;
  background-color: #222;
  border: 1px solid #444;
  box-shadow: 0 2px 5px black;
  min-width: 500px;

  & >h3 {
    margin: 0 0 15px 0;
    span {
      text-transform: capitalize;
    }
  }

  & > .form {
    padding: 10px;
    & > .group {
      margin-bottom: 15px;

      & > label {
        display: inline-block;
        width: 100%;
        text-transform: uppercase;
        font-size: 1.2rem;
        margin-bottom: 7.5px;
      }
      & > input,textarea,select {
        width: 100%;
      }
      & > select {
        min-height: 36px;
        background-color: #111;
        border: 1px solid #333;
        border-radius: 4px;
        padding: 2px 4px;
        color: white;
        outline: 0;
      }
    }
  }

  & > .actions {
    margin-top: 25px;
    text-align: right;
    button {
      outline: 0;
      border: 0;
      border-radius: 4px;
      min-height: 36px;
      min-width: 100px;
      font-weight: bold;
      font-size: 1.3rem;
      text-transform: uppercase;
      cursor: pointer;
      margin-right: 7.5px;

      &:last-of-type {
        background-color: darkcyan;
        color: white;
        margin-right: 0;
      }
    }
  }
}
</style>
