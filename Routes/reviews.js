const Routes = require('express').Router();


Routes.get('/', (req, res) => {
    res.send(200)
});
Routes.get('/:id', (req, res) => {
    res.send(200)
});
Routes.post('', (req, res) => {
    res.send(200)
});
Routes.put('/:id', (req, res) => {
    res.send(200)
});
Routes.delete('/:id', (req, res) => {
    res.send(200)
});


module.exports = Routes;