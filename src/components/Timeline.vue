<!-- :::artifact{identifier="timeline-update" type="text/vue" title="src/components/Timeline.vue"} -->
<template>
    <div class="timeline-container">
        <div ref="timelineRef" class="timeline h-16 bg-gray-200 rounded relative" @mousedown="handleMouseDown"
            @mousemove="handleMouseMove" @mouseup="handleMouseUp" @mouseleave="handleMouseLeave">
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

                <!-- Remove button -->
                <button @click="removeRegion(index)"
                    class="absolute -top-7 right-0 bg-red-500 text-white px-2 py-1 rounded text-sm">
                    X
                </button>

                <!-- Time tooltip -->
                <div class="absolute -bottom-6 left-0 text-xs bg-gray-800 text-white px-2 py-1 rounded">
                    {{ formatTimecode(region.start) }}
                </div>
                <div class="absolute -bottom-6 right-0 text-xs bg-gray-800 text-white px-2 py-1 rounded">
                    {{ formatTimecode(region.end) }}
                </div>
            </div>

            <!-- Playhead -->
            <div class="absolute h-full w-1 bg-red-500 pointer-events-none transition-all duration-75"
                :style="{ left: `${(currentTimeDisplay / duration) * 100}%` }"></div>

            <!-- Hover indicator -->
            <div v-if="isHovering && !isDragging && !isSelecting" class="absolute h-full w-1 bg-gray-500 opacity-50"
                :style="{ left: `${(hoverTime / duration) * 100}%` }"></div>
        </div>
    </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'

export default {
    name: 'Timeline',
    setup() {
        const store = useStore()
        const timelineRef = ref(null)
        const selectionStart = ref(null)
        const isSelecting = ref(false)
        const isDragging = ref(false)
        const isHovering = ref(false)
        const dragData = ref({ regionIndex: null, handle: null })

        // Compute the display time (either current time or drag time)
        const currentTimeDisplay = computed(() => {
            return isDragging.value || isSelecting.value
                ? store.state.hoverTime
                : store.state.currentTime
        })

        const currentTime = computed(() => store.state.currentTime)
        const duration = computed(() => store.state.duration)
        const regions = computed(() => store.state.regions)
        const hoverTime = computed(() => store.state.hoverTime)

        const formatTimecode = (time) => {
            const hours = Math.floor(time / 3600)
            const minutes = Math.floor((time % 3600) / 60)
            const seconds = Math.floor(time % 60)
            const frames = Math.floor((time % 1) * 30) // Assuming 30fps

            return `${hours.toString().padStart(2, '0')}:${minutes
                .toString()
                .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${frames
                    .toString()
                    .padStart(2, '0')}`
        }

        const getTimeFromEvent = (event) => {
            const rect = timelineRef.value.getBoundingClientRect()
            const percentage = (event.clientX - rect.left) / rect.width
            return Math.max(0, Math.min(percentage * duration.value, duration.value))
        }

        const handleMouseMove = (event) => {
            const time = getTimeFromEvent(event)
            store.commit('SET_HOVER_TIME', time)
            isHovering.value = true

            if (isSelecting.value) {
                const start = Math.min(selectionStart.value, time)
                const end = Math.max(selectionStart.value, time)

                if (regions.value.length > 0 && regions.value[regions.value.length - 1].temporary) {
                    store.commit('UPDATE_REGION', {
                        index: regions.value.length - 1,
                        region: { start, end, temporary: true }
                    })
                } else {
                    store.commit('ADD_REGION', { start, end, temporary: true })
                }
            }

            // Update video time while scrubbing
            if (!isSelecting.value) {
                store.commit('SET_CURRENT_TIME', time)
            }
        }

        const handleMouseDown = (event) => {
            const time = getTimeFromEvent(event)
            selectionStart.value = time
            isSelecting.value = true
            isDragging.value = true
            store.commit('SET_IS_DRAGGING', true)

            // Pause video while dragging
            store.commit('SET_PLAYING', false)
        }

        const handleMouseUp = () => {
            if (isSelecting.value) {
                isSelecting.value = false
                if (regions.value.length > 0) {
                    const lastRegion = regions.value[regions.value.length - 1]
                    if (lastRegion.temporary) {
                        store.commit('UPDATE_REGION', {
                            index: regions.value.length - 1,
                            region: { ...lastRegion, temporary: false }
                        })
                    }
                }
            }
            isDragging.value = false
            store.commit('SET_IS_DRAGGING', false)
        }

        const handleMouseLeave = () => {
            isHovering.value = false
            if (!isDragging.value) {
                store.commit('SET_IS_DRAGGING', false)
            }
        }

        const startDraggingHandle = (index, handle) => {
            dragData.value = { regionIndex: index, handle }
            isDragging.value = true
            store.commit('SET_IS_DRAGGING', true)
        }

        const removeRegion = (index) => {
            store.commit('REMOVE_REGION', index)
        }

        return {
            timelineRef,
            currentTime,
            currentTimeDisplay,
            duration,
            regions,
            isHovering,
            isDragging,
            hoverTime,
            handleMouseMove,
            handleMouseDown,
            handleMouseUp,
            handleMouseLeave,
            startDraggingHandle,
            removeRegion,
            formatTimecode
        }
    }
}
</script>

<style scoped>
.timeline {
    cursor: pointer;
    user-select: none;
}

/* Add smooth transition for playhead */
.timeline .playhead {
    transition: left 0.1s linear;
}
</style>