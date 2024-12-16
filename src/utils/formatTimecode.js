// utils/formatTimecode.js
export function formatTimecode(time) {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)
    const frames = Math.floor((time % 1) * 30) // Assuming 30fps
    
    let includeHours = hours > 0 ? true : false
    let includeMinutes = minutes > 0 ? true: false
    
    if (includeHours) {
        return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${frames
                .toString()
                .padStart(2, "0")}`;
    } else if (includeMinutes) {
        return `${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${frames
          .toString()
          .padStart(2, "0")}`;
    } else {
        return `${seconds.toString().padStart(2, "0")}:${frames
                .toString()
                .padStart(2, "0")}`;
    }

}
