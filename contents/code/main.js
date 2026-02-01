const TARGET_DESKTOPS = 6;
const oneDtMultiDispState = new Map();
const multDtOneDispState = new Map();
let savedCurrentDesktopIndex = 0;

function saveWindowState(stateMap) {
    stateMap.clear();

    workspace.windowList().forEach(win => {
        console.info(`setting state for ${win.resourceName} ${win.resourceClass}`);
        stateMap.set(win, {
            desktops: [...win.desktops.map((winDesktop) => {
                return workspace.desktops.findIndex((desktop) => {
                    return desktop.id === winDesktop.id;
                });
            })],
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
            const targetDesktops = state.desktops.map((savedDesktopIndex) => {
                console.info(`in map index ${savedDesktopIndex}`);
                if (workspace.desktops.length > savedDesktopIndex &&
                    savedDesktopIndex >= 0
                ) { return workspace.desktops[savedDesktopIndex]; } else {
                    return -1;
                }
            }).filter(i => i !== -1);
            console.info(`targetDesktops ${JSON.stringify(targetDesktops)}`);
            if (targetDesktops.length > 0) {
                console.info(`setting win.desktops to targetDesktops`);
                win.desktops = targetDesktops;
            }
            // OMG KWin is not well documented for this
            // had to dig a long time, found https://discuss.kde.org/t/kwin-script-window-framegeometry-seems-to-be-readonly-even-if-the-docs-states-otherwise/17175

            // make a clone of the existing geometry
            const targetFrameGeometry = Object.assign({}, win.frameGeometry);
            // mutate it
            targetFrameGeometry.x = state.x;
            targetFrameGeometry.y = state.y;
            targetFrameGeometry.width = state.width;
            targetFrameGeometry.height = state.height;
            // ONLY NOW can we update the window's sizing/pos without silently failing
            win.frameGeometry = targetFrameGeometry;
        } else {
            console.info('NOT IN WORKSPACE');
        }
    });
}

function toggleDesktops() {
    const current = workspace.desktops.length;

    if (current === 1) {
        console.info('Switching 1->6');
        saveWindowState(oneDtMultiDispState);
        for (let i = current; i < TARGET_DESKTOPS; i++) {
            workspace.createDesktop(i, `Desktop ${i + 1}`);
        }
        workspace.desktopGridHeight = 2;
        console.info('Map size:', multDtOneDispState.size);
        multDtOneDispState.forEach((state, win) => {
            console.info(`Key: ${win.resourceName}, State:`, JSON.stringify(state));
        });

        restoreWindowState(multDtOneDispState);
        console.info('trying to go to desktop index ' + savedCurrentDesktopIndex + `of length ${workspace.desktops.length}`);
        if (workspace.desktops.length > savedCurrentDesktopIndex &&
            savedCurrentDesktopIndex >= 0
        ) {
            workspace.currentDesktop = workspace.desktops[savedCurrentDesktopIndex];
        }
    } else {
        console.info('Switching 6->1');
        savedCurrentDesktopIndex = workspace.desktops.findIndex((desktop) => {
            return desktop.id === workspace.currentDesktop.id;
        });
        console.info(`savedCurrentDesktopIndex ${savedCurrentDesktopIndex}`);
        saveWindowState(multDtOneDispState);
        console.info('Map size:', multDtOneDispState.size);
        multDtOneDispState.forEach((state, win) => {
            console.info(`Key: ${win.resourceName}, State:`, JSON.stringify(state));
        });
        for (let i = current - 1; i >= 1; i--) {
            workspace.removeDesktop(workspace.desktops[i]);
        }
        restoreWindowState(oneDtMultiDispState);
    }
}

registerShortcut(
    "toggle-desktops",
    "Toggle Virtual Desktops (1 ↔ 6)",
    "Meta+Ctrl+D",
    toggleDesktops
);
