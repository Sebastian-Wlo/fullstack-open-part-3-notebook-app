const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(express.json());
morgan.token('body', function (req,res) {return JSON.stringify(req.body)})
app.use(morgan(':method :url :status :body - :response-time ms'));

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
];

// MIDDLEWARE - requestLogger
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log("Path:", request.path)
  console.log("Body:", request.body)
  console.log('---')
  next()
}

app.use(express.static('dist'));

app.use(requestLogger);


// Send all Persons
app.get('/api/persons', (request, response) => {
  response.json(persons);
})

const getPersonById = (id) => {
  const person = persons.filter(person => person.id === id);
  return person.length > 0 ? person : null;
}

const getPersonByName = (name) => {
  const person = persons.filter(person => person.name === name);
  return person.length > 0 ? person : null;
}

const generateId = () => {
  return parseInt(persons[persons.length - 1].id) + 1;
}

// Send person specified by Id
app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  const person = getPersonById(id);
  if (person) {
    return response.status(204).send(person);
  }
  else {
    return response.status(400).json({
      error: `person with the id '${id}' not found`})
  }
})

// Update a person
app.put('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  const updatedPerson = request.body;
  updatedPerson.id = id;
  persons = [...persons, updatedPerson];
  return response.send(updatedPerson);

})

// Add a person
app.post('/api/persons/', (request, response) => {
  const person = request.body;
  if (!getPersonByName(person.name)) {
    const nextId = generateId();
    person.id = String(nextId);
    persons = [...persons, person];
    return response.json(person);
  } else {
    return response.status(400).json({
      error: `${person.name} already exists`
    })
  }
  
})

// DELETE a person by ID
app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  const person = getPersonById(id);
  if (person) {
    persons = persons.filter(person => person.id !== id);
    response.status(204).end();
  } else {
    return response.status(400).json({
      error: `Person with the id '${id}' not found.`})
  }

})

app.get('/info', (request, response) => {
  response.end(`
    <p>Response has info for ${persons.length} people</p>
    <p>${String(Date())}</p>`)
})

const  PORT = 3001
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint"})
}

app.use(unknownEndpoint)