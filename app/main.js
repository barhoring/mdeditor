const { app, BrowserWindow, dialog } = require("electron");
const fs = require("fs");

const windows = new Set();

const createWindow = (exports.createWindow = () => {
  let newWindow = new BrowserWindow({ show: false });

  // set function to check edited state of each open window
  let edited = false;
  newWindow.setEdited = val => (edited = val);
  newWindow.isEdited = () => edited;

  windows.add(newWindow);
  newWindow.loadURL(`file://${__dirname}/index.html`);

  newWindow.once("ready-to-show", () => {
    newWindow.show();
  });

  newWindow.on("close", event => {
    if (newWindow.isEdited()) {
      event.preventDefault();
      const result = dialog.showMessageBox(newWindow, {
        type: "warning",
        title: "Quit With Unsaved Changes?",
        message: "Your changes will be lost if you don't save first",
        buttons: ["Quit Anyway", "Cancel"],
        defaultId: 0,
        cancelId: 1
      });

      if (result === 0) newWindow.destroy();
    }
  });

  newWindow.on("closed", () => {
    windows.delete(newWindow);
    newWindow = null;
  });
});

const getFileFromUserSelection = (exports.getFileFromUserSelection = targetWindow => {
  const files = dialog.showOpenDialog(targetWindow, {
    properties: ["openFile"],
    filters: [
      { name: "Text Files", extensions: ["txt", "text"] },
      { name: "Markdown Files", extensions: ["md", "markdown"] }
    ]
  });

  if (!files) return;

  return files[0];
});

const openFile = (exports.openFile = (targetWindow, filePath) => {
  const file = filePath || getFileFromUserSelection(targetWindow);
  const content = fs.readFileSync(file).toString();
  targetWindow.webContents.send("file-opened", file, content);
  targetWindow.setTitle(`${file} - Fire Sale`);
});

app.on("ready", () => {
  createWindow();
});
