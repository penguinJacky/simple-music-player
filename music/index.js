const { ipcRenderer } = require('electron')
const { $, convertDuration } = require('./helper')

let musicAudio = new Audio()
let allMusic
let currentMusic

$('openFile').addEventListener('click', () => {
    ipcRenderer.send('addMusicWindow')
})

const rendererMusicList = (musics) => {
    const musicList = $('musicList')
    const musicListHtml = musics.reduce((html, music) => {
        html += `<li class="row list-group-item d-flex justify-content-between align-items-center">
            <div class="col-10">
                <img src="../node_modules/bootstrap-icons/icons/file-earmark-music.svg">
                <b class="px-2">${music.fileName}</b>
            </div>
            <div class="col-2">
                <img data-id="${music.id}" id="playId" class="playCircle" src="../node_modules/bootstrap-icons/icons/play-circle.svg">
                <img data-id="${music.id}" class="Trash ms-4" src="../node_modules/bootstrap-icons/icons/trash.svg">
            </div>
        </li>`
        return html
    }, '')
    const emptyMusicListHtml = `<div class="alert alert-dark">您未添加任何音乐</div>`
    musicList.innerHTML = musics.length ? `<ul class="list-group">${musicListHtml}</ul>` : emptyMusicListHtml
}

ipcRenderer.on('getChoosedMusic', (event, music) => {
    allMusic = music
    rendererMusicList(music)
})

$('musicList').addEventListener('click', (event) => {
    event.preventDefault()
    let srcForStop = "../node_modules/bootstrap-icons/icons/stop-circle.svg"
    let srcForPlay = "../node_modules/bootstrap-icons/icons/play-circle.svg"
    const { dataset, classList } = event.target
    const id = dataset && dataset.id
    if (id && classList.contains('playCircle')) {
        if (currentMusic && currentMusic.id == id) {
            musicAudio.play()
        } else {
            currentMusic = allMusic.find(track => track.id === id)
            musicAudio.src = currentMusic.path
            musicAudio.play()
            const resetIcon = document.querySelectorAll('.stopCircle')
            for (let i = 0; i < resetIcon.length; i++) {
                resetIcon[i].src = srcForPlay
            }
        }
        classList.replace('playCircle', 'stopCircle')
        event.target.src = srcForStop
    } else if (id && classList.contains('stopCircle')) {
        musicAudio.pause()
        classList.replace('stopCircle', 'playCircle')
        event.target.src = srcForPlay
    } else if (id && classList.contains('Trash')) {
        musicAudio.pause()
        ipcRenderer.send('deleteMusic', id)
    }
})

const rendererPlayer = (name, duration) => {
    const player = $('musicStatus')
    const html = `<div class="col-8 font-weight-bold">
      正在播放: ${name}
    </div>
    <div class="col-4">
      <span id="currentSeek">00:00</span> / ${convertDuration(duration)}
    </div>
    `
    player.innerHTML = html
}

const updateProgress = (currentTime, duration) => {
    const progress = Math.floor(currentTime / duration * 100)
    const progressBar = $('musicPlayerProgress')
    progressBar.innerHTML = progress + '%'
    progressBar.style.width = progress + '%'
    const currentProgress = $('currentSeek')
    currentProgress.innerHTML = convertDuration(currentTime)
}

musicAudio.addEventListener('loadedmetadata', () => {
    rendererPlayer(currentMusic.fileName, musicAudio.duration)
})

musicAudio.addEventListener('timeupdate', () => {
    updateProgress(musicAudio.currentTime, musicAudio.duration)
})