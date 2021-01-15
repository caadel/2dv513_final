const Express = require('express')
const Router = Express.Router()
const Controller = require('../controllers/controller.js')

Router.get('/', Controller.renderIndex)

Router.get('/users', Controller.listUsers)
Router.post('/users', Controller.handleUsersPost)

Router.get('/albums', Controller.listAlbums)
Router.post('/albums', Controller.handleAlbumsPost)

Router.get('/orders', Controller.listOrders)
Router.post('/orders', Controller.handleOrdersPost)

Router.get('/songs', Controller.listSongs)
Router.post('/songs', Controller.handleSongsPost)

Router.get('/add/album', Controller.renderCreateAlbum)
Router.post('/add/album', Controller.createAlbum)
Router.get('/add/song', Controller.renderCreateSong)
Router.post('/add/song', Controller.createSong)

Router.get('/update/:id', Controller.renderUpdate)
Router.post('/update/:id', Controller.updateRow)

module.exports = Router
