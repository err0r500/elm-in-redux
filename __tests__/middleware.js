import configureStore from 'redux-mock-store';
import ElmBridge from '../src'

export function getEB(initial = {}) {
    const module = {
        worker: jest.fn().mockReturnValue({
                ports: {}
            }
        )
    };

    return new ElmBridge(module, initial);
}

test('should expose the API', () => {
    const eB = getEB();

    expect(eB).toHaveProperty('reducer');
    expect(eB).toHaveProperty('sendActionsToElm');
    expect(eB).toHaveProperty('subscribe')
})


describe('middleware action handling', () => {
    test('should dispatch any received action', () => {
        const sendToElm = jest.fn();
        const dontSendToElm = jest.fn();
        const eB = new ElmBridge({
            worker: jest.fn().mockReturnValue({
                    ports: {
                        addTodo: {
                            send: sendToElm
                        },
                        other: {
                            send: dontSendToElm
                        }
                    }
                }
            )
        }, {});

        const store = configureStore([eB.sendActionsToElm])({prop1: "hey"});
        const addTodo = () => ({type: 'ADD_TODO'});

        store.dispatch(addTodo());

        expect(store.getActions()).toEqual([addTodo()]);
        expect(dontSendToElm).toHaveBeenCalledTimes(0); // no an elm action => should not have been called
        expect(sendToElm).toHaveBeenCalledTimes(1); // port name is the camel case version of the action, should be called
        expect(sendToElm).toHaveBeenCalledWith({"currState": {"prop1": "hey"}, "type": "ADD_TODO"}) // the complete action is sent to Elm
    })

    test('should send only the payload if name end with _PAYLOAD', () => {
        const sendToElm = jest.fn();
        const dontSendToElm = jest.fn();

        const eB = new ElmBridge({
            worker: jest.fn().mockReturnValue({
                    ports: {
                        addTodoPayload: {
                            send: sendToElm
                        },
                        otherPortPayload: {
                            send: dontSendToElm
                        }
                    }
                }
            )
        }, {});

        const store = configureStore([eB.sendActionsToElm])({});
        const addTodo = () => ({
            type: 'ADD_TODO',
            payload: 'hey'
        });
        const otherPort = () => ({
            type: 'OTHER_PORT'
        });

        store.dispatch(addTodo());
        store.dispatch(otherPort());

        expect(store.getActions()).toEqual([addTodo(), otherPort()]);
        expect(sendToElm).toHaveBeenCalledTimes(1); // port name is the camel case version of the action, should be called
        expect(sendToElm).toHaveBeenCalledWith(addTodo().payload); // only payload is sent
        expect(dontSendToElm).toHaveBeenCalledTimes(0); // elm action but xxxPayload port and no payload => should not have been called
    })

    test('action with type TO_ELM_PORT will not be sent, the port is reserved to outcoming messages', () => {
        const sendToElm = jest.fn();

        const eB = new ElmBridge({
            worker: jest.fn().mockReturnValue({
                    ports: {
                        elmOutPort: {
                            send: sendToElm
                        }
                    }
                }
            )
        }, {});

        const store = configureStore([eB.sendActionsToElm])({});
        const addTodo = () => ({
            type: 'ELM_OUT_PORT',
            payload: 'hey'
        });

        store.dispatch(addTodo());

        expect(store.getActions()).toEqual([addTodo()]);
        expect(sendToElm).toHaveBeenCalledTimes(0); // not sent, the port is reserved to outcoming messages
    })
});