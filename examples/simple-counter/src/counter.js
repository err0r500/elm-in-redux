import React from 'react'
import {connect} from 'react-redux'

export const reducerInitialState  = {count: 12, value: 10}; // will be used by index.js

class Counter extends React.Component {
    render() {
        return (
            <div>
                <h1>Handled by elm</h1>
                <button onClick={() => this.props.inc()}>+</button>
                <button onClick={() => this.props.dec()}>-</button>
                <h2>{this.props.value}</h2>
            </div>
        )
    }
}

// REDUCER
const mapStateToProps = ({elmReducer}) => {
    return {
        value: elmReducer.value,
    }
};

// ACTIONS that will be intercepted by the Elm Middleware,
export const incrementAction = () => ({
    type: 'INCREMENT'
});

export const decrementAction = () => ({
    type: 'PLEASE_DECREMENT'
});

const mapDispatchToProps = dispatch => ({
    inc: () => dispatch(incrementAction()),
    dec: () => dispatch(decrementAction()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Counter)
