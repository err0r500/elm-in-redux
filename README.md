# elm-in-redux

NB : this project is a fork of https://github.com/stoeffel/redux-elm-middleware

## Description
Elm-in-redux is a redux middleware you can use to handle a reducer with an Elm module.

Be careful, only actions with payload are handled ex: 
```json
{
  "type": "MY_ACTION",
  "payload": {
      "anything": "sldkfj"
  },
  "somethingElse": "dslkf" <== won't be sent to Elm module
}
```

## Motivation

* write bulletproof businesslogic
* keep the react (and redux) ecosystem
* don't have to commit 100% to it

## Running the Example

```bash
cd examples/simplecounter
npm install
npm start
```
* open [localhost:8080](http://127.0.0.1:8080)
