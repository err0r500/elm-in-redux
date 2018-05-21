import camelCase from 'camelcase'

const subscriptionPort = 'elmOutPort';

class ElmBridge {
    constructor(elmModule, init) {
        this.init = init;
        this.worker = elmModule.worker(init);
        this.prefix = uuid4();
    }

    reducer = (state = this.init, action) => {
        if (isElmAction(action, this.prefix)) {
            return Object.assign({}, state, action.payload)
        }

        return state
    };


    middleware = store => next => action => {
        const elmPortName = actionTypeToElmPortName(action.type);

        if (elmPortName === subscriptionPort) {
            console.error(`you're attempting to send to the elm reserved out port : ${subscriptionPort}. 
            Please change your action type to something else than ${action.type}`);
            return next(action)
        }

        // send the complete action object and the current Store state
        if (elmInPortExists(this.worker, elmPortName)) {
            this.worker.ports[elmPortName].send(Object.assign({currState: store.getState()}, action))
        }
        // send only action.payload
        if (action.payload !== undefined && elmInPortExists(this.worker, `${elmPortName}Payload`)) {
            this.worker.ports[`${elmPortName}Payload`].send(action.payload)
        }

        return next(action)
    };

    // subscribes to elmOutPort and will send an action caught by reducer() above
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

const uuid4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
