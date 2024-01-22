const path = require('path');
const { readdir, readFile, stat } = require('fs/promises');
const fs = require('fs');

const DIST_BUNDLE = path.join(__dirname, 'project-dist', 'bundle.css');
const COPY_CSS = path.join(__dirname, 'styles');

function bundle(filePath, fromDir) {
  fs.writeFile(filePath, '', () => {});
  readdir(fromDir, { withFileTypes: true }).then((files) => {
    files.forEach((file) => {
      stat(path.join(fromDir, file.name)).then((stats) => {
        if (path.extname(file.name) == '.css' && stats.isFile()) {
          readFile(path.join(fromDir, file.name), { encoding: 'utf-8' }).then(
            (fileContent) => {
              fs.appendFile(filePath, fileContent, 'utf-8', () => {});
              fs.appendFile(filePath, '\n', 'utf-8', () => {});
            },
          );
        }
      });
    });
  });
}

bundle(DIST_BUNDLE, COPY_CSS);

module.exports = {
  bundle,
};
