const express = require('express')
const app = express()
const Busboy = require('busboy')
const redis = require('redis')

const client = redis.createClient({
  detect_buffers: true,
})

client.on('error', e => console.log('REDIS ERROR \n: ' + e))

app.post('/api/v1/upload/:imageId', (req, res, next) => {
  const busboy = new Busboy({ headers: req.headers })
  let fileData = null

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    console.log(encoding)
    file.on('data', data => {
      if (!fileData) {
        fileData = [data]
      } else {
        // TODO - should append
        fileData.concat([data])
      }
    })

    file.on('end', () => {
      client.set('images:' + req.params.imageId, fileData, (err, response) => {
        if (err) {
          next(err)
        } else {
          res.status(200).json({
            success: true,
            message: 'Image uploaded!',
            path: req.params.imageId,
          })
          res.end()
        }
      })
    })
  })

  req.pipe(busboy)
})

// TODO: use pseudo streaming
// https://medium.com/@stockholmux/redis-express-and-streaming-with-node-js-and-classic-literature-d00f13368db3

app.get('/api/v1/image/:imageId', (req, res, next) => {
  client.get('images:' + req.params.imageId, (err, value) => {
    if (err) {
      console.log(err)
      next(err)
    } else {
      if (!value) {
        next()
      } else {
        res.setHeader('Content-Type', 'image/jpeg')
        res.end(value)
      }
    }
  })
})

module.exports = app

// TODO:
// move to slower storage after upload to Redis
// use hget / hset and create a time-stamped photo album
// decentralize image processing with http://aheckmann.github.io/gm/
