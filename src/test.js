const request = require('supertest')
const fs = require('mz/fs')
const app = require('./server')

const SIZE = 'small'

describe('POST /api/v1/upload', () => {
  const filePath = `${__dirname}/../images/${SIZE}.jpg`

  it('should upload an image to the server', () => {
    fs.exists(filePath).then(exists => {
      if (!exists) throw new Error('file does not exist')
    })

    return request(app)
      .post(`/api/v1/upload/${SIZE}`)
      .attach('file', filePath)
      .then(response => {
        const { success, message, path } = response.body

        expect(success).toBeTruthy()
        expect(message).toBe('Image uploaded!')
        expect(typeof path).toBeTruthy()
      })
      .catch(err => console.log(err))
  })

  it('should download an image from server', done => {
    return request(app)
      .get(`/api/v1/image/${SIZE}`)
      .expect('Content-Type', 'image/jpeg')
      .expect(200)
      .then(response => {
        const { success, message } = response.body
        done()
      })
  })
})

// TODO
// uploading wrong file type
// try delete with unknown id
// image to small
// image too large
