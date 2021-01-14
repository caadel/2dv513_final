import MYSQL from 'mysql'
import LineReader from 'line-reader'

const connection = MYSQL.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'assign2_t1_1'
})

connection.connect((err) => {
  if (err) throw err

  createTable()
})

const TABLE_NAME = process.argv.slice(2, 3)
const filePath = './data/' + process.argv.slice(3)

function createTable() {
  let sqlDropTable = `DROP TABLE IF EXISTS ${TABLE_NAME}`

  let sqlCreateTable = `CREATE TABLE ${TABLE_NAME} (id VARCHAR(16), parent_id VARCHAR(16), link_id VARCHAR(16), name VARCHAR(32), author VARCHAR(32), body TEXT, subreddit_id VARCHAR(32), subreddit VARCHAR(32), score INT, created_utc VARCHAR(16))`

  let sqlCreateTable_CONSTRAINTS = `CREATE TABLE ${TABLE_NAME} (
    id VARCHAR(16) NOT NULL UNIQUE, 
    parent_id VARCHAR(16) NOT NULL, 
    link_id VARCHAR(16) NOT NULL, 
    name VARCHAR(32) NOT NULL, 
    author VARCHAR(32) NOT NULL, 
    body TEXT NOT NULL, 
    subreddit_id VARCHAR(32) NOT NULL, 
    subreddit VARCHAR(32) NOT NULL, 
    score INT NOT NULL, 
    created_utc VARCHAR(16) NOT NULL,
    PRIMARY KEY (id)
    )`

  connection.query(sqlDropTable, (err, result) => {
    if (err) throw err

    connection.query(sqlCreateTable, (err, result) => {
      if (err) throw err
      insertData()
    })
  })
}

function insertData() {
  const batchSize = 3000
  const startTime = Date.now()
  let startTime2 = startTime
  let totalQueryTime = 0
  let i = 0
  // let linesRead = 0
  let values = []

  LineReader.eachLine(filePath, (line, last) => {
    if (i == batchSize || last) {
      const sqlInsert = `INSERT INTO ${TABLE_NAME} (id, parent_id, link_id, name, author, body, subreddit_id, subreddit, score, created_utc) VALUES ?`

      startTime2 = Date.now()
      connection.query(sqlInsert, [values], (err, result) => {
        if (err) throw err

        totalQueryTime += Date.now() - startTime2

        if (last) {
          const finalTotalTime = Date.now() - startTime
          const m = Math.floor(finalTotalTime / 60000)
          const s = ((finalTotalTime % 60000) / 1000).toFixed(0)
          const mQ = Math.floor(totalQueryTime / 60000)
          const sQ = ((totalQueryTime % 60000) / 1000).toFixed(0)
          // console.log(`Lines read: ${linesRead}`)
          console.log(`Query time: ${totalQueryTime}ms / ${totalQueryTime / 1000}s / ${mQ}m ${sQ}s`)
          console.log(`Total time: ${finalTotalTime}ms / ${finalTotalTime / 1000}s / ${m}m ${s}s `)
          process.exit(0)
        }
      })

      // linesRead += i
      i = 0
      values = []
    }

    let dataRow = JSON.parse(line)

    const id = dataRow.id
    const parent_id = dataRow.parent_id
    const link_id = dataRow.link_id
    const name = dataRow.name
    const author = dataRow.author
    let body = dataRow.body
    const subreddit_id = dataRow.subreddit_id
    const subreddit = dataRow.subreddit
    const score = dataRow.score
    const created_utc = dataRow.created_utc

    body = body.replace(/[\u0800-\uFFFF]/g, '')

    values.push([
      id,
      parent_id,
      link_id,
      name,
      author,
      body,
      subreddit_id,
      subreddit,
      score,
      created_utc
    ])

    i++
  })
}
