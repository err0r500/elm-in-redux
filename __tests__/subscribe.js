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


describe('subscribe', () => {
    test('the subscribe method of elmOutPort takes a func and applies it an [2] that will be transformed to an object', () => {
        const sendToElm = jest.fn();

        const eB = new ElmBridge({
            worker: jest.fn().mockReturnValue({
                    ports: {
                        elmOutPort: {
                            subscribe: func => func(['anything', {prop1: "hey"}]) // pass it an array, it will be transformed before calling the dispatch

                        }
                    }
                }
            )
        }, {});

        const store = configureStore([eB.sendActionsToElm])({});
        store.dispatch = sendToElm;

        eB.subscribe(store);

        expect(sendToElm).toHaveBeenCalledTimes(1); // port name is the camel case version of the action, should be called
        expect(sendToElm).toHaveBeenCalledWith({"payload": {"prop1": "hey"}, "type": `${eB.prefix}`}); // only payload is sent
    })

    test('should dispatch the action and middleware should update reducer accordingly', () => {
        const eB = new ElmBridge({
            worker: jest.fn().mockReturnValue({
                    ports: {
                        elmOutPort: {
                            subscribe: (fn) => {
                                fn(['anything', {prop1: "hey"}])
                            }
                        }
                    }
                }
            )
        }, {});

        const store = configureStore([eB.sendActionsToElm])({prop1: 'foo'});
        eB.subscribe(store);

        expect(store.getActions()).toEqual([{type: eB.prefix, payload: {prop1: 'hey'}}]);

        eB.reducer(store.getState(), store.getActions()[0]);
        expect(store.getState()).toEqual({prop1: 'hey'})
    })
});