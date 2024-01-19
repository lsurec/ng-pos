import { InConstructionComponent } from "../components/in-construction/in-construction.component";
import { LocalConfigComponent } from "../components/local-config/local-config.component";
import { NotFoundComponent } from "../components/not-found/not-found.component";
import { SelectedConfigurationComponent } from "../components/selected-configuration/selected-configuration.component";
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
    }
]