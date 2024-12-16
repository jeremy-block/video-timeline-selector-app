<!-- :::artifact{identifier="timeline-updated" type="text/vue" title="src/components/Timeline.vue"} -->
<template>
    <div class="timeline-container">
        <div ref="timelineRef" class="timeline h-16 bg-gray-200 rounded relative" @mousedown="handleMouseDown"
            @mousemove="handleMouseMove" @mouseup="handleMouseUp" @mouseleave="handleMouseLeave">
            <!-- Background grid for visual reference -->
            <div class="absolute inset-0 grid grid-cols-12 gap-0">
                <div v-for="n in 12" :key="n" class="border-l border-gray-300 h-full first:border-l-0"></div>
            </div>

            <!-- Regions -->
            <TimelineRegion v-for="(region, index) in regions" :key="index" :start="region.start" :end="region.end"
                :index="index" @update:start="updateRegionStart(index, $event)"
                @update:end="updateRegionEnd(index, $event)" @remove="removeRegion(index)" />


            <!-- Current time playhead -->
            <div class="absolute h-full w-0.5 bg-red-500 pointer-events-none"
                :style="{ left: `${(currentTime / duration) * 100}%` }">
                <div
                    class="absolute top-full left-0 mt-1 bg-red-500 text-white text-xs p-1 rounded transform -translate-x-1/2">
                    {{ formatTimecode(currentTime) }}
                </div>
            </div>

            <!-- Selection overlay -->
            <div v-if="isSelecting" class="absolute h-full bg-blue-300 opacity-30" :style="{
                left: `${(Math.min(selectionStart, selectionEnd) / duration) * 100}%`,
                width: `${(Math.abs(selectionEnd - selectionStart) / duration) * 100}%`
            }"></div>
        </div>
    </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import TimelineRegion from './TimelineRegion.vue'
import { formatTimecode } from '../utils/formatTimecode'

export default {
    name: 'Timeline',
    components: {
        TimelineRegion
    },
    setup() {
        const store = useStore()
        const timelineRef = ref(null)
        const isSelecting = ref(false)
        const selectionStart = ref(0)
        const selectionEnd = ref(0)
        const isHovering = ref(false)

        const currentTime = computed(() => store.state.currentTime)
        const duration = computed(() => store.state.duration)
        const regions = computed(() => store.state.regions)
        const hoverTime = computed(() => store.state.hoverTime)

        const getTimeFromEvent = (event) => {
            const rect = timelineRef.value.getBoundingClientRect()
            const percentage = (event.clientX - rect.left) / rect.width
            return Math.max(0, Math.min(percentage * duration.value, duration.value))
        }

        const handleMouseMove = (event) => {
            const time = getTimeFromEvent(event)
            store.commit('SET_HOVER_TIME', time)
            isHovering.value = true

            // Update selection if we're currently selecting
            if (isSelecting.value) {
                selectionEnd.value = time
                // Update current time while dragging
                store.commit('SET_CURRENT_TIME', time)
            }

            // Update current time while hovering (if not selecting)
            if (!isSelecting.value && !store.state.isDragging) {
                store.commit('SET_CURRENT_TIME', time)
            }
        }

        const handleMouseDown = (event) => {
            const time = getTimeFromEvent(event)
            isSelecting.value = true
            selectionStart.value = time
            selectionEnd.value = time
            store.commit('SET_IS_DRAGGING', true)
        }

        const handleMouseUp = () => {
            if (isSelecting.value) {
                if (Math.abs(selectionEnd.value - selectionStart.value) > 0.1) {
                    store.commit('ADD_REGION', {
                        start: Math.min(selectionStart.value, selectionEnd.value),
                        end: Math.max(selectionStart.value, selectionEnd.value)
                    })
                }
                isSelecting.value = false
            }
            store.commit('SET_IS_DRAGGING', false)
        }

        const handleMouseLeave = () => {
            isHovering.value = false
            if (isSelecting.value) {
                handleMouseUp()
            }
        }

        const updateRegionStart = (index, time) => {
            const region = { ...regions.value[index] }
            region.start = Math.min(time, region.end - 0.1)
            store.commit('UPDATE_REGION', { index, region })
        }

        const updateRegionEnd = (index, time) => {
            const region = { ...regions.value[index] }
            region.end = Math.max(time, region.start + 0.1)
            store.commit('UPDATE_REGION', { index, region })
        }

        const removeRegion = (index) => {
            store.commit('REMOVE_REGION', index)
        }


        return {
            timelineRef,
            currentTime,
            duration,
            regions,
            isSelecting,
            selectionStart,
            selectionEnd,
            isHovering,
            hoverTime,
            handleMouseMove,
            handleMouseDown,
            handleMouseUp,
            handleMouseLeave,
            updateRegionStart,
            updateRegionEnd,
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

.timeline-container {
    position: relative;
    margin: 2rem 0;
}
</style>