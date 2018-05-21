import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import {createStore, applyMiddleware, combineReducers, compose} from 'redux'
import {default as Counter, reducerInitialState} from './counter'

import ElmBridge from 'elm-in-redux'

import ElmModule from './MyReducer'

const elmBridge = new ElmBridge(
    ElmModule.MyReducer, // MyReducer is the name of the elm module
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
elmBridge.subscribe(store);


ReactDOM.render(
    <Provider store={store}>
        <Counter/>
    </Provider>
    , document.getElementById('app'));

