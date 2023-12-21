import { NotFoundComponent } from "../components/not-found/not-found.component";
import { ComponentesInterface } from "../interfaces/components.interface";

export const components: ComponentesInterface[] = [
    {
        id: "Calendario & Tarea",
        componente: NotFoundComponent,
        visible: false,
    },
    {
        id: "En Construccion",
        componente: NotFoundComponent,
        visible: false,
    },
    {
        id: "Configuración Local",
        componente: NotFoundComponent,
        visible: false,
    },
    {
        id: "Tarea",
        componente: NotFoundComponent,
        visible: false,
    },
    {
        id: "Detalle de Tarea",
        componente: NotFoundComponent,
        visible: false,
    }
]