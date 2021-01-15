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

        connection.changeUser({ user: 'root', database: databaseName }, (err, result) => {
          if (err) throw err
          console.log(`Connected to database '${databaseName}'`)
          createTables()
        })
      })
    })
  } catch (error) {
    console.log('MySQL error, could not create connection!')
    process.exit()
  }
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

  // Create all tables one after the other
  connection.query(initAlbums, (err, result) => {
    if (err) throw err
    connection.query(initSongs, (err, result) => {
      if (err) throw err
      connection.query(initUsers, (err, result) => {
        if (err) throw err
        connection.query(initOrders, (err, result) => {
          if (err) throw err
          // When all tables have been created, start inserting data

          // First check for empty table
          connection.query(`SELECT EXISTS(SELECT 1 FROM orders) as empty`, (err, result) => {
            if (err) throw err

            let emptyDB = true
            if (result[0].empty === 1) emptyDB = false

            // Insert data
            if (emptyDB) {
              let tables = ['albums', 'songs', 'users', 'orders']
              for (const e of tables) {
                let query = `LOAD DATA LOCAL INFILE '${e}.csv' INTO TABLE ${e} FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\r\n'`

                // Don't insert orders if it's not empty
                connection.query(query, (err, result) => {
                  if (err) throw err
                })
              }
            }
          })
        })
      })
    })
  })
}

Controller.listUsers = (req, res) => {
  connection.query('SELECT * FROM users', (err, result) => {
    res.render('list_users', {
      title: 'Listings: Users',
      data: result
    })
  })
}

Controller.listAlbums = (req, res) => {
  const query = `SELECT id, name, artist, price, in_stock, release_date,
    (SELECT COUNT(id) 
     FROM songs 
     WHERE albums.id = album_id) as num_of_songs
  FROM albums`

  connection.query(query, (err, result) => {
    for (let i = 0; i < result.length; i++) {
      let e = result[i]
      // fix boolean (0 = true, 1 = false)
      e.in_stock ? (e.in_stock = 'Yes') : (e.in_stock = 'No')

      // fix date print
      const offset = e.release_date.getTimezoneOffset()
      e.release_date = new Date(e.release_date.getTime() - offset * 60 * 1000)
        .toISOString()
        .split('T')[0]
    }

    res.render('list_albums', {
      title: 'Listings: Albums',
      data: result
    })
  })
}

Controller.listOrders = (req, res) => {
  connection.query('SELECT * FROM orders', (err, result) => {
    res.render('list_orders', {
      title: 'Listings: Orders',
      data: result
    })
  })
}

Controller.listSongs = (req, res) => {
  const query = `SELECT songs.id, songs.title, songs.length, albums.artist, albums.name AS album_name, songs.album_id
  FROM albums
  INNER JOIN songs
  ON albums.id = songs.album_id
  ORDER BY songs.album_id ASC, songs.id ASC`

  connection.query(query, (err, result) => {
    for (let i = 0; i < result.length; i++) {
      let e = result[i]
      if (e) e.length = new Date(e.length * 1000).toISOString().substr(14, 5)
    }
    res.render('list_songs', {
      title: 'Listings: Songs',
      data: result
    })
  })
}

Controller.renderIndex = (req, res) => {
  res.render('index', {
    title: 'Index'
  })
}

Controller.renderCreateAlbum = (req, res) => {
  if (req.params.id) {
    update = true

    connection.query(`SELECT * FROM albums WHERE id = ${req.params.id}`, (err, result) => {
      if (err) throw err

      let checkBoxChecked = false
      if (result[0].in_stock === 1) checkBoxChecked = true

      // fix date print
      const offset = result[0].release_date.getTimezoneOffset()
      result[0].release_date = new Date(result[0].release_date.getTime() - offset * 60 * 1000)
        .toISOString()
        .split('T')[0]

      res.render('create_update', {
        title: 'Update an Album',
        album: true,
        update: true,
        data: result[0],
        checked: checkBoxChecked
      })
    })
  } else {
    res.render('create_update', {
      title: 'Add a new Album',
      album: true,
      update: false
    })
  }
}

