let f x = Fun.id x
 (* ^ definition.function *)
           (* ^ reference.call *)

let f = fun x -> f @@ x |> f
 (* ^ definition.function *)
              (* ^ reference.call *)
                        (* ^ reference.call *)

external f : 'a -> 'a = "id"
      (* ^ definition.function *)

let ( + ) a b = a + b
   (* ^ definition.operator *)
               (* ^ reference.call *)
