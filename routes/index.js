const Express = require('express')
const Router = Express.Router()
const Controller = require('../controllers/controller.js')

Router.get('/', Controller.renderIndex)

Router.get('/users', Controller.listUsers)

Router.get('/albums', Controller.listAlbums)
Router.get('/albums/:id', Controller.renderCreateAlbum)
Router.post('/albums', Controller.handleAlbumsPost)
Router.post('/albums/:id', Controller.updateAlbum)

Router.get('/orders', Controller.listOrders)
Router.post('/orders', Controller.handleOrdersPost)

Router.get('/songs', Controller.listSongs)
Router.get('/songs/:id', Controller.renderCreateSong)
Router.post('/songs', Controller.handleSongsPost)
Router.post('/songs/:id', Controller.updateSong)

Router.get('/add/album', Controller.renderCreateAlbum)
Router.post('/add/album', Controller.createAlbum)
Router.get('/add/song', Controller.renderCreateSong)
Router.post('/add/song', Controller.createSong)

Router.get('/update/:id', Controller.renderUpdate)
Router.post('/update/:id', Controller.updateRow)

module.exports = Router
