const { ipcRenderer } = require('electron')
const path = require('path')
const { $ } = require('./helper')

let musicFiles = []

$('chooseFile').addEventListener('click', () => {
    ipcRenderer.send('chooseMusicWindow')
})

$('inputFile').addEventListener('click', () => {
    ipcRenderer.send('inputMusicFile', musicFiles)
})

const rendererList = (filesPaths) => {
    const musicList = $('musicList')
    const musicListItems = filesPaths.reduce((html, music) => {
        html += `<li class="list-group-item">${path.basename(music)}</li>`
        return html
    }, '')

    musicList.innerHTML = `<ul class="list-group list-group-flush">${musicListItems}</ul>`
}

ipcRenderer.on('choosedFiles', (event, filesPaths) => {
    if (Array.isArray(filesPaths)) {
        rendererList(filesPaths)
        musicFiles = filesPaths
    }
})