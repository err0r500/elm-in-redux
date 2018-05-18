import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import {createStore, applyMiddleware, combineReducers, compose} from 'redux'
import {default as Counter, reducerInitialState} from './counter'

import ElmBridge from 'elm-in-redux'

import ElmModule from './MyReducer'

const module = ElmBridge(
    ElmModule.MyReducer, // Reducer is the name of the elm module
    reducerInitialState
);

const reducer = combineReducers({
    elmReducer: module.reducer(), // set initial state in redux, but not took into account by elm,
});

const store = createStore(reducer, compose(
    applyMiddleware(
        module.sendActionsToElm,
    ),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
))

console.log(module)

module.subscribeToElm(store) // to receive messages from elm module


ReactDOM.render(
    <Provider store={store}>
        <Counter/>
    </Provider>
    , document.getElementById('app'))

