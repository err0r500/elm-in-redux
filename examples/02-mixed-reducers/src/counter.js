import React from 'react'
import {connect} from 'react-redux'

class Counter extends React.Component {
    render() {
        return (
            <div>
                <div>
                    <h1>Handled by elm</h1>
                    <button onClick={() => this.props.asyncInc()}>async +</button>
                    <button onClick={() => this.props.inc()}>+</button>
                    <h2>{this.props.elmOtherReducervalue} -- {this.props.elmReducervalue}</h2>
                    <button onClick={() => this.props.asyncDec()}>async -</button>
                    <button onClick={() => this.props.dec()}>-</button>
                </div>
                <br/>
                <br/>
                <div style={{backgroundColor: "silver"}}>
                    <h1>Handled by react</h1>
                    <button onClick={() => this.props.basicInc()}>+</button>
                    <h2>{this.props.basicValue}</h2>
                    <button onClick={() => this.props.basicDec()}>-</button>
                </div>
            </div>
        )
    }
}

const mapStateToProps = ({elmReducer, otherElmReducer, reactReducer}) => {
    return {
        elmReducervalue: elmReducer.value,
        elmOtherReducervalue: otherElmReducer.value,
        basicValue: reactReducer.value,
    }
};

// ACTIONS that will be intercepted by the Elm Middleware,

// handled by Reducer & OtherReducer
const INCREMENT = 'INCREMENT';
export const incrementAction = () => ({
    type: INCREMENT,
    payload: {
        salut: "sd;alfk",
    }
});

// handled only by OtherReducer
const ASYNC_INCREMENT = 'ASYNC_INCREMENT';
export const asyncIncrementAction = () => ({
    type: ASYNC_INCREMENT
});

// handled by Reducer & OtherReducer
const DECREMENT = 'DECREMENT';
export const decrementAction = () => ({
    type: DECREMENT
});

// handled only by OtherReducer
const ASYNC_DECREMENT = 'ASYNC_DECREMENT';
export const asyncDecrementAction = () => ({
    type: ASYNC_DECREMENT
});


//
// REACT ONLY ACTIONS
export const basicIncrementAction = () => ({
    type: 'BASIC_INCREMENT'
});

export const basicDecrementAction = () => ({
    type: 'BASIC_DECREMENT'
});

const mapDispatchToProps = dispatch => ({
    asyncInc: () => dispatch(asyncIncrementAction()),
    inc: () => dispatch(incrementAction()),
    asyncDec: () => dispatch(asyncDecrementAction()),
    dec: () => dispatch(decrementAction()),
    basicInc: () => dispatch(basicIncrementAction()),
    basicDec: () => dispatch(basicDecrementAction()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Counter)
