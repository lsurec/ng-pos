import { ComentarioInterface } from "src/app/interfaces/comentario.interface";
import { ObjetoInterface } from "../../shrTarea_3/interfaces/objetos-comentario.interface";
import { TareaCalendarioInterface } from "./tarea-calendario.interface";

export interface ComentariosDetalle {
    comentario: ComentarioInterface,
    files:      ObjetoInterface[]
}

export interface DetalleInterfaceCalendario {
    tarea: TareaCalendarioInterface;
    comentarios: ComentariosDetalle[]
}