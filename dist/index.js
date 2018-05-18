'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ElmBridge = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _camelcase = require('camelcase');

var _camelcase2 = _interopRequireDefault(_camelcase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ELM = '@@elm:';
var subscriptionPort = 'elmOutPort';

var ElmBridge = exports.ElmBridge = function ElmBridge(elmRawModule, init) {
    var prefix = uuidv4();
    var elmModule = elmRawModule.worker(init);

    var reducer = function reducer() {
        return function () {
            var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : init;
            var action = arguments[1];

            if (isElmAction(action, prefix)) {
                return action.payload;
            }

            return state;
        };
    };

    var sendActionsToElm = function sendActionsToElm() {
        return function (next) {
            return function (action) {
                var elmPortName = actionTypeToElmPortName(action.type);

                if (elmPortName === subscriptionPort) {
                    console.error('you\'re attempting to send to the elm reserved out port : ' + subscriptionPort + '. \n            Please change your action type to something else than ' + action.type);
                    return next(action);
                }

                // send complete action object
                if (elmInPortExists(elmModule, elmPortName)) {
                    elmModule.ports[elmPortName].send(action);
                }
                // send only the Action payload property
                if (elmInPortExists(elmModule, elmPortName + 'Payload')) {
                    elmModule.ports[elmPortName + 'Payload'].send(forgedPayload(action));
                }

                return next(action);
            };
        };
    };

    // subscribes to elmOutPort and will send an action caught by createElmReducer() above
    var subscribeToElm = function subscribeToElm(store) {
        if (elmOutPortReady(elmModule)) {
            elmModule.ports[subscriptionPort].subscribe(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2),
                    action = _ref2[0],
                    nextState = _ref2[1];

                store.dispatch({
                    type: toElmActionType(action, prefix),
                    payload: nextState
                });
            });
        }
    };

    return { reducer: reducer, sendActionsToElm: sendActionsToElm, subscribeToElm: subscribeToElm };
};

// default export
exports.default = ElmBridge;

// private Helpers

var isElmAction = function isElmAction(action, prefix) {
    return action.type.split('/')[0] === '' + ELM + prefix;
};
var toElmActionType = function toElmActionType(action, prefix) {
    return '' + ELM + prefix + '/' + action;
};
var elmInPortExists = function elmInPortExists(elmModule, portName) {
    return elmModule.ports && elmModule.ports[portName];
};
var forgedPayload = function forgedPayload(action) {
    return _typeof(action.payload) === undefined ? null : action.payload;
};
var elmOutPortReady = function elmOutPortReady(elmModule) {
    return elmModule && elmModule.ports && elmModule.ports[subscriptionPort];
};
var actionTypeToElmPortName = function actionTypeToElmPortName(actionType) {
    return (0, _camelcase2.default)(actionType);
}; // elm doesn't like CAPITAL_CASE variables so convert it to camelCase

var uuidv4 = function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
    });
};