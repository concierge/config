/**
    * Manages the loading and saving of configuration data to a persistent file.
    *
    * Written By:
    *              Matthew Knox
    *
    * License:
    *              MIT License. All code unless otherwise specified is
    *              Copyright (c) Matthew Knox and Contributors 2016.
    */

const path = require('path'),
    fs = require('fs'),
    configFileName = 'config.json';

class ConfigurationService {
    load() {
        global.currentPlatform.config.setInterceptor(this);
    }

    unload() {
        global.currentPlatform.config.setInterceptor(null);
    }

    _pathFromDescriptor(descriptor) {
        if (descriptor === global.currentPlatform.config.getGlobalIndicator()) {
            return global.__runAsLocal ? global.rootPathJoin(configFileName) : path.join(global.__modulesPath, configFileName);
        }
        else {
            if (!descriptor.folderPath) {
                descriptor.folderPath = path.join(global.__modulesPath, descriptor.name);
            }
            return path.join(descriptor.folderPath, configFileName);
        }
    }

    loadConfig(descriptor) {
        const configPath = this._pathFromDescriptor(descriptor);
        try {
            const temp = fs.readFileSync(configPath, 'utf8').replace(/^\uFEFF/, '');
            return JSON.parse(temp);
        }
        catch (e) {
            console.debug($$`No or invalid configuration file found at "${configPath}".`);
            return {};
        }
    }

    saveConfig(descriptor, config) {
        const configPath = this._pathFromDescriptor(descriptor);
        const data = JSON.stringify(config, (key, value) => {
            // deliberate use of undefined, will cause property to be deleted.
            return value === null || typeof value === 'object' && Object.keys(value).length === 0 ? void (0) : value;
        }, 4);
        if (!!data && data !== 'undefined') { // there is data to write
            fs.writeFileSync(configPath, data, 'utf8');
        }
    }
}

module.exports = new ConfigurationService();
