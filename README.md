# elm-in-redux
[![Build Status](https://travis-ci.org/err0r500/elm-in-redux.svg?branch=master)](https://travis-ci.org/err0r500/elm-in-redux)
[![codecov](https://codecov.io/gh/err0r500/elm-in-redux/branch/master/graph/badge.svg)](https://codecov.io/gh/err0r500/elm-in-redux)

## Motivation

* write bulletproof business logic
* keep the react (and redux) ecosystem

## Features
* handle a complete or partial reducer 
* smooth integration with redux (see below)
* multiple reducers handling
* reducer's current state sent to Elm (so you don't have to fear out of sync models)
* select from Elm which actions are handled (using a port with the action.type in camelCase)
* use yourActionTypePayload (ex: addTodoPayload) as port name to receive only the action.payload (if present) 

## Running the examples

the examples use directly the src folder so first of all :

Install elm if you haven't yet : https://guide.elm-lang.org/install.html

then : 
```bash
npm install
```
finally :
```bash
cd examples/theExampleYouWant
npm install
npm start
```
* open [localhost:8080](http://127.0.0.1:8080)

## Use it in your projects 
```js
import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import {createStore, applyMiddleware, combineReducers} from 'redux'
import MyContainer from './myContainer'

//
// === START OF INTERESTING PART ===
//

import ElmBridge from 'elm-in-redux'
import ElmModule from './MyReducer'// the file is ./MyReducer.elm
                                   
const reducerInitialState  = {count: 12, value: 10}; // the initial state you want

const elmBridge = new ElmBridge(
    ElmModule.MyReducer, // MyReducer is the name of your elm module
    reducerInitialState // set the initial state in redux & elm module
);

const reducer = combineReducers({
    elmReducer: elmBridge.reducer,
});

const store = createStore(reducer, 
    applyMiddleware(
        elmBridge.middleware,
    )
);

// to receive messages from elm module
elmBridge.subscribe(store)

//
// === END OF INTERESTING PART ===
//

ReactDOM.render(
    <Provider store={store}>
        <MyContainer/>
    </Provider>
    , document.getElementById('app'));
```

You'll obviously have to use .elm files transpiled to JS... so check the examples to see how webpack is configured to do so :)

## Inspiration
This project was originally a fork of https://github.com/stoeffel/redux-elm-middleware