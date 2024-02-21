import { Component } from '@angular/core';
import { components } from 'src/app/providers/componentes.provider';
import { EventService } from 'src/app/services/event.service';
import { GlobalConvertService } from '../../services/global-convert.service';

@Component({
  selector: 'app-destination-docs',
  templateUrl: './destination-docs.component.html',
  styleUrls: ['./destination-docs.component.scss']
})
export class DestinationDocsComponent {
  isLoading: boolean = false; //pantalla de carga
  showError: boolean = false;

  documentosDestino: any[] = [
    {
      documento: "Factura",
      serie: "FAC M"
    },
    {
      documento: "Documento 2",
      serie: "FAC M"
    }
  ]

  constructor(
    private _eventService: EventService,
    public globalConvertSrevice: GlobalConvertService,

  ) {

  }


  //regresear a menu (pantalla de inicio)
  goBack(): void {
    components.forEach(element => {
      element.visible = false;
    });

    this._eventService.emitCustomEvent(false);
  }

}
