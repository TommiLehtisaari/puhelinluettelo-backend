const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

morgan.token('body', function(req, res) {
  if (req.method === 'POST') return JSON.stringify(req.body)
})

app.use(express.static('build'))
app.use(express.json())
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] :response-time ms :body'))

app.get('/info', (req, res) => {
  Person.count({}).then(count => {
    res.send(`<p>Puhelinluettelossa ${count} henkilön tiedot </p>
    <p>${new Date()}</p>`)
  })
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(p => {
    res.send(p.map(pp => pp.toJSON()))
  })
})

app.post('/api/persons', (req, res) => {
  const { name, number } = req.body
  if (!name) return res.status(400).send({ error: 'name required' })
  if (!number) return res.status(400).send({ error: 'number required' })

  const person = new Person({ name, number })

  person.save().then(savedPerson => {
    res.send(savedPerson.toJSON())
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) return res.send(person.toJSON())
      res.status(404).end()
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body
  if (!name) return res.status(400).send({ error: 'name required' })
  if (!number) return res.status(400).send({ error: 'number required' })

  const person = { name, number }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      res.send(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint ' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return res.status(400).send({ error: 'mallformatted id' })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT)
