/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

const fs = require('fs');

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on('task', {
    downloads:  (downloadsPath) => {
      return fs.readdirSync(downloadsPath);
    },
    deleteDownloads: (input) => {
      const downloadsPath = input.downloadsPath;
      const fileSep = input.fileSep;
      fs.readdirSync(downloadsPath).forEach((f) => {
        if(f != '.gitignore') {
          fs.rmSync(downloadsPath + fileSep + f);
        };
      });
      return null;
    }
  });
}
