<template>
  <div class="modal">
    <div ref="overlay" @mousedown="handleMouseDown"></div>
    <div>
      <slot/>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'BaseModal',
    components: {
    },
    //---------------------------------------------------
    //
    //  Properties
    //
    //---------------------------------------------------
    props: {},
    //---------------------------------------------------
    //
    //  Data model
    //
    //---------------------------------------------------
    data() {
      return {};
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
    // created() {},
    // beforeMount() {},
    // render(h) { return h(); },
    // mounted() {},
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
      destroy() {
        this.$emit('selected', {});
      },
      //----------------------------------
      // Event Handlers
      //----------------------------------
      handleMouseDown() {
        this.destroy();
      },
    },
  };
</script>

<style lang="scss">

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  & > div:first-of-type {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .85);
  }

  & > div:last-of-type {
    position: relative;
    z-index: 2;
  }
}
</style>
