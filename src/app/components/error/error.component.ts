import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent {

  constructor(
    private _location: Location
  ) {
  }

  //regresar a la pantalla anterior
  goBack() {
    this._location.back();
  }

}
