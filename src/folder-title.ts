import './styles/folder-title.css';

import FileExplorerNoteCount from 'main';
import { isFolder, iterateItems, withSubfolderClass } from 'misc';
import { AFItem, FileItem, parseYaml, Vault } from 'obsidian';

const detectTitle = (content: string) => {
    // First look into YAML Frontmatters
    var return_string = '';
    const yfmMatch = /---[\r\n]+(.+?)[\r\n]+(---|\.\.\.)/s.exec(content);
    if (yfmMatch !== null) {
        const yamlStr = yfmMatch[1];
        const yfm = parseYaml(yamlStr);
        if (yfm.title) {
            return_string = yfm.title;
        }
    }

    // Then look into H1
    const h1Match = /# (.+)\s*/.exec(content);
    if (h1Match != null) {
        return_string = h1Match[1];
    }

    // if (return_string.length > 20) {
    //     return_string = return_string.slice(0, 20) + '...';
    // }

    return return_string;
};

export const setupTitle = (
    plugin: FileExplorerNoteCount,
    vault: Vault,
    revert = false,
) => {
    if (!plugin.fileExplorer) throw new Error('fileExplorer not found');

    iterateItems(plugin.fileExplorer.fileItems, (item: AFItem) => {
        if (!isFolder(item)) {
            setTitle(item, vault);
        }
    });
};

export const setTitle = (item: FileItem, vault: Vault) => {
    if (item.file.extension != 'md') {
        return;
    }

    let isFilenameID = item.file.basename.match(/^[0-9]*$/g)!;
    if (!isFilenameID) {
        return;
    }

    // let idMatch = item.file.basename.match(/([0-9]+|[a-z]+)/g)!;
    // if (idMatch) {
    //     let indentCount = idMatch.length - 1;
    //     let indentStr = (indentCount * 20).toString() + 'px';
    //     // item.titleEl.style.marginLeft = indentStr;
    // }

    vault
        .read(item.file)
        .then(function (content) {
            const contentTitle = detectTitle(content);
            if (contentTitle) {
                // item.titleInnerEl.textContent = "";
                item.titleInnerEl.textContent = item.file.basename;

                // original title (it 's uid)
                // const originalTitle = document.createElement('em');
                // originalTitle.className = 'filename-uid';
                // originalTitle.textContent = item.file.basename;

                const nextLine = document.createElement('br');

                var newTitleDiv = document.createElement('div');
                newTitleDiv.className = 'filename-uid-with-title';
                // newTitleDiv.append(originalTitle);
                // newTitleDiv.append(nextLine);
                newTitleDiv.append(contentTitle);

                // item.titleInnerEl.append(originalTitle);
                item.titleInnerEl.append(newTitleDiv);

                // item.titleInnerEl.prepend(nextLine);
                // item.titleInnerEl.prepend(originalTitle);
            }
        })
        .catch((error) => {
            console.log(
                `Error retrieving content of ${item.file.path}: ${error}`,
            );
        });
};

export const updateTitle = (
    targetList: string[],
    plugin: FileExplorerNoteCount,
    vault: Vault,
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
