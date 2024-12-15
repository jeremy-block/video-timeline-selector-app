<!-- :::artifact{identifier="timeline" type="text/vue" title="src/components/Timeline.vue"} -->
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
            </div>

            <!-- Playhead -->
            <div class="absolute h-full w-1 bg-red-500 pointer-events-none"
                :style="{ left: `${(currentTime / duration) * 100}%` }"></div>

            <!-- Hover indicator -->
            <div v-if="isHovering" class="absolute h-full w-1 bg-gray-500 opacity-50"
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
        const dragData = ref({ regionIndex: null, handle: null })

        const currentTime = computed(() => store.state.currentTime)
        const duration = computed(() => store.state.duration)
        const regions = computed(() => store.state.regions)
        const isHovering = computed(() => store.state.isHovering)
        const hoverTime = computed(() => store.state.hoverTime)

        const getTimeFromEvent = (event) => {
            const rect = timelineRef.value.getBoundingClientRect()
            const percentage = (event.clientX - rect.left) / rect.width
            return Math.max(0, Math.min(percentage * duration.value, duration.value))
        }

        const handleMouseMove = (event) => {
            const time = getTimeFromEvent(event)
            store.commit('SET_HOVER_TIME', time)

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
            if (!isSelecting.value && !store.state.isDragging) {
                store.commit('SET_CURRENT_TIME', time)
            }
        }

        const handleMouseDown = (event) => {
            const time = getTimeFromEvent(event)
            selectionStart.value = time
            isSelecting.value = true
            store.commit('SET_IS_DRAGGING', true)
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
            store.commit('SET_IS_DRAGGING', false)
        }

        const handleMouseLeave = () => {
            store.commit('SET_IS_HOVERING', false)
        }

        const startDraggingHandle = (index, handle) => {
            dragData.value = { regionIndex: index, handle }
            store.commit('SET_IS_DRAGGING', true)
        }

        const removeRegion = (index) => {
            store.commit('REMOVE_REGION', index)
        }

        return {
            timelineRef,
            currentTime,
            duration,
            regions,
            isHovering,
            hoverTime,
            handleMouseMove,
            handleMouseDown,
            handleMouseUp,
            handleMouseLeave,
            startDraggingHandle,
            removeRegion
        }
    }
}
</script>

<style scoped>
.timeline {
    cursor: pointer;
    user-select: none;
}
</style>