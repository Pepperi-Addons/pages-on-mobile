const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const mf = require("@angular-architects/module-federation/webpack");
const path = require("path");
const share = mf.share;

const sharedMappings = new mf.SharedMappings();
sharedMappings.register(
    path.join(__dirname, './tsconfig.json'),
    [
        /* mapped paths to share */
    ]);

module.exports = {
    output: {
        uniqueName: "addon",
        publicPath: "http://localhost:4400/",
    },
    optimization: {
        // Only needed to bypass a temporary bug
        runtimeChunk: false
    },   
    resolve: {
        alias: {
        ...sharedMappings.getAliases(),
        }
    },
    plugins: [
        new ModuleFederationPlugin({
            remotes: { },
            shared: share({
                "@angular/core": { eager: true, singleton: true, strictVersion: true, requiredVersion: 'auto' },
                "@angular/common": { eager: true, singleton: true, strictVersion: true, requiredVersion: 'auto' }, 
                "@angular/common/http": { eager: true, singleton: true, strictVersion: true, requiredVersion: 'auto' }, 
                "@angular/router": { eager: true, singleton: true, strictVersion: true, requiredVersion: 'auto' },
                
                ...sharedMappings.getDescriptors()
            })
        }),
        sharedMappings.getPlugin()
    ],
};