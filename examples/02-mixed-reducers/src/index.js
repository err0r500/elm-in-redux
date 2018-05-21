import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import {createStore, applyMiddleware, combineReducers, compose} from 'redux'
import Counter from './counter'

import ElmBridge from 'elm-in-redux'

import ElmModule from './Reducer'
import OtherElmModule from './OtherReducer'

import {basicCounterReducer, loggerMiddleware} from './others'


const elmBridge1 = new ElmBridge(
    ElmModule.Reducer, // Reducer is the name of the elm module
    {count: 1, value: 100}
);

const elmBridge2 = new ElmBridge(
    OtherElmModule.OtherReducer, // OtherReducer is the name of the elm module
    {count: 2, value: 10}
);

const reducer = combineReducers({
    elmReducer: elmBridge1.reducer,
    otherElmReducer: elmBridge2.reducer,
    reactReducer: basicCounterReducer // a basic standard reducer, just for the example
});

const store = createStore(reducer, compose(
    applyMiddleware(
        elmBridge1.middleware,
        elmBridge2.middleware,
        loggerMiddleware), // basicLogger
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
));

// to receive messages from elm modules
elmBridge1.subscribe(store);
elmBridge2.subscribe(store);


ReactDOM.render(
    <Provider store={store}>
        <Counter/>
    </Provider>
    , document.getElementById('app'));

