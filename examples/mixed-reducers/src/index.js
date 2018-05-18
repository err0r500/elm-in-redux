import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import {createStore, applyMiddleware, combineReducers, compose} from 'redux'
import Counter from './counter'

import ElmBridge from 'elm-in-redux'

import ElmModule from './Reducer'
import OtherElmModule from './OtherReducer'

import {basicCounterReducer, loggerMiddleware} from './others'


const module1 = ElmBridge(
    ElmModule.Reducer, // Reducer is the name of the elm module
    {count: 1, value: 100}
);

const module2 = ElmBridge(
    OtherElmModule.OtherReducer, // OtherReducer is the name of the elm module
    {count: 2, value: 10}
);

const reducer = combineReducers({
    elmReducer: module1.reducer(),
    otherElmReducer: module2.reducer(),
    reactReducer: basicCounterReducer // a basic redux reducer, just for the example
});

const store = createStore(reducer, compose(
    applyMiddleware(
        module1.sendActionsToElm,
        module2.sendActionsToElm,
        loggerMiddleware), // basicLogger
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
));

// to receive messages from elm module
module1.subscribeToElm(store);
module2.subscribeToElm(store);


ReactDOM.render(
    <Provider store={store}>
        <Counter/>
    </Provider>
    , document.getElementById('app'));

