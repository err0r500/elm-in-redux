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
    { currentState : Model
    , actionType : String
    }


actionDecoder : Json.Decode.Decoder Action
actionDecoder =
    Json.Decode.map2 Action
        (field "currState" reduxToModel)
        (field "type" Json.Decode.string)



-- MODEL


type alias Model =
    { value : Int
    , count : Int
    }


fallBackModel : Model
fallBackModel =
    { count = 1000, value = 3 }



-- ADAPTERS


reduxToModel : Json.Decode.Decoder Model
reduxToModel =
    Json.Decode.map2
        Model
        (field "value" Json.Decode.int)
        (field "count" Json.Decode.int)


modelToRedux : Model -> Json.Encode.Value
modelToRedux { value, count } =
    object
        [ ( "value", Json.Encode.int value )
        , ( "count", Json.Encode.int count )
        ]



-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Increment actionBody ->
            let
                currState =
                    case Json.Decode.decodeValue actionDecoder actionBody of
                        Ok action ->
                            action.currentState

                        Err err ->
                            model
            in
                ( { model | value = currState.value + currState.count }, Cmd.none )

        Decrement ->
            ( { model | value = model.value - model.count }, Cmd.none )

        NoOp ->
            ( model, Cmd.none )


init : Json.Decode.Value -> ( Model, Cmd Msg )
init flags =
    case Json.Decode.decodeValue reduxToModel flags of
        Ok model ->
            ( model, Cmd.none )

        Err err ->
            Debug.log ("Error parsing flag, falling back to default value => " ++ toString flags ++ err)
                ( fallBackModel, Cmd.none )


main : Program Json.Decode.Value Model Msg
main =
    Redux.programWithFlags
        { init = init
        , update = update
        , encode = modelToRedux
        , subscriptions = subscriptions
        }
