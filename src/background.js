'use strict'

import { app, protocol, ipcMain, BrowserWindow, shell, globalShortcut } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

var fs = require('fs-extra');

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true } }
])

let win = null;
async function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        frame: false,
        width: 1200,
        height: 600,
        minWidth: 500,
        minHeight: 500,
        webPreferences: {
            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
            webSecurity: false,
            devTools: true
        }
    })

    ipcMain.on("min", () => {
        win.minimize();
    });

    ipcMain.on("max", () => {
        if (win.isMaximized())
            win.restore();
        else
            win.maximize();
    });

    ipcMain.on("close", () => {
        win.close();
    });

    ipcMain.on("ensure-folder", (event, dir) => {
        fs.ensureDir(dir).then(() => {
            event.reply('ensure-folder-callback', 200);
        });
    });

    ipcMain.on("ensure-file", (event, dir) => {
        fs.ensureDir(dir).then(() => {
            event.reply('ensure-file-callback', 200);
        });
    });

    ipcMain.on("read-file", (event, obj) => {
        fs.readFile(obj.path, 'utf8', (err, data) => {
            if (err) return console.error(err)
            event.reply(`read-file-${obj.id}`, data);
        });
    });

    ipcMain.on("output-file", (event, obj) => {
        fs.outputFile(obj.path, obj.data).then(() => {
            event.reply('output-file-callback', 200);
        });
    });

    ipcMain.on("remove-file", (event, path) => {
        fs.unlink(path, (err) => {
            if (err) return console.error(err)
            event.reply('remove-file-callback', 200);
        });
    });

    ipcMain.on("remove-folder", (event, path) => {
        fs.rmdir(path, { recursive: true }, (err) => {
            if (err) return console.error(err)
            event.reply('remove-folder-callback', 200);
        });
    });

    ipcMain.on("copy-file", (event, obj) => {
        fs.copy(obj.src, obj.tgt, err => {
            if (err) return console.error(err)
            event.reply('copy-file-callback', 200);
        });
    });

    ipcMain.on("open-file", (event, path) => {
        fs.access(path, err => {
            // fix: 修复中文路径不能打开的问题
            shell.openPath(path)
            event.reply('open-file-callback', err);
        });
    });

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
        if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
        createProtocol('app')
        // Load the index.html when not in development
        win.loadURL('app://./index.html')
    }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        try {
            await installExtension(VUEJS_DEVTOOLS)
        } catch (e) {
            console.error('Vue Devtools failed to install:', e.toString())
        }
    }
    createWindow()

    // 注册 devtools 用以生产环境的下的异常调试
    globalShortcut.register('CommandOrControl+Shift+L', () => {
        let focusWin = BrowserWindow.getFocusedWindow()
        focusWin && focusWin.toggleDevTools()
    })
})

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', () => {
        // 当运行第二个实例时,将会聚焦到mainWindow这个窗口
        if (win) {
            if (win.isMinimized()) win.restore()
            win.focus()
            win.show()
        }
    })
    // 创建 myWindow, 加载应用的其余部分, etc...
    // app.on('ready', () => {
    // })
}

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
            if (data === 'graceful-exit') {
                app.quit()
            }
        })
    } else {
        process.on('SIGTERM', () => {
            app.quit()
        })
    }
}
