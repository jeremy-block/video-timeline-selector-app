<!-- :::artifact{identifier="app" type="text/vue" title="src/App.vue"} -->
<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <!-- File Selection Page -->
    <div v-if="!selectedFile" class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-bold mb-4">Select Video File</h1>
      <input type="file" accept="video/*" @change="handleFileSelect" class="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100">
    </div>

    <!-- Video Player Page -->
    <div v-else class="mx-auto bg-white rounded-lg shadow-lg p-6">
      <VideoPlayer />
      <VideoControls />
      <Timeline />

      <!-- Continue Button -->
      <button @click="handleContinue"
        class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors mt-4">
        Continue
      </button>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import VideoPlayer from './components/VideoPlayer.vue'
import VideoControls from './components/VideoControls.vue'
import Timeline from './components/Timeline.vue'

export default {
  name: 'App',
  components: {
    VideoPlayer,
    VideoControls,
    Timeline
  },
  setup() {
    const store = useStore()

    const selectedFile = computed(() => store.state.selectedFile)

    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      if (file) {
        store.commit('SET_VIDEO_FILE', {
          file,
          url: URL.createObjectURL(file)
        })
      }
    }

    const handleContinue = () => {
      console.log(JSON.stringify(store.state.regions, null, 2))
    }

    return {
      selectedFile,
      handleFileSelect,
      handleContinue
    }
  }
}
</script>