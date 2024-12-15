<!-- :::artifact{identifier="video-player" type="text/vue" title="src/components/VideoPlayer.vue"} -->
<template>
  <div class="video-player-container">
    <video
      ref="videoRef"
      :src="videoUrl"
      class="w-full rounded-lg"
      @loadedmetadata="handleMetadata"
      @timeupdate="handleTimeUpdate"
      @play="$store.commit('SET_PLAYING', true)"
      @pause="$store.commit('SET_PLAYING', false)"
    ></video>
  </div>
</template>

<script>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'VideoPlayer',
  setup() {
    const store = useStore()
    const videoRef = ref(null)

    const handleMetadata = () => {
      store.commit('SET_DURATION', videoRef.value.duration)
    }

    const handleTimeUpdate = () => {
      if (!store.state.isDragging) {
        store.dispatch('updateCurrentTime', videoRef.value.currentTime)
      }
    }

    // Watch for play/pause state changes
    watch(() => store.state.isPlaying, (isPlaying) => {
      if (isPlaying) {
        videoRef.value.play()
      } else {
        videoRef.value.pause()
      }
    })

    // Watch for time updates from timeline scrubbing
    watch(() => store.state.currentTime, (newTime) => {
      if (Math.abs(videoRef.value.currentTime - newTime) > 0.1) {
        videoRef.value.currentTime = newTime
      }
    })

    const videoUrl = computed(() => store.state.videoUrl)

    return {
      videoRef,
      videoUrl,
      handleMetadata,
      handleTimeUpdate
    }
  }
}
</script>