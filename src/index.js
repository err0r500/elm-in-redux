import camelCase from 'camelcase'

const ELM = '@@elm:';
const subscriptionPort = 'elmOutPort';

class ElmBridge {
    constructor(elmModule, init) {
        this.elmModule = elmModule;
        this.init = init;

        this.worker = elmModule.worker(init);
        this.prefix = uuid4();
    }

    reducer = () => (state = this.init, action) => {
        if (isElmAction(action, this.prefix)) {
            return action.payload
        }

        return state
    };


    sendActionsToElm = () => next => action => {
        const elmPortName = actionTypeToElmPortName(action.type);

        if (elmPortName === subscriptionPort) {
            console.error(`you're attempting to send to the elm reserved out port : ${subscriptionPort}. 
            Please change your action type to something else than ${action.type}`);
            return next(action)
        }

        // send complete action object
        if (elmInPortExists(this.worker, elmPortName)) {
            this.worker.ports[elmPortName].send(action)
        }
        // send only the Action payload property
        if (elmInPortExists(this.worker, `${elmPortName}Payload`)) {
            this.worker.ports[`${elmPortName}Payload`].send(forgedPayload(action))
        }

        return next(action)
    };

    // subscribes to elmOutPort and will send an action caught by createElmReducer() above
    subscribe = store => {
        if (elmOutPortReady(this.worker)) {
            this.worker.ports[subscriptionPort].subscribe(
                ([action, nextState]) => {
                    store.dispatch({
                        type: toElmActionType(action, this.prefix),
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
const isElmAction = (action, prefix) => action.type.split('/')[0] === `${ELM}${prefix}`;
const toElmActionType = (action, prefix) => `${ELM}${prefix}/${action}`;
const elmInPortExists = (elmModule, portName) => elmModule.ports && elmModule.ports[portName];
const forgedPayload = action => typeof action.payload === undefined ? null : action.payload;
const elmOutPortReady = elmModule => elmModule && elmModule.ports && elmModule.ports[subscriptionPort];
const actionTypeToElmPortName = actionType => camelCase(actionType); // elm doesn't like CAPITAL_CASE variables so convert it to camelCase

const uuid4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
