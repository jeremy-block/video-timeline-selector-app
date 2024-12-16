<!-- :::artifact{identifier="timeline-region" type="text/vue" title="src/components/TimelineRegion.vue"} -->
<template>
    <div class="absolute h-full group" :style="{
        left: `${(start / duration) * 100}%`,
        width: `${((end - start) / duration) * 100}%`
    }" @mousedown.stop="handleRegionClick">
        <!-- Region background -->
        <div class="absolute inset-0 bg-blue-200 opacity-50"></div>

        <!-- Left handle with drag area -->
        <div class="absolute left-0 top-0 bottom-0 w-4 cursor-ew-resize handle-area"
            @mousedown.stop="startHandleDrag('start')">
            <!-- Visual handle indicator -->
            <div class="absolute left-0 h-full w-1 bg-blue-600 opacity-75 group-hover:opacity-100">
                <!-- Left handle tooltip -->
                <div class="absolute bottom-full left-0 mb-1 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap transform -translate-x-1/2"
                    :class="{ 'opacity-100': isDragging && activeHandle === 'start', 'opacity-0': !isDragging || activeHandle !== 'start' }">
                    {{ formatTimecode(start) }}
                </div>
            </div>
        </div>

        <!-- Right handle with drag area -->
        <div class="absolute right-0 top-0 bottom-0 w-4 cursor-ew-resize handle-area"
            @mousedown.stop="startHandleDrag('end')">
            <!-- Visual handle indicator -->
            <div class="absolute right-0 h-full w-1 bg-blue-600 opacity-75 group-hover:opacity-100">
            </div>
        </div>

        <!-- Region info and controls -->
        <div
            class="absolute -top-8 right-0 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click.stop="$emit('remove')"
                class="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors">
                Remove
            </button>
        </div>

        <!-- Center duration display (visible while dragging) -->
        <div
            class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
             bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            {{ formatTimecode(end - start) }}
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { formatTimecode } from '../utils/formatTimecode'

export default {
    name: 'TimelineRegion',
    props: {
        start: {
            type: Number,
            required: true
        },
        end: {
            type: Number,
            required: true
        },
        index: {
            type: Number,
            required: true
        }
    },
    emits: ['update:start', 'update:end', 'remove'],

    setup(props, { emit }) {
        const store = useStore()
        const isDragging = ref(false)
        const activeHandle = ref(null)
        const startPosition = ref(null)
        const originalStart = ref(null)
        const originalEnd = ref(null)

        const duration = computed(() => store.state.duration)

        const startHandleDrag = (handle) => {
            isDragging.value = true
            activeHandle.value = handle
            startPosition.value = null
            originalStart.value = props.start
            originalEnd.value = props.end
            store.commit('SET_IS_DRAGGING', true)

            // Add global mouse event listeners
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        }

        const handleMouseMove = (event) => {
            if (!isDragging.value) return

            const timelineEl = event.target.closest('.timeline')
            if (!timelineEl) return

            const rect = timelineEl.getBoundingClientRect()
            const percentage = (event.clientX - rect.left) / rect.width
            const newTime = Math.max(0, Math.min(percentage * duration.value, duration.value))

            if (startPosition.value === null) {
                startPosition.value = newTime
            }

            const timeDiff = newTime - startPosition.value

            if (activeHandle.value === 'start') {
                const newStart = Math.max(0, Math.min(originalStart.value + timeDiff, props.end - 0.1))
                emit('update:start', newStart)
            } else if (activeHandle.value === 'end') {
                const newEnd = Math.min(duration.value, Math.max(props.start + 0.1, originalEnd.value + timeDiff))
                emit('update:end', newEnd)
            }

            // Update current time while dragging
            store.commit('SET_CURRENT_TIME', newTime)
        }

        const handleMouseUp = () => {
            isDragging.value = false
            activeHandle.value = null
            store.commit('SET_IS_DRAGGING', false)

            // Remove global mouse event listeners
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }

        const handleRegionClick = (event) => {
            // Only handle clicks on the region body, not the handles
            if (!event.target.closest('.handle-area')) {
                const rect = event.target.closest('.timeline').getBoundingClientRect()
                const percentage = (event.clientX - rect.left) / rect.width
                const newTime = percentage * duration.value
                store.commit('SET_CURRENT_TIME', newTime)
            }
        }

        // Clean up event listeners
        onUnmounted(() => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        })

        return {
            isDragging,
            activeHandle,
            duration,
            startHandleDrag,
            handleRegionClick,
            formatTimecode
        }
    }
}
</script>

<style scoped>
.handle-area {
    transition: opacity 0.2s;
    opacity: 0;
}

.group:hover .handle-area {
    opacity: 1;
}

/* Prevent text selection while dragging */
.handle-area {
    user-select: none;
}
</style>