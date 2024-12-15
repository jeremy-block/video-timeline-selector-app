// :::artifact{identifier="store" type="text/javascript" title="src/store/index.js"}
import { createStore } from 'vuex'

export default createStore({
  state: {
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    selectedFile: null,
    videoUrl: '',
    regions: [],
    isDragging: false,
    isHovering: false,
    hoverTime: 0
  },
  mutations: {
    SET_CURRENT_TIME(state, time) {
      state.currentTime = time
    },
    SET_DURATION(state, duration) {
      state.duration = duration
    },
    SET_PLAYING(state, isPlaying) {
      state.isPlaying = isPlaying
    },
    SET_VIDEO_FILE(state, { file, url }) {
      state.selectedFile = file
      state.videoUrl = url
    },
    ADD_REGION(state, region) {
      state.regions.push(region)
    },
    UPDATE_REGION(state, { index, region }) {
      state.regions[index] = region
    },
    REMOVE_REGION(state, index) {
      state.regions.splice(index, 1)
    },
    SET_IS_DRAGGING(state, isDragging) {
      state.isDragging = isDragging
    },
    SET_HOVER_TIME(state, time) {
      state.hoverTime = time
    },
    SET_IS_HOVERING(state, isHovering) {
      state.isHovering = isHovering
    }
  },
  actions: {
    updateCurrentTime({ commit }, time) {
      commit('SET_CURRENT_TIME', time)
    },
    togglePlayback({ commit, state }) {
      commit('SET_PLAYING', !state.isPlaying)
    },
    addRegion({ commit }, region) {
      commit('ADD_REGION', region)
    }
  }
})