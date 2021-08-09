### Run these commands to run project under localhost:3000
`npm install`
`npm run dev`

### Run this commands to build and zip project files
`npm run build && ./build`

After each push to master branch changes are deployed here
https://ibooks-scene.herokuapp.com/


### To add new section and add new panorama

- For new section copy commented tables in `index.html` and `index-prod.html`
- For new panorama just copy table row content `<tr>`
- Name each row with panorama name and update links `scene-opium` to `scene-newpanorama`
- Copy whole `scene-opium` folder and rename it to `scene-newpanorama`
- Inside `scene-newpanorama/index.html` update `<title>` content with new panorama name.
- Inside `webpack.config.js` duplicate line `'scene-opium': './scene-opium/index.js',` and rename `opium` with new panorama name like `'scene-newpanorama': './scene-newpanorama/index.js',`. After this you should be able to visit this panorama in development mode `npm run dev` and visit `http://0.0.0.0:3000/scene-newpanorama/`
- Update `build` file where is `# creates all scenes` at next line end add `"scene-newpanorama"`. After this next deploy will upload new scene to prod server
