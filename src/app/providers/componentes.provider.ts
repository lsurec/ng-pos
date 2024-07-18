import { InConstructionComponent } from "../components/in-construction/in-construction.component";
import { SelectedConfigurationComponent } from "../components/selected-configuration/selected-configuration.component";
import { HomeConvertComponent } from "../displays/listado_Documento_Pendiente_Convertir/components/home-convert/home-convert.component";
import { CalendarioComponent } from "../displays/prcTarea_1/components/calendario/calendario.component";
import { FacturaComponent } from "../displays/prc_documento_3/components/factura/factura.component";
import { ListaTareasComponent } from "../displays/shrTarea_3/components/lista-tareas/lista-tareas.component";
import { TareasComponent } from "../displays/shrTarea_3/components/tareas/tareas.component";
import { ComponentesInterface } from "../interfaces/components.interface";

export const components: ComponentesInterface[] = [
    {
        id: "shrLocalConfig",
        componente: SelectedConfigurationComponent,
        visible: false,
    },
    {
        id: "En Construccion",
        componente: InConstructionComponent,
        visible: false,
    },
    {
        id: "prcdocumento_3",
        componente: FacturaComponent,
        visible: false,
    },
    {
        id: "Listado_Documento_Pendiente_Convertir",
        componente: HomeConvertComponent,
        visible: false,
    },
    {
        id: "Tareas",
        componente: ListaTareasComponent,
        visible: false,
    },
    {
        id: "Calenadario Tareas",
        componente: CalendarioComponent,
        visible: false,
    },
]