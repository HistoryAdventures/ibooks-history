const express = require('express');
const serveStatic = require('serve-static');
const path = require('path');

const app = express();
app.use(serveStatic(path.join(__dirname, './')))
app.use(serveStatic(path.join(__dirname, 'shared')))
app.use(serveStatic(path.join(__dirname, 'documents/_shared')))

app.get('/documents/*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'documents/_shared', 'index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

// eslint-disable-next-line
console.log('server started '+ port);