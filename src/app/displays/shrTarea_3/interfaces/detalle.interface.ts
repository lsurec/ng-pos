import { ComentarioInterface } from "src/app/interfaces/comentario.interface";
import { ObjetoInterface } from "../../prcTarea_1/interfaces/objetos-comentario.interface";

export interface ComentariosDetalle {
    comentario: ComentarioInterface,
    files:      ObjetoInterface[]
}
