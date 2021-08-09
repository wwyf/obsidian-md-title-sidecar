import './styles/folder-count.css';

import FileExplorerNoteCount from 'main';
import {
    AbstractFileFilter,
    getParentPath,
    isFolder,
    isParent,
    iterateItems,
    withSubfolderClass,
} from 'misc';
import { AFItem, FolderItem, FileItem, TFolder, TFile, Vault } from 'obsidian';

export const setupTitle = (plugin: FileExplorerNoteCount, vault: Vault, revert = false) => {
    if (!plugin.fileExplorer) throw new Error('fileExplorer not found');

    iterateItems(plugin.fileExplorer.fileItems, (item: AFItem) => {
        if (!isFolder(item)) {
            setTitle(item, vault);
        }
    });
};

export const setTitle = (item: FileItem, vault: Vault) => {
    vault.read(item.file).then(function (val) {
        const regex = /# (.+)\s*/;
        const match = regex.exec(val);
        if (match != null) {
            const name = match[1];
            item.titleEl.dataset['name'] = name;
        } else {
            item.titleEl.dataset['name'] = undefined;
        }
    }).catch(error => {
        console.log(`Error retrieving content of ${item.file}: ${error}`)
    });
}

export const updateTitle = (
    targetList: string[], 
    plugin: FileExplorerNoteCount, 
    vault: Vault
) => {
    const { fileExplorer } = plugin;
    if (!fileExplorer) {
        console.error('fileExplorer missing');
        return;
    }
    for (const path of targetList) {
        // check if path available
        if (!fileExplorer.fileItems[path]) continue;
        setTitle(fileExplorer.fileItems[path] as FileItem, vault);
    }
};

const removeTitle = (item: FileItem) => {
    if (item.titleEl.dataset['name']) delete item.titleEl.dataset['name'];
    item.titleEl.removeClass(withSubfolderClass);
};