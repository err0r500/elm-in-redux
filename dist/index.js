'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _camelcase = require('camelcase');

var _camelcase2 = _interopRequireDefault(_camelcase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var subscriptionPort = 'elmOutPort';

var ElmBridge = function ElmBridge(elmModule, init) {
    var _this = this;

    _classCallCheck(this, ElmBridge);

    this.reducer = function () {
        var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this.init;
        var action = arguments[1];

        if (isElmAction(action, _this.prefix)) {
            return Object.assign({}, state, action.payload);
        }

        return state;
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
                    _this.worker.ports[elmPortName].send(Object.assign({ currState: store.getState() }, action));
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

    this.init = init;
    this.worker = elmModule.worker(init);
    this.prefix = uuid4();
}

// subscribes to elmOutPort and will send an action caught by reducer() above
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

var uuid4 = function uuid4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
    });
};