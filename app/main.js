const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { xml2js, js2xml } = require("xml-js")
if (require('electron-squirrel-startup')) {
    app.quit();
}
const IS_DEV = process.env.IS_DEV === 'true';
let win = null
function createWindow() {
    win = new BrowserWindow({
        width: 400,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

    if (IS_DEV) {
        win.loadURL('http://localhost:3000');
        win.webContents.openDevTools();
    } else {
        // mainWindow.removeMenu();
        win.loadFile(path.join(__dirname, 'build', 'index.html'));
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
let lastPath = null
let opening = false
ipcMain.on("OpenFile", async (event) => {
    if (opening) { return }
    opening = true
    try {
        const data = await dialog.showOpenDialog({
            title: "Select your mod_config.xml",
            filters: { extensions: [".xml"], name: "XML" },//broken? too lazy to figure it out
        })
        opening = false
        const filePath = data.filePaths.shift()
        if (!data.canceled && filePath) {
            lastPath = filePath
            const fileData = fs.readFileSync(path.resolve(filePath), "utf-8")
            const xml = xml2js(fileData)
            if (typeof xml.elements[0].name !== "undefined" && xml?.elements[0]?.name === "Mods") {
                event.reply("mods", xml.elements[0].elements)
            }
            else {
                throw new Error("Yeehaw")
            }
        }

    } catch (error) {
        //boo 👻👻👻👻👻
        dialog.showErrorBox("Failed to load", "dunno dude")
    }
})

ipcMain.on("SaveFile", (event, data) => {
    try {
        const xml = {
            elements: [
                {
                    type: "element",
                    name: "Mods",
                    elements: data
                }
            ]
        }
        fs.writeFileSync(lastPath, js2xml(xml), "utf-8")
        dialog.showMessageBox(null, { type: "info", message: "Saved succesfully, if the game is open click the refresh button." })
    } catch (error) {
        console.error(error)
        dialog.showErrorBox("Failed to save", "dunno dude")
        //boo 👻👻👻👻👻
    }
})