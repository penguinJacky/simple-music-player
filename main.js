const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const DataStore = require('./music/musicDataStore')

const myStore = new DataStore({ 'name': 'Music Data' })

class AppWindow extends BrowserWindow {

    constructor(config, fileLocation) {

        const baseConfig = {
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        }

        const finalConfig = {...baseConfig, ...config }

        super(finalConfig)
        this.loadFile(fileLocation)
        this.setBackgroundColor('#2e2c29')
    }
}

app.on('ready', () => {

    const mainWindow = new AppWindow({}, './music/index.html')

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.send('getChoosedMusic', myStore.getTracks())
    })

    ipcMain.on('addMusicWindow', () => {
        const addWindow = new AppWindow({
            width: 500,
            height: 500,
            parent: mainWindow
        }, './music/add.html')
    })

    ipcMain.on('chooseMusicWindow', (event) => {
        dialog.showOpenDialog({
            properties: ['openFile', 'multiSelections'],
            filters: [{ name: 'Music', extensions: ['mp3', 'flac'] }]
        }).then(files => {
            if (files.filePaths) {
                event.sender.send('choosedFiles', files.filePaths)
            }
        })
    })

    ipcMain.on('inputMusicFile', (event, tracks) => {
        const updateTracks = myStore.addTracks(tracks).getTracks()
        mainWindow.send('getChoosedMusic', updateTracks)
    })

    ipcMain.on('deleteMusic', (event, id) => {
        const updateTracks = myStore.deleteTracks(id).getTracks()
        mainWindow.send('getChoosedMusic', updateTracks)
    })
})