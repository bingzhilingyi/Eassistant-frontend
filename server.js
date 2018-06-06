'use strict';

const Koa = require('koa'),
    serve = require('koa-static'),
    path = require('path');

const app = new Koa();

app.use(serve(__dirname));

app.listen(8888);
console.log('Server is running at http://127.0.0.1:8888/');