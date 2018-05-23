'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _camelcase = require('camelcase');

var _camelcase2 = _interopRequireDefault(_camelcase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var subscriptionPort = 'elmOutPort';

var ElmBridge =
// reducerName is the name you want to give to your reducer. It's also used to send it to elm
// elmModule is the elmModule that will handle your reducer
// initialState is the state you want your reducer to have before any action is received
function ElmBridge(reducerName, elmModule, initialState) {
    var _this = this;

    _classCallCheck(this, ElmBridge);

    this.reducerFunc = function () {
        var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this.init;
        var action = arguments[1];

        if (isElmAction(action, _this.prefix)) {
            return Object.assign({}, state, action.payload);
        }

        return state;
    };

    this.getReducer = function () {
        return _defineProperty({}, _this.reducerName, _this.reducerFunc);
    };

    this.middleware = function (store) {
        return function (next) {
            return function (action) {
                var elmPortName = actionTypeToElmPortName(action.type);

                if (elmPortName === subscriptionPort) {
                    console.error('you\'re attempting to send to the elm reserved out port : ' + subscriptionPort + '. \n            Please change your action type to something else than ' + action.type);
                    return next(action);
                }

                // send the complete action object and the current Store state
                if (elmInPortExists(_this.worker, elmPortName)) {
                    if (_this.reducerName) {
                        _this.worker.ports[elmPortName].send(Object.assign({}, { currState: store.getState()[_this.reducerName] }, action));
                    } else {
                        _this.worker.ports[elmPortName].send(Object.assign({}, action));
                    }
                }
                // send only action.payload
                if (action.payload !== undefined && elmInPortExists(_this.worker, elmPortName + 'Payload')) {
                    _this.worker.ports[elmPortName + 'Payload'].send(action.payload);
                }

                return next(action);
            };
        };
    };

    this.subscribe = function (store) {
        if (elmOutPortReady(_this.worker)) {
            _this.worker.ports[subscriptionPort].subscribe(function (nextState) {
                store.dispatch({
                    type: _this.prefix,
                    payload: nextState
                });
            });
        }
    };

    this.init = initialState;
    this.worker = elmModule.worker(initialState);

    this.prefix = 'elm::' + reducerName;
    this.reducerName = reducerName;
    this.reducer = this.getReducer(reducerName);
}

// subscribes to elmOutPort and will send an action caught by reducerFunc() above
;

// default export


exports.default = ElmBridge;

// private Helpers

var isElmAction = function isElmAction(action, prefix) {
    return action.type === '' + prefix;
};
var elmInPortExists = function elmInPortExists(elmModule, portName) {
    return elmModule.ports && elmModule.ports[portName];
};
var elmOutPortReady = function elmOutPortReady(elmModule) {
    return elmModule && elmModule.ports && elmModule.ports[subscriptionPort];
};
var actionTypeToElmPortName = function actionTypeToElmPortName(actionType) {
    return (0, _camelcase2.default)(actionType);
}; // elm doesn't like CAPITAL_CASE variables so convert it to camelCase