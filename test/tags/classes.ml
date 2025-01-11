class zero = object
   (* ^ definition.class *)
  val v = 0
  method get = v
      (* ^ definition.method *)
end

let v = new zero
         (* ^ reference.class *)

let x = v#get
       (* ^ reference.call *)
