exports.$ = (id) => {
    return document.getElementById(id)
}

exports.convertDuration = (time) => {
    // 分钟采用整除向下取整,秒数采用求余数向下取整
    const minutes = Math.floor(time / 60).toString().padStart(2, '0')
    const seconds = Math.floor(time % 60).toString().padStart(2, '0')
    return minutes + ':' + seconds
}