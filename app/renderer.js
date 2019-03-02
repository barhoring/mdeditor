const marked = require("marked");
const { remote, ipcRenderer } = require("electron");
const mainProcess = remote.require("./main.js");
const currentWindow = remote.getCurrentWindow();

let filePath = null;
let originalContent = "";

const markdownView = document.querySelector("#markdown");
const htmlView = document.querySelector("#html");
const newFileButton = document.querySelector("#new-file");
const openFileButton = document.querySelector("#open-file");
const saveMarkdownButton = document.querySelector("#save-markdown");
const revertButton = document.querySelector("#revert");
const saveHtmlButton = document.querySelector("#save-html");

const renderMarkdownToHtml = markdown => {
  htmlView.innerHTML = marked(markdown, { sanitize: true });
};

const updateEditedState = isEdited => {
  currentWindow.setEdited(isEdited);

  let title = "Fire Sale";
  if (filePath) title = `${filePath} - FireSale`;
  if (isEdited) title = `${title} - (Edited)`;

  currentWindow.setTitle(title);
};

markdownView.addEventListener("keyup", event => {
  const currentContent = event.target.value;
  renderMarkdownToHtml(currentContent);
  updateEditedState(currentContent !== originalContent);
  // currentWindow.setEdited(currentContent !== originalContent);
});

openFileButton.addEventListener("click", () => {
  mainProcess.openFile(currentWindow);
});

newFileButton.addEventListener("click", () => {
  mainProcess.createWindow();
});

ipcRenderer.on("file-opened", (event, file, content) => {
  filePath = file;
  originalContent = content;

  markdownView.value = content;
  renderMarkdownToHtml(content);

  // when opening new  file set the edited to false
  updateEditedState(false);
});
