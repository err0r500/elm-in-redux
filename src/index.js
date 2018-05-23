import camelCase from 'camelcase'

const subscriptionPort = 'elmOutPort';

class ElmBridge {
    // reducerName is the name you want to give to your reducer. It's also used to send it to elm
    // elmModule is the elmModule that will handle your reducer
    // initialState is the state you want your reducer to have before any action is received
    constructor(reducerName, elmModule, initialState) {
        this.init = initialState;
        this.worker = elmModule.worker(initialState);

        this.prefix = `elm::${reducerName}`;
        this.reducerName = reducerName;
        this.reducer = this.getReducer(reducerName)
    }

    reducerFunc = (state = this.init, action) => {
        if (isElmAction(action, this.prefix)) {
            return Object.assign({}, state, action.payload)
        }

        return state
    };

    getReducer = () => ({[this.reducerName]: this.reducerFunc});

    middleware = store => next => action => {
        const elmPortName = actionTypeToElmPortName(action.type);

        if (elmPortName === subscriptionPort) {
            console.error(`you're attempting to send to the elm reserved out port : ${subscriptionPort}. 
            Please change your action type to something else than ${action.type}`);
            return next(action)
        }

        // send the complete action object and the current Store state
        if (elmInPortExists(this.worker, elmPortName)) {
            if (this.reducerName) {
                this.worker.ports[elmPortName].send(Object.assign({}, {currState: store.getState()[this.reducerName]}, action))
            } else {
                this.worker.ports[elmPortName].send(Object.assign({}, action))

            }
        }
        // send only action.payload
        if (action.payload !== undefined && elmInPortExists(this.worker, `${elmPortName}Payload`)) {
            this.worker.ports[`${elmPortName}Payload`].send(action.payload)
        }

        return next(action)
    };

    // subscribes to elmOutPort and will send an action caught by reducerFunc() above
    subscribe = store => {
        if (elmOutPortReady(this.worker)) {
            this.worker.ports[subscriptionPort].subscribe(
                nextState => {
                    store.dispatch({
                        type: this.prefix,
                        payload: nextState
                    })
                }
            )
        }
    };

}


// default export
export default ElmBridge

// private Helpers
const isElmAction = (action, prefix) => action.type === `${prefix}`;
const elmInPortExists = (elmModule, portName) => elmModule.ports && elmModule.ports[portName];
const elmOutPortReady = elmModule => elmModule && elmModule.ports && elmModule.ports[subscriptionPort];
const actionTypeToElmPortName = actionType => camelCase(actionType); // elm doesn't like CAPITAL_CASE variables so convert it to camelCase