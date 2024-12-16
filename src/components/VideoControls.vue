<!-- :::artifact{identifier="video-controls" type="text/vue" title="src/components/VideoControls.vue"} -->
<template>
    <div class="video-controls bg-gray-100 p-4 rounded-lg mb-4">
        <div class="flex items-center space-x-4">
            <!-- Play/Pause Button -->
            <button @click="togglePlayback"
                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-colors">
                {{ isPlaying ? '❚❚' : '▶' }}
            </button>

            <!-- Timecode Display -->
            <div class="text-mono space-x-2">
                <span class="current-time">{{ formatTimecode(currentTime) }}</span>
                <span>/</span>
                <span class="duration">{{ formatTimecode(duration) }}</span>
            </div>

            <!-- Hover Time Display -->
            <div v-if="isHovering" class="text-mono text-gray-600">
                Hover: {{ formatTimecode(hoverTime) }}
            </div>
        </div>
    </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { formatTimecode } from '../utils/formatTimecode'

export default {
    name: 'VideoControls',
    setup() {
        const store = useStore()

        const currentTime = computed(() => store.state.currentTime)
        const duration = computed(() => store.state.duration)
        const isPlaying = computed(() => store.state.isPlaying)
        const isHovering = computed(() => store.state.isHovering)
        const hoverTime = computed(() => store.state.hoverTime)

        const togglePlayback = () => {
            store.dispatch('togglePlayback')
        }


        return {
            currentTime,
            duration,
            isPlaying,
            isHovering,
            hoverTime,
            togglePlayback,
            formatTimecode
        }
    }
}
</script>