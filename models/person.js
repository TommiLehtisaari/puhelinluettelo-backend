const mongoose = require('mongoose')
const config = require('config')

mongoose.set('useFindAndModify', false)

const url = config.get('mongo_url')

mongoose
  .connect(url, { useNewUrlParser: true })
  .then(result => {
    console.log('Connected to MongoDB')
  })
  .catch(error => {
    console.log('failed to connect MongoDB Atlas:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

personSchema.set('toJSON', {
  transform: (document, returnObject) => {
    returnObject.id = returnObject._id.toString()
    delete returnObject._id
    delete returnObject.__v
  }
})

module.exports = mongoose.model('person', personSchema)
