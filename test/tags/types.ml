type t = int
  (* ^ definition.type *)
      (* ^ reference.type *)

type t = A of int | B
  (* ^ definition.type *)
      (* ^ definition.enum_variant *)
                 (* ^ definition.enum_variant *)

let a = A 0
     (* ^ reference.enum_variant *)

type t = [`A of int | `B]
  (* ^ definition.type *)
       (* ^ definition.enum_variant *)
                   (* ^ definition.enum_variant *)

let a = `A 0
     (* ^ reference.enum_variant *)

type t = {field : int}
  (* ^ definition.type *)
       (* ^ definition.field *)

let x = {field = 0}.field
      (* ^ reference.field *)
                 (* ^ reference.field *)
