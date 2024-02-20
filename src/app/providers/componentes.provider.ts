import { InConstructionComponent } from "../components/in-construction/in-construction.component";
import { SelectedConfigurationComponent } from "../components/selected-configuration/selected-configuration.component";
import { OriginDocsComponent } from "../displays/listado_Documento_Pendiente_Convertir/components/origin-docs/origin-docs.component";
import { TypesDocsComponent } from "../displays/listado_Documento_Pendiente_Convertir/components/types-docs/types-docs.component";
import { FacturaComponent } from "../displays/prc_documento_3/components/factura/factura.component";
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
        id: "tipos_cot",
        componente: TypesDocsComponent,
        visible: false,
    },
    {
        id: "list_cot",
        componente: OriginDocsComponent,
        visible: false,
    }
]