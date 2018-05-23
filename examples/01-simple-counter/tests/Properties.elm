module Properties exposing (..)

import Expect exposing (Expectation)
import Fuzz exposing (Fuzzer, int, list, string)
import Test exposing (..)
import MyReducer exposing (..)
import Json.Encode exposing (..)


decrement model =
    Tuple.first <| MyReducer.update Decrement model


increment model =
    Tuple.first <| MyReducer.update Increment model


noOP model =
    Tuple.first <| MyReducer.update NoOp model


suite : Test
suite =
    describe "update"
        [ fuzz2 Fuzz.int Fuzz.int "noop" <|
            \int1 int2 ->
                let
                    orig =
                        MyReducer.Model int1 int2

                    updated =
                        noOP orig
                in
                    Expect.all
                        [ \x -> Expect.true "value remains untouched" (updated.modelCount == orig.modelCount)
                        , \x -> Expect.true "count remains untouched" (updated.modelValue == orig.modelValue)
                        ]
                        (True)
        , fuzz2 Fuzz.int Fuzz.int "decrement" <|
            \int1 int2 ->
                --            Should test count so its never negative, here, just pass its absolute value
                let
                    orig =
                        MyReducer.Model int1 (abs int2)

                    updated =
                        decrement orig
                in
                    Expect.all
                        [ \x -> Expect.true "value remains untouched" (updated.modelCount == orig.modelCount)
                        , \x -> Expect.true "newCount is inferior to original one" (updated.modelValue <= orig.modelValue)
                        ]
                        (True)
        , fuzz2 Fuzz.int Fuzz.int "increment" <|
            \int1 int2 ->
                --            Should test count so its never negative, here, just pass its absolute value
                let
                    orig =
                        MyReducer.Model int1 (abs int2)

                    updated =
                        increment orig
                in
                    Expect.all
                        [ \x -> Expect.true "value remains untouched" (updated.modelCount == orig.modelCount)
                        , \x -> Expect.true "newCount is superior to original one" (updated.modelValue >= orig.modelValue)
                        ]
                        (True)
        ]
