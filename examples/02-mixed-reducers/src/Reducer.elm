port module Reducer exposing (Model, Msg)

import Redux
import Json.Encode exposing (..)
import Json.Decode exposing (..)


{-| the Elm middleware will transform the action.type-s to camel case
Ex with an action like :
{ type : "ASYNC_INCREMENT" }
will be sent to the "asyncIncrement" port
-}
port increment : (Json.Encode.Value -> msg) -> Sub msg


port decrement : (Json.Encode.Value -> msg) -> Sub msg


type alias Model =
    { modelValue : Int
    , modelCount : Int
    }


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.batch
        [ decrement <| always Decrement
        , increment Increment
        ]



-- ACTIONS


type Msg
    = NoOp
    | Increment Json.Encode.Value
    | Decrement


type alias Action =
    { currentState : ReduxModel
    , actionType : String
    }


actionDecoder : Json.Decode.Decoder Action
actionDecoder =
    Json.Decode.map2 Action
        (field "currState" reduxDecoder)
        (field "type" Json.Decode.string)



-- MODEL


type alias ReduxModel =
    { value : Int
    , count : Int
    }


fallBackModel : Model
fallBackModel =
    { modelCount = 1000, modelValue = 3 }



-- ADAPTERS


reduxDecoder : Json.Decode.Decoder ReduxModel
reduxDecoder =
    Json.Decode.map2
        ReduxModel
        (field "value" Json.Decode.int)
        (field "count" Json.Decode.int)


reduxToModel : ReduxModel -> Model
reduxToModel reduxModel =
    { modelValue = reduxModel.value
    , modelCount = reduxModel.count
    }


modelToRedux : Model -> ReduxModel
modelToRedux model =
    { value = model.modelValue
    , count = model.modelCount
    }


modelToJSON : Model -> Json.Encode.Value
modelToJSON { modelValue, modelCount } =
    object
        [ ( "value", Json.Encode.int modelValue )
        , ( "count", Json.Encode.int modelCount )
        ]



-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update action model =
    case action of
        Increment actionBody ->
            let
                currState =
                    case Json.Decode.decodeValue actionDecoder actionBody of
                        Ok a ->
                            reduxToModel a.currentState

                        Err err ->
                            model
            in
                ( { model | modelValue = currState.modelValue + currState.modelCount }, Cmd.none )

        Decrement ->
            ( { model | modelValue = model.modelValue - model.modelCount }, Cmd.none )

        NoOp ->
            Debug.log ("Noop called")
                ( model, Cmd.none )


init : Json.Decode.Value -> ( Model, Cmd Msg )
init flags =
    case Json.Decode.decodeValue reduxDecoder flags of
        Ok f ->
            ( reduxToModel f, Cmd.none )

        Err err ->
            Debug.log ("Error parsing flag, falling back to default value => " ++ toString flags ++ err)
                (update
                    NoOp
                    fallBackModel
                )


main =
    Redux.programWithFlags
        { init = init
        , update = update
        , encode = modelToJSON
        , subscriptions = subscriptions
        }
