import camelCase from 'camelcase'

const ELM = '@@elm:';
const subscriptionPort = 'elmOutPort';

export const ElmBridge = (elmRawModule, init) => {
    const prefix = uuidv4();
    const elmModule = elmRawModule.worker(init);

    const reducer = () => (state = init, action) => {
        if (isElmAction(action, prefix)) {
            return action.payload
        }

        return state
    };


    const sendActionsToElm = () => next => action => {
        const elmPortName = actionTypeToElmPortName(action.type);

        if (elmPortName === subscriptionPort) {
            console.error(`you're attempting to send to the elm reserved out port : ${subscriptionPort}. 
            Please change your action type to something else than ${action.type}`);
            return next(action)
        }

        // send complete action object
        if (elmInPortExists(elmModule, elmPortName)) {
            elmModule.ports[elmPortName].send(action)
        }
        // send only the Action payload property
        if (elmInPortExists(elmModule, `${elmPortName}Payload`)) {
            elmModule.ports[`${elmPortName}Payload`].send(forgedPayload(action))
        }

        return next(action)
    };

    // subscribes to elmOutPort and will send an action caught by createElmReducer() above
    const subscribeToElm = store => {
        if (elmOutPortReady(elmModule)) {
            elmModule.ports[subscriptionPort].subscribe(
                ([action, nextState]) => {
                    store.dispatch({
                        type: toElmActionType(action, prefix),
                        payload: nextState
                    })
                }
            )
        }
    };

    return {reducer, sendActionsToElm, subscribeToElm}
};

// default export
export default ElmBridge

// private Helpers
const isElmAction = (action, prefix) => action.type.split('/')[0] === `${ELM}${prefix}`;
const toElmActionType = (action, prefix) => `${ELM}${prefix}/${action}`;
const elmInPortExists = (elmModule, portName) => elmModule.ports && elmModule.ports[portName];
const forgedPayload = action => typeof action.payload === undefined ? null : action.payload;
const elmOutPortReady = elmModule => elmModule && elmModule.ports && elmModule.ports[subscriptionPort];
const actionTypeToElmPortName = actionType => camelCase(actionType); // elm doesn't like CAPITAL_CASE variables so convert it to camelCase

const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
