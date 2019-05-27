const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

morgan.token("body", function(req, res) {
  if (req.method === "POST") return JSON.stringify(req.body);
});

app.use(express.static("build"));
app.use(express.json());
app.use(cors());
app.use(
  morgan(":method :url :status :res[content-length] :response-time ms :body")
);

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1
  },
  {
    name: "Martti Tienari",
    number: "040-123456",
    id: 2
  },
  {
    name: "Arto Järvinen",
    number: "040-123456",
    id: 3
  },
  {
    name: "Lea Kutvonen",
    number: "040-123456",
    id: 4
  }
];

app.get("/info", (req, res) => {
  res.send(`<p>Puhelinluettelossa ${persons.length} henkilön tiedot </p>
  <p>${new Date()}</p>`);
});

app.get("/api/persons", (req, res) => {
  res.send(persons);
});

app.post("/api/persons", (req, res) => {
  const { name, number } = req.body;
  const searchName = persons.find(person => person.name === name);
  if (!name) return res.status(400).send({ error: "name required" });
  if (searchName) return res.status(400).send({ error: "name must be unique" });
  if (!number) return res.status(400).send({ error: "number required" });

  const id = Math.floor(Math.random() * Math.floor(10000000));
  const person = { name, number, id };
  persons = persons.concat(person);
  res.send(person);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const result = persons.find(person => person.id === id);
  if (result) return res.send(result);
  res.status(404).send(`Person with id ${id} not found`);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter(person => person.id !== id);
  res.status(204).send();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT);
