import {getEB} from "./middleware";

describe('reducer action handling', () => {
    const stateProp1 = {prop1: "testing1", otherProps: "hey"};
    const stateProp2 = {prop2: "testing2", otherProps: "foo", otherProps2: "bar"};
    const stateBoth = {prop1: "testing1", prop2: "testing2", otherProps: "foo", otherProps2: "bar"};

    test('state from constructor is default', () => {
        expect(getEB(stateProp1).reducer(undefined, {type: "anything"})).toEqual(stateProp1);
    })

    test('actions not from elm change nothing', () => {
        expect(getEB(stateProp1).reducer(stateProp1, {type: "anything", payload: stateProp2})).toEqual(stateProp1);
    })

    test('elm actions update state', () => {
        let eB = getEB({});
        expect(eB.reducer(undefined, {
            type: `${eB.prefix}`,
            payload: stateProp2
        })).toEqual(stateProp2)
    })

    test('elm can partially handle a reducer', () => {
        let eB = getEB(stateProp1);
        expect(eB.reducer(stateProp1, {
            type: `${eB.prefix}`,
            payload: stateProp2
        })).toEqual(stateBoth)
    })
});