Controller.renderCreateSong = (req, res) => {
  if (req.params.id) {
    update = true

    connection.query(`SELECT * FROM songs WHERE id = ${req.params.id}`, (err, result) => {
      if (err) throw err

      res.render('create_update', {
        title: 'Update a Song',
        song: true,
        update: true,
        data: result[0]
      })
    })
  } else {
    res.render('create_update', {
      title: 'Add a new Song',
      song: true,
      update: false
    })
  }
}

Controller.renderUpdate = (req, res) => {
  // TODO
}

Controller.updateRow = (req, res) => {
  // TODO
}

Controller.updateSong = (req, res) => {
  const query = `UPDATE songs 
      SET album_id = ${req.body.album_id}, title = "${req.body.title}", length =${req.body.length}
      WHERE id = ${req.params.id}`

  connection.query(query, (err, result) => {
    if (err) {
      console.log(err)
      res.render('create_update', {
        title: 'Update a Song',
        status: 'Could not update song!',
        song: true,
        update: true,
        error: true
      })
    } else {
      res.render('create_update', {
        title: 'Update a Song',
        status: 'Song updated!',
        song: true,
        update: true,
        data: req.body
      })
    }
  })
}

Controller.createSong = (req, res) => {
  // check for duplicate first
  const duplicateCheck = `SELECT COUNT(title) as count FROM songs WHERE album_id = "${req.body.album_id}" AND title = "${req.body.title}"`
  connection.query(duplicateCheck, (err, result) => {
    if (err) {
      console.log(err)
      return
    } else if (result[0].count > 0) {
      res.render('create_update', {
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
          res.render('create_update', {
            title: 'Add new Song',
            status: 'Incorrect album id!',
            song: true,
            error: true
          })
        } else {
          res.render('create_update', {
            title: 'Add new Song',
            status: 'Song added!',
            song: true
          })
        }
      })
    }
  })
}

Controller.updateAlbum = (req, res) => {
  let checkBoxChecked = false
  if (req.body.in_stock === 1) checkBoxChecked = true

  let stock = 0
  if (req.body.in_stock) stock = 1

  const query = `UPDATE albums 
  SET price = ${req.body.price}, in_stock = ${stock}, name = "${req.body.name}", artist = "${req.body.artist}", release_date = "${req.body.release_date}"
  WHERE id = ${req.params.id}`

  connection.query(query, (err, result) => {
    if (err) {
      console.log(err)
      res.render('create_update', {
        title: 'Update an Album',
        status: 'Could not update album!',
        album: true,
        update: true,
        error: true,
        checked: checkBoxChecked
      })
    } else {
      res.render('create_update', {
        title: 'Update an Album',
        status: 'Song updated!',
        album: true,
        update: true,
        data: req.body,
        checked: checkBoxChecked
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
      res.render('create_update', {
        title: 'Add new Album',
        status: 'Album already exists!',
        album: true,
        error: true
      })
    } else {
      // if no dupe, insert new album
      const query = `INSERT INTO albums (price, in_stock, name, artist, release_date) VALUES (${req.body.price}, ${stock}, "${req.body.name}", "${req.body.artist}", "${req.body.release_date}")`
      connection.query(query, (err, result) => {
        if (err) {
          console.log(err)
          res.render('create_update', {
            title: 'Add new Album',
            status: 'An error occured',
            album: true,
            error: 'An error occured!'
          })
        } else {
          res.render('create_update', {
            title: 'Add new Album',
            status: 'Album added!',
            album: true
          })
        }
      })
    }
  })
}

Controller.handleUsersPost = (req, res) => {}

Controller.handleAlbumsPost = (req, res) => {}

Controller.handleOrdersPost = (req, res) => {}

Controller.handleSongsPost = (req, res) => {}

module.exports = Controller
