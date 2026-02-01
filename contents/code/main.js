const TARGET_DESKTOPS = 6;

function toggleDesktops() {
    const current = workspace.desktops.length;

    if (current === 1) {
        for (let i = current; i < TARGET_DESKTOPS; i++) {
            workspace.createDesktop(i, `Desktop ${i + 1}`);
        }
        workspace.desktopGridHeight = 2;
    } else {
        for (let i = current - 1; i >= 1; i--) {
            workspace.removeDesktop(workspace.desktops[i]);
        }
    }
}

registerShortcut(
    "toggle-desktops",
    "Toggle Virtual Desktops (1 ↔ 6)",
    "Meta+Ctrl+D",
    toggleDesktops
);
