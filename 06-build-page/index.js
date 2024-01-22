const path = require('path');
const { mkdir, rm, stat, readdir, readFile } = require('fs/promises');
const fs = require('fs');

const { copyDir } = require('../04-copy-directory');
const { bundle } = require('../05-merge-styles');

const COPY_DIR = path.join(__dirname, 'project-dist');
const DIR = path.join(__dirname);

function replaceTemplateTagText(text, addText, tag) {
  return text.replaceAll(tag, addText);
}

rm(COPY_DIR, { recursive: true, force: true })
  .then(() => mkdir(COPY_DIR))
  .then(() => {
    copyDir(path.join(DIR, 'assets'), path.join(COPY_DIR, 'assets'));
  })
  .then(() => {
    bundle(path.join(COPY_DIR, 'style.css'), path.join(DIR, 'styles'));
  })
  .then(() => {
    return readFile(path.join(DIR, 'template.html'), { encoding: 'utf-8' });
  })
  .then((template) => {
    fs.writeFile(path.join(COPY_DIR, 'index.html'), template, () => {});
    return template;
  })
  .then((template) => {
    readdir(path.join(DIR, 'components'), { withFileTypes: true }).then(
      (files) => {
        const tags = [];
        files.forEach((file) => {
          tags.push(
            new Promise((resolve) => {
              stat(path.join(DIR, 'components', file.name)).then((types) => {
                let tag = '';
                let text = '';
                if (types.isFile() && path.extname(file.name) == '.html') {
                  tag = `${path.basename(file.name, path.extname(file.name))}`;
                  readFile(path.join(DIR, 'components', file.name), {
                    encoding: 'utf-8',
                  }).then((content) => {
                    text = content;
                    return resolve({
                      tag,
                      text,
                    });
                  });
                }
              });
            }),
          );
        });
        Promise.all(tags).then((tagsAndTexts) => {
          tagsAndTexts.forEach((tagAndText) => {
            template = replaceTemplateTagText(
              template,
              tagAndText.text,
              `{{${tagAndText.tag}}}`,
            );
          });
          fs.writeFile(path.join(COPY_DIR, 'index.html'), template, () => {});
        });
      },
    );
  });
