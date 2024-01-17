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

    switch (this.regresar) {
      case 1:
        //desde documento
        this._eventService.verDocumentoEvent(true);
        break;

      case 2:
        //desde editar cuenta
        this._eventService.regresarEditarClienteEvent(true);
        break;

      case 3:
        //desde crear nueva cuenta
        this._eventService.regresarNuevaCuentaEvent(true);
        break;

      case 4:
        //desde resumen del documento
        this._eventService.regresarResumenEvent(true);
        break;

      case 5:
        //desde historial 
        this._eventService.regresarHistorialEvent(true);
        break;
      case 6:
        //desde documento abierto desde historial 
        this._eventService.regresarResumenDocHistorialEvent(true);
        break;

      default:
        this._location.back();

        break;
    }



  }


}
