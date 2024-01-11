import { Component } from '@angular/core';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.scss']
})
export class HistorialComponent {

  isLoading: boolean = false;
  constructor(
    private _eventService: EventService,
  ) {
  }

  goBack() {
    this._eventService.verDocumentoEvent(true);
  }
}
