port module MyReducer exposing (..)

{-| the Elm middleware will transform the action.type-s to camel case
-}

import Redux
import Json.Encode exposing (..)
import Json.Decode exposing (..)


{-| Ex with an action like :
{ type : "PLEASE_DECREMENT" }
will be sent to the "pleaseDecrement" port
-}
port increment : (Json.Encode.Value -> msg) -> Sub msg


port pleaseDecrement : (Json.Encode.Value -> msg) -> Sub msg


type alias Model =
    { modelValue : Int
    , modelCount : Int
    }


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.batch
        [ pleaseDecrement <| always Decrement
        , increment <| always Increment
        ]



-- MODEL


type alias ReduxModel =
    { value : Int
    , count : Int
    }


fallBackModel : Model
fallBackModel =
    { modelCount = 1000, modelValue = 3 }


init : Json.Decode.Value -> ( Model, Cmd Msg )
init flags =
    case flagsDecoder flags of
        Ok f ->
            ( reduxToModel f, Cmd.none )

        Err err ->
            Debug.log ("Error parsing flag, falling back to default value => " ++ toString flags ++ err)
                ( fallBackModel, Cmd.none )


flagsDecoder : Json.Decode.Value -> Result String ReduxModel
flagsDecoder =
    Json.Decode.decodeValue <|
        Json.Decode.map2 ReduxModel
            (field "value" Json.Decode.int)
            (field "count" Json.Decode.int)


reduxToModel : ReduxModel -> Model
reduxToModel reduxModel =
    { modelValue = reduxModel.value
    , modelCount = reduxModel.count
    }


modelToRedux : Model -> Json.Encode.Value
modelToRedux { modelValue, modelCount } =
    object
        [ ( "value", Json.Encode.int modelValue )
        , ( "count", Json.Encode.int modelCount )
        ]



-- ACTIONS


type Msg
    = NoOp
    | Increment
    | Decrement



-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update action model =
    case action of
        Increment ->
            ( { model | modelValue = model.modelValue + model.modelCount }, Cmd.none )

        Decrement ->
            ( { model | modelValue = model.modelValue - model.modelCount }, Cmd.none )

        NoOp ->
            ( model, Cmd.none )


main : Program Json.Decode.Value Model Msg
main =
    Redux.programWithFlags
        { init = init
        , update = update
        , encode = modelToRedux
        , subscriptions = subscriptions
        }
