import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {

  @Input() regresar?: number; // decorate the property with @Input()

  error!: ErrorInterface;
  user: string = "";
  empresa?: EmpresaInterface;
  estacion?: EstacionInterface;

  constructor(
    private _location: Location,
    private _eventService: EventService,
  ) {

  }
  ngOnInit(): void {
    this.error = PreferencesService.error;
    this.user = PreferencesService.user;
    //TODO: SI no hay usuario traducir texto

    try {
      this.empresa = PreferencesService.empresa;
      this.estacion = PreferencesService.estacion;
    } catch (error) {

    }
  }

  //regresar a la pantalla anterior
  goBack() {
    if (!this.regresar) {
      this._location.back();
    }

    if (this.regresar == 1) {

      this._eventService.verDocumentoEvent(true);
      return;
    }
  }


}
