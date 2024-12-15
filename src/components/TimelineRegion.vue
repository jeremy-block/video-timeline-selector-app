<!-- :::artifact{identifier="timeline-region" type="text/vue" title="src/components/TimelineRegion.vue"} -->
<template>
    <div class="absolute h-full bg-blue-200 opacity-50 group" :style="{
        left: `${(start / duration) * 100}%`,
        width: `${((end - start) / duration) * 100}%`
    }">
        <!-- Left handle -->
        <div class="absolute left-0 h-full w-2 cursor-ew-resize bg-blue-500 opacity-75 hover:opacity-100"
            @mousedown.stop="startDragging('start')">
            <div class="absolute bottom-full left-0 mb-1 bg-black text-white text-xs p-1 rounded whitespace-nowrap"
                :class="{ 'opacity-0': !isDragging || dragHandle !== 'start' }">
                {{ formatTimecode(start) }}
            </div>
        </div>

        <!-- Right handle -->
        <div class="absolute right-0 h-full w-2 cursor-ew-resize bg-blue-500 opacity-75 hover:opacity-100"
            @mousedown.stop="startDragging('end')">
            <div class="absolute bottom-full right-0 mb-1 bg-black text-white text-xs p-1 rounded whitespace-nowrap"
                :class="{ 'opacity-0': !isDragging || dragHandle !== 'end' }">
                {{ formatTimecode(end) }}
            </div>
        </div>

        <!-- Region label and remove button -->
        <div
            class="absolute -top-6 right-0 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span class="text-xs text-gray-600">
                {{ formatTimecode(end - start) }}
            </span>
            <button @click="$emit('remove')"
                class="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition-colors">
                Remove
            </button>
        </div>
    </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'

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
    setup(props) {
        const store = useStore()
        const isDragging = ref(false)
        const dragHandle = ref(null)

        const duration = computed(() => store.state.duration)

        const startDragging = (handle) => {
            isDragging.value = true
            dragHandle.value = handle
            store.commit('SET_IS_DRAGGING', true)
        }

        const formatTimecode = (time) => {
            const hours = Math.floor(time / 3600)
            const minutes = Math.floor((time % 3600) / 60)
            const seconds = Math.floor(time % 60)
            const frames = Math.floor((time % 1) * 30)

            return `${hours.toString().padStart(2, '0')}:${minutes
                .toString().padStart(2, '0')}:${seconds
                    .toString().padStart(2, '0')}:${frames
                        .toString().padStart(2, '0')}`
        }

        return {
            isDragging,
            dragHandle,
            duration,
            startDragging,
            formatTimecode
        }
    }
}
</script>