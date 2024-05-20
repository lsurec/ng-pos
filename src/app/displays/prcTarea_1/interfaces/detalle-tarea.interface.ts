import { ComentarioInterface } from "src/app/interfaces/comentario.interface";
import { InvitadosInterface } from "./invitado.interface";
import { ObjetoInterface } from "./objetos-comentario.interface";
import { ResponsablesInterface } from "./responsable.interface";
import { TareaInterface } from "./tarea-user.interface";

export interface DetalleInterface {
    tarea: TareaInterface;
    comentarios: ComentariosDetalle[]
    invitados: InvitadosInterface[]
    responsables: ResponsablesInterface[]
}

export interface ComentariosDetalle {
    comentario: ComentarioInterface,
    files: ObjetoInterface[]
}

export interface ActualizarTareaInterface {
    tarea: TareaInterface,
    responsable: ResponsablesInterface[],
    invitados: InvitadosInterface[],
}