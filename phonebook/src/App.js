import { useState, useEffect } from 'react'
import contService from './services/contacts'
import _ from 'lodash'
import './index.css'

// Refactored components
const Filter = ({ value, onChange }) => {
  const text = 'Filter shown with:'
  return (
    <div>
      {text} <input
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

const PersonForm = ({ onSub, name, num, nameChange, numChange }) => {
  return (
    <form onSubmit={onSub}>
      <div>name: <input value={name} onChange={nameChange} /></div>
      <div>number: <input value={num} onChange={numChange} /></div>
      <div><button type="submit">add</button></div>
    </form>
  )
}

const Person = ({ person, remove }) => {
  return (
    <div> {person.name} {person.number} <button onClick={() => remove({ person })}>delete</button> </div>
  )
}

const Persons = ({ persons, filter, handleRemove }) => {
  const filteredPersons = persons.filter(person => person.name.toLowerCase().includes(filter))
  return (
    <div>
      {filteredPersons.map(person => <Person key={person.name} person={person} remove={handleRemove} /> )}
    </div>
  )
}

const Notification = ({ message, type }) => {
  if (message === null) {
    return null
  } else {

    return (
      <div className={type}>
        {message}
      </div>
      )
  }
}

const App = () => {
  // Hooks
  const [persons, setPersons] = useState([])      // Person information
  const [newName, setNewName] = useState('')      // State for updating name input
  const [newNumber, setNewNumber] = useState('')  // State for updating number input
  const [filter, setFilter] = useState('')        // State for updating filter text
  const [ack, setAck] = useState(null)
  const [err, setErr] = useState(null)

  // Data from server
  useEffect(() => {
    contService
      .getAll()
      .then(initialContacts => {
        setPersons(initialContacts)
      })
  }, [])


  // Event handlers
  const addName = (event) => {
    event.preventDefault()
    // New object to phonebook
    const newObj = {
      name: newName,
      number: newNumber
    }

    if (persons.every(person => person.name != newName)) {
      // Add new person if it is not in the phonebook yet
      contService
        .create(newObj)
        .then(newContact => {
          setPersons(persons.concat(newContact))
          setNewName('')
          setNewNumber('')
          setAck(`${newContact.name} succesfully added to phonebook`)
          setTimeout(() => {
            setAck(null)
          }, 5000)
        })

    } else {
      // Else update
      if (window.confirm(`${newObj.name} is allready added to phonebook, replace the old number with new one?`)) {
        const replacable = persons.find(person => person.name === newName)
        contService
          .update(replacable.id, newObj)
          .then(updatedPerson => {
            const updatedPersons = _.cloneDeep(persons)
            updatedPersons.find(per => per.id === replacable.id).number = updatedPerson.number
            setPersons(updatedPersons)
            setNewName('')
            setNewNumber('')
            setAck(`${replacable.name} succesfully updated to phonebook`)
            setTimeout(() => {
              setAck(null)
            }, 5000)
          })
          .catch(error => { // Give error message if contact is removed from server before update
              setErr(`Contact '${newObj.name}' has already been removed from server`)
            })
            setTimeout(() => {
              setErr(null)
            }, 5000)
            setPersons(persons.filter(per => per.id !== replacable.id))
      }
    }
  }
  const removeName = ({ person }) => {
    if (window.confirm(`Delete ${person.name}?`)) {
      contService
        .remove(person.id)
        .then(() => {
          const oldPersons = _.cloneDeep(persons)
          const newPersons = oldPersons.filter(per => per.name != person.name)
          setPersons(newPersons)
        })
    }
  }
  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }
  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }
  const handleFilterChange = (event) => {
    setFilter(event.target.value.toLowerCase())
  }

  // Returned page
  return (
    <div>
      <h1>Phonebook</h1>
      <Notification message={ack} type='acknowledgment' />
      <Notification message={err} type='error' />
      <Filter value={filter} onChange={handleFilterChange} />
      <h2>Add a new</h2>
      <PersonForm 
        onSub={addName}
        name={newName}
        num={newNumber}
        nameChange={handleNameChange}
        numChange={handleNumberChange}
      />
      <h2>Numbers</h2>
      <Persons persons={persons} filter={filter} handleRemove={removeName} />
    </div>
  )
}

export default App