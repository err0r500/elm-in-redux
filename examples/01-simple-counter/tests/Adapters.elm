module Adapters exposing (..)

import Expect exposing (Expectation)
import Fuzz exposing (Fuzzer, int, list, string)
import Test exposing (..)
import MyReducer exposing (..)
import Json.Encode exposing (..)


suite : Test
suite =
    describe "adapters"
        [ fuzz2 Fuzz.int Fuzz.int "modelToRedux" <|
            \int1 int2 ->
                let
                    model =
                        MyReducer.Model int1 int2

                    redux =
                        Json.Encode.object [ ( "value", Json.Encode.int int1 ), ( "count", Json.Encode.int int2 ) ]
                in
                    Expect.equal redux (MyReducer.modelToRedux model)
        , fuzz2 Fuzz.int Fuzz.int "flagsDecoder fail" <|
            \int1 int2 ->
                let
                    redux =
                        Json.Encode.object []
                in
                    Expect.err
                        (MyReducer.flagsDecoder redux)
        , fuzz2 Fuzz.int Fuzz.int "flagsDecoder success" <|
            \int1 int2 ->
                let
                    reduxModel =
                        MyReducer.ReduxModel int1 int2

                    flags =
                        Json.Encode.object [ ( "value", Json.Encode.int int1 ), ( "count", Json.Encode.int int2 ) ]
                in
                    Expect.equal (MyReducer.flagsDecoder flags) (Ok reduxModel)
        , fuzz2 Fuzz.int Fuzz.int "reduxToModel" <|
            \int1 int2 ->
                let
                    model =
                        MyReducer.Model int1 int2

                    redux =
                        MyReducer.ReduxModel int1 int2
                in
                    Expect.equal (MyReducer.reduxToModel redux) model
        ]
