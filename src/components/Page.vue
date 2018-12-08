<template>
  <transition name="page-up">
    <div class="mv-page" v-if="value">
      <div class="p-head">
        <v-icon icon="left" @click.native="$emit('input', false)"></v-icon>
        <div class="h-title">{{title}}</div>
        <div class="h-actions"></div>
      </div>
      <div class="p-body">
        <slot></slot>
      </div>
    </div>
  </transition>
</template>

<script>
  export default {
    name: 'mv-page',
    props: {
      value: Boolean,
      title: String
    }
  }
</script>
