module M : Map.S = Map.Make (Int)
    (* ^ definition.module *)
        (* ^ reference.module *)
            (* ^ reference.implementation *)
                (* ^ reference.module *)
                    (* ^ reference.module *)
                          (* ^ reference.module *)

module F (X: Map.OrderedType) = struct
    (* ^ definition.module *)
          (* ^ reference.module *)
              (* ^ reference.implementation *)
  let compare = X.compare
             (* ^ reference.module *)
end

module type T = sig end
         (* ^ definition.interface *)

module rec M : T = struct end and N : T = struct end
                               (* ^ definition.module *)
