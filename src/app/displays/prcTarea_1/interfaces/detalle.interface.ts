import { ComentarioInterface } from "src/app/interfaces/comentario.interface";
import { ObjetoInterface } from "../../shrTarea_3/interfaces/objetos-comentario.interface";

export interface ComentariosDetalle {
    comentario: ComentarioInterface,
    files:      ObjetoInterface[]
}
