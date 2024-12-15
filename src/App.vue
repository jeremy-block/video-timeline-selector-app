:::artifact{identifier="video-timeline-app" type="application/vnd.react" title="VideoTimelineApp.vue"}
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
    <div v-else class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <!-- Video Player -->
      <video ref="videoRef" :src="videoUrl" class="w-full mb-4 rounded-lg" @loadedmetadata="handleVideoLoaded"
        controls></video>

      <!-- Timeline Component -->
      <div class="relative mb-6">
        <div class="timeline-container h-16 bg-gray-200 rounded relative" @mousedown="startSelection"
          @mousemove="updateSelection" @mouseup="endSelection">
          <!-- Regions -->
          <div v-for="(region, index) in regions" :key="index" class="absolute h-full bg-blue-200 opacity-50" :style="{
            left: `${(region.start / duration) * 100}%`,
            width: `${((region.end - region.start) / duration) * 100}%`
          }">
            <!-- Region handles -->
            <div class="absolute left-0 h-full w-2 cursor-ew-resize bg-blue-500"
              @mousedown.stop="startDraggingHandle(index, 'start')"></div>
            <div class="absolute right-0 h-full w-2 cursor-ew-resize bg-blue-500"
              @mousedown.stop="startDraggingHandle(index, 'end')"></div>

            <!-- Delete button -->
            <button @click="removeRegion(index)"
              class="absolute -top-6 right-0 bg-red-500 text-white px-2 py-1 rounded text-sm">
              Remove
            </button>
          </div>

          <!-- Playhead -->
          <div class="absolute h-full w-1 bg-red-500" :style="{ left: `${(currentTime / duration) * 100}%` }"></div>
        </div>
      </div>

      <!-- Timeline Info -->
      <div class="mb-4 text-sm text-gray-600">
        <p>Current Time: {{ formatTime(currentTime) }}</p>
        <p>Duration: {{ formatTime(duration) }}</p>
      </div>

      <!-- Regions List -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-2">Selected Regions:</h3>
        <ul class="space-y-2">
          <li v-for="(region, index) in regions" :key="index"
            class="flex items-center justify-between bg-gray-50 p-2 rounded">
            <span>{{ formatTime(region.start) }} - {{ formatTime(region.end) }}</span>
            <button @click="removeRegion(index)" class="text-red-500 hover:text-red-700">
              Remove
            </button>
          </li>
        </ul>
      </div>

      <!-- Continue Button -->
      <button @click="handleContinue"
        class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
        Continue
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'VideoTimelineApp',
  setup() {
    const videoRef = ref(null)
    const selectedFile = ref(null)
    const videoUrl = ref('')
    const currentTime = ref(0)
    const duration = ref(0)
    const regions = ref([])
    const isSelecting = ref(false)
    const selectionStart = ref(null)
    const isDragging = ref(false)
    const dragData = ref({ regionIndex: null, handle: null })

    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      if (file) {
        selectedFile.value = file
        videoUrl.value = URL.createObjectURL(file)
      }
    }

    const handleVideoLoaded = () => {
      duration.value = videoRef.value.duration
    }

    const updateCurrentTime = () => {
      if (videoRef.value) {
        currentTime.value = videoRef.value.currentTime
      }
    }

    const formatTime = (time) => {
      const minutes = Math.floor(time / 60)
      const seconds = Math.floor(time % 60)
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    const startSelection = (event) => {
      if (!isDragging.value) {
        const rect = event.target.getBoundingClientRect()
        const percentage = (event.clientX - rect.left) / rect.width
        selectionStart.value = percentage * duration.value
        isSelecting.value = true
      }
    }

    const updateSelection = (event) => {
      if (isSelecting.value) {
        const rect = event.target.getBoundingClientRect()
        const percentage = (event.clientX - rect.left) / rect.width
        const currentPos = percentage * duration.value

        if (selectionStart.value !== null) {
          const start = Math.min(selectionStart.value, currentPos)
          const end = Math.max(selectionStart.value, currentPos)

          // Update the last region or create a new one
          if (regions.value.length > 0 && regions.value[regions.value.length - 1].temporary) {
            regions.value[regions.value.length - 1] = { start, end, temporary: true }
          } else {
            regions.value.push({ start, end, temporary: true })
          }
        }
      }
    }

    const endSelection = () => {
      if (isSelecting.value) {
        isSelecting.value = false
        // Remove temporary flag from the last region
        if (regions.value.length > 0) {
          const lastRegion = regions.value[regions.value.length - 1]
          if (lastRegion.temporary) {
            delete lastRegion.temporary
          }
        }
      }
    }

    const startDraggingHandle = (index, handle) => {
      isDragging.value = true
      dragData.value = { regionIndex: index, handle }
    }

    const removeRegion = (index) => {
      regions.value.splice(index, 1)
    }

    const handleContinue = () => {
      console.log(JSON.stringify(regions.value, null, 2))
    }

    // Event listeners for video time updates
    onMounted(() => {
      if (videoRef.value) {
        videoRef.value.addEventListener('timeupdate', updateCurrentTime)
      }
    })

    onUnmounted(() => {
      if (videoRef.value) {
        videoRef.value.removeEventListener('timeupdate', updateCurrentTime)
      }
    })

    return {
      videoRef,
      selectedFile,
      videoUrl,
      currentTime,
      duration,
      regions,
      handleFileSelect,
      handleVideoLoaded,
      formatTime,
      startSelection,
      updateSelection,
      endSelection,
      removeRegion,
      handleContinue,
      startDraggingHandle
    }
  }
}
</script>

<style scoped>
.timeline-container {
  cursor: pointer;
  user-select: none;
}
</style>