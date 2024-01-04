import { Location } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-in-construction',
  templateUrl: './in-construction.component.html',
  styleUrls: ['./in-construction.component.scss']
})
export class InConstructionComponent {

  constructor(
    private _location: Location
  ) {
  }

  //regresar a la pantalla anterior
  goBack() {
    this._location.back();
  }

  //  //regresar a la pantalla anterior
  //  backPage(): void {
  //   this._eventService.emitCustomEvent(false)
  // }

}
