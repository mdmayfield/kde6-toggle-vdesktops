const TARGET_DESKTOPS = 6;
const oneDtMultiDispState = new Map();
const multDtOneDispState = new Map();
let savedCurrentDesktopIndex = 0;

function saveWindowState(stateMap) {
    stateMap.clear();

    workspace.windowList().forEach(win => {
        console.info(`setting state for ${win.resourceName} ${win.resourceClass}`);
        stateMap.set(win, {
            desktops: [...win.desktops],
            x: win.x,
            y: win.y,
            width: win.width,
            height: win.height
        });
    });
}

function restoreWindowState(stateMap) {
    stateMap.forEach((state, win) => {
        console.info(`restoring ${win.resourceName} ${win.resourceClass}`);
        if (workspace.windowList().includes(win)) {
            console.info(`Would restore desktops ${JSON.stringify(state.desktops)}`);
            // win.desktops = state.desktops;
            // win.x = state.x;
            // win.y = state.y;
            // win.width = state.width;
            // win.height = state.height;
        } else {
            console.info('NOT IN WORKSPACE');
        }
    });
}

function toggleDesktops() {
    const current = workspace.desktops.length;

    if (current === 1) {
        console.info('Switching 1->6');
        // saveWindowState(oneDtMultiDispState);
        for (let i = current; i < TARGET_DESKTOPS; i++) {
            workspace.createDesktop(i, `Desktop ${i + 1}`);
        }
        console.info('boop');
        workspace.desktopGridHeight = 2;
        console.info('boop');
        console.info('Map size:', multDtOneDispState.size);
        multDtOneDispState.forEach((state, win) => {
            console.info(`Key: ${win.resourceName}, State:`, state);
        });
        console.info('boop');

        restoreWindowState(multDtOneDispState);
        console.info('trying to go to desktop index ' + savedCurrentDesktopIndex + `of length ${workspace.desktops.length}`);
        if (workspace.desktops.length > savedCurrentDesktopIndex &&
            savedCurrentDesktopIndex >= 0
        ) {
            const targetDesktop = workspace.desktops[savedCurrentDesktopIndex];
            console.info(`targetDesktop ${JSON.stringify(targetDesktop)}`);
            console.info(`currentDesktop before ${JSON.stringify(workspace.currentDesktop)}`);
            workspace.currentDesktop = targetDesktop;
            console.info(`currentDesktop after ${JSON.stringify(workspace.currentDesktop)}`);
        }
    } else {
        console.info('Switching 6->1');
        savedCurrentDesktopIndex = workspace.desktops.findIndex((desktop) => {
            return desktop.id === workspace.currentDesktop.id
        });
        console.info(`savedCurrentDesktopIndex ${savedCurrentDesktopIndex}`);
        saveWindowState(multDtOneDispState);
        console.info('Map size:', multDtOneDispState.size);
        multDtOneDispState.forEach((state, win) => {
            console.info(`Key: ${win.resourceName}, State:`, state);
        });
        for (let i = current - 1; i >= 1; i--) {
            workspace.removeDesktop(workspace.desktops[i]);
        }
        // restoreWindowState(oneDtMultiDispState);
    }
}

registerShortcut(
    "toggle-desktops",
    "Toggle Virtual Desktops (1 ↔ 6)",
    "Meta+Ctrl+D",
    toggleDesktops
);
