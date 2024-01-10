import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { DataUserService } from 'src/app/displays/prc_documento_3/services/data-user.service';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-in-construction',
  templateUrl: './in-construction.component.html',
  styleUrls: ['./in-construction.component.scss']
})
export class InConstructionComponent {

  // TODO:Centrar contenido

  constructor(
    private _location: Location,
    private _eventService: EventService,
    public dataUserService:DataUserService,
    
  ) {
  }
  //regresar a la pantalla anterior
  goBack(): void {
    this._eventService.emitCustomEvent(false)
  }

}
