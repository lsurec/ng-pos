import { ComentarioInterface } from "src/app/interfaces/comentario.interface";
import { InvitadoInterface } from "./invitado.interface";
import { ObjetoInterface } from "./objetos-comentario.interface";
import { ResponsablesInterface } from "./responsable.interface";
import { TareaInterface } from "./tarea.interface";

export interface DetalleInterface {
    tarea: TareaInterface;
    comentarios: ComentariosDetalle[]
    invitados: InvitadoInterface[]
    responsables: ResponsablesInterface[]
}

export interface ComentariosDetalle {
    comentario: ComentarioInterface,
    files: ObjetoInterface[]
}

export interface ActualizarTareaInterface {
    tarea: TareaInterface,
    responsable: ResponsablesInterface[],
    invitados: InvitadoInterface[],
}