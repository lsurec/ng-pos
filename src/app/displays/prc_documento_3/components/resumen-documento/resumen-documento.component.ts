import { Component } from '@angular/core';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-resumen-documento',
  templateUrl: './resumen-documento.component.html',
  styleUrls: ['./resumen-documento.component.scss']
})
export class ResumenDocumentoComponent {

  constructor(
    private _eventService: EventService,
  ) {
  }

  goBack() {
    this._eventService.verDocumentoEvent(true);
  }

}
