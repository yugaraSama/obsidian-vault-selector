const { contextBridge, ipcRenderer } = require('electron');

// Expose a method to get vaults
contextBridge.exposeInMainWorld('myApi', {
    getVaults: () => ipcRenderer.invoke('get-vaults')
});