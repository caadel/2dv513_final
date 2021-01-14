const MySQL = require('mysql')
const Controller = {}

let databaseName = process.argv.slice(2, 3) + ''

if (databaseName.length < 1) databaseName = 'webadmin'

const connection = MySQL.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root'
})

// Init
;(function () {
  try {
    connection.connect((err) => {
      if (err) throw err

      connection.query(`CREATE DATABASE IF NOT EXISTS ${databaseName}`, (err, result) => {
        if (err) throw err
        console.log(`Connected to database '${databaseName}'`)
      })
    })
  } catch (error) {
    console.log('MySQL error, could not create connection!')
    process.exit()
  }

  connection.changeUser({ user: 'root', database: databaseName }, (err, result) => {
    if (err) throw err
  })

  createTables()
})()

function createTables() {
  let initAlbums = `CREATE TABLE IF NOT EXISTS albums (
    id INT NOT NULL AUTO_INCREMENT, 
    price INT NOT NULL, 
    in_stock BOOL NOT NULL, 
    name VARCHAR(255) NOT NULL, 
    artist VARCHAR(255) NOT NULL, 
    release_date DATE NOT NULL,
    PRIMARY KEY (id)
    )`

  let initSongs = `CREATE TABLE IF NOT EXISTS songs (
    id INT NOT NULL AUTO_INCREMENT,
    album_id INT, 
    title VARCHAR(255) NOT NULL, 
    length INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (album_id) REFERENCES albums(id)
    )`

  let initUsers = `CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT, 
    name VARCHAR(255) NOT NULL, 
    password VARCHAR(255) NOT NULL, 
    email VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
    )`

  let initOrders = `CREATE TABLE IF NOT EXISTS orders (
    id INT NOT NULL,
    user_id INT, 
    album_id INT, 
    order_date DATETIME NOT NULL, 
    ship_status VARCHAR(255) NOT NULL, 
    payed_status BOOL NOT NULL, 
    quantity INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (album_id) REFERENCES albums(id)
    )`

  connection.query(initAlbums, (err, result) => {
    if (err) throw err
  })

  connection.query(initSongs, (err, result) => {
    if (err) throw err
  })

  connection.query(initUsers, (err, result) => {
    if (err) throw err
  })

  connection.query(initOrders, (err, result) => {
    if (err) throw err
  })

  // insertData()
}

Controller.listUsers = (req, res) => {
  res.render('list', {
    title: 'Listings',
    users: 'data'
  })
}

Controller.listAlbums = (req, res) => {
  res.render('list', {
    title: 'Listings',
    albums: 'data'
  })
}

Controller.listOrders = (req, res) => {
  res.render('list', {
    title: 'Listings',
    orders: 'data'
  })
}

Controller.listSongs = (req, res) => {
  res.render('list', {
    title: 'Listings',
    songs: 'data'
  })
}

Controller.renderIndex = (req, res) => {
  res.render('index', {
    title: 'Index'
  })
}

Controller.renderCreateAlbum = (req, res) => {
  res.render('create', {
    title: 'Add new Album',
    album: true
  })
}

Controller.renderCreateSong = (req, res) => {
  res.render('create', {
    title: 'Add new Song',
    song: true
  })
}

Controller.renderUpdate = (req, res) => {
  // TODO
}

Controller.updateRow = (req, res) => {
  // TODO
}

Controller.createSong = (req, res) => {
  // check for duplicate first
  const duplicateCheck = `SELECT COUNT(title) as count FROM songs WHERE album_id = "${req.body.album_id}" AND title = "${req.body.title}"`
  connection.query(duplicateCheck, (err, result) => {
    if (err) {
      console.log(err)
      return
    } else if (result[0].count > 0) {
      res.render('create', {
        title: 'Add new Song',
        status: 'Song already exists!',
        song: true,
        error: true
      })
    } else {
      // if no dupe, insert new song
      const query = `INSERT INTO songs (album_id, title, length) VALUES (${req.body.album_id}, "${req.body.title}", ${req.body.length})`
      connection.query(query, (err, result) => {
        if (err) {
          console.log(err)
          res.render('create', {
            title: 'Add new Song',
            status: 'Incorrect album id!',
            song: true,
            error: true
          })
        } else {
          res.render('create', {
            title: 'Add new Song',
            status: 'Song added!',
            song: true
          })
        }
      })
    }
  })
}

Controller.createAlbum = (req, res) => {
  let stock
  req.body.in_stock ? (stock = 1) : (stock = 0)
  // check for duplicate first
  const duplicateCheck = `SELECT COUNT(name) as count FROM albums WHERE name = "${req.body.name}" AND artist = "${req.body.artist}"`
  connection.query(duplicateCheck, (err, result) => {
    if (err) {
      console.log(err)
      return
    } else if (result[0].count > 0) {
      res.render('create', {
        title: 'Add new Album',
        status: 'Album already exists!',
        album: true,
        error: true
      })
    } else {
      // if no dupe, insert new album
      const query = `INSERT INTO albums (price, in_stock, name, artist, release_date) VALUES (${req.body.price}, ${stock}, "${req.body.name}", "${req.body.artist}", "${req.body.date}")`
      connection.query(query, (err, result) => {
        if (err) {
          console.log(err)
          res.render('create', {
            title: 'Add new Album',
            status: 'An error occured',
            album: true,
            error: 'An error occured!'
          })
        } else {
          res.render('create', {
            title: 'Add new Album',
            status: 'Album added!',
            album: true
          })
        }
      })
    }
  })
}

function insertData() {}

module.exports = Controller
