port module Redux exposing (program, programWithFlags)

{-| elm in redux middleware
@docs program, programWithFlags
-}

import Platform
import Json.Encode as Json


port elmOutPort : Json.Value -> Cmd msg


type alias ModelUpdater msg model =
    msg -> model -> ( model, Cmd msg )


type alias ModelEncoder model =
    model -> Json.Value


{-| Creates a [Program](http://package.elm-lang.org/packages/elm-lang/core/4.0.0/Platform#Program) that defines how your reducer works.
main = Redux.program(
{ init = init
, update = update
, subscriptions
})
-}
program :
    { init : ( model, Cmd msg )
    , update : ModelUpdater msg model
    , encode : ModelEncoder model
    , subscriptions : model -> Sub msg
    }
    -> Program Never model msg
program app =
    Platform.program
        { init = app.init
        , update = updater app.update app.encode
        , subscriptions = app.subscriptions
        }


{-| Creates a [ProgramWithFlags](http://package.elm-lang.org/packages/elm-lang/core/4.0.0/Platform#Program) that defines how your reducer works.
you can set your initial reducer state with the flags
ex :
main = Redux.programWithFlags(
{ init = init
, update = update
, encode = encode
, subscriptions
})
-}
programWithFlags :
    { init : Json.Value -> ( model, Cmd msg )
    , update : ModelUpdater msg model
    , encode : ModelEncoder model
    , subscriptions : model -> Sub msg
    }
    -> Program Json.Value model msg
programWithFlags app =
    Platform.programWithFlags
        { init = app.init
        , update = updater app.update app.encode
        , subscriptions = app.subscriptions
        }


updater : ModelUpdater msg model -> ModelEncoder model -> msg -> model -> ( model, Cmd msg )
updater updateFunc encoder actionMsg newModel =
    reducer encoder <| updateFunc actionMsg newModel


reducer : ModelEncoder model -> ( model, Cmd msg ) -> ( model, Cmd msg )
reducer encoder ( newModel, elmCmd ) =
    ( newModel
    , Cmd.batch
        [ elmCmd -- emit also the command from elm update func
        , elmOutPort <| encoder newModel
        ]
    )
