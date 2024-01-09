import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-in-construction',
  templateUrl: './in-construction.component.html',
  styleUrls: ['./in-construction.component.scss']
})
export class InConstructionComponent {

  constructor(
    private _location: Location,
    private _eventService: EventService,
  ) {
  }
  //regresar a la pantalla anterior
  goBack(): void {
    this._eventService.emitCustomEvent(false)
  }

}
