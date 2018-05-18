import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import {createStore, applyMiddleware, combineReducers, compose} from 'redux'
import {default as Counter, reducerInitialState} from './counter'

import ElmBridge from 'elm-in-redux'

import ElmModule from './MyReducer'

const elmBridge = new ElmBridge(
    ElmModule.MyReducer, // MyReducer is the name of the elm module
    reducerInitialState // set the initial state in redux & elm
);

const reducer = combineReducers({
    elmReducer: elmBridge.reducer, // set initial state in redux, but not took into account by elm,
});

const store = createStore(reducer, compose(
    applyMiddleware(
        elmBridge.sendActionsToElm,
    ),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
));

elmBridge.subscribe(store) // to receive messages from elm module


ReactDOM.render(
    <Provider store={store}>
        <Counter/>
    </Provider>
    , document.getElementById('app'))

