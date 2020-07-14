### Adding new document to the list - example: arun:

* remove `/css /img /js` folders and `index.html` - they are same everywhere and added in `./build` command
* create `_themes/arun.scss` by copying any other `_themes/*.scss` file and update new colors
* add entry in _webpack.config.js_: `'documents/arun': './documents/arun/index.js'`,


### Adding more tooltips 
Right now there is only 5 numeric svg tooltips. There is comments in `_config.scss` how to add more
