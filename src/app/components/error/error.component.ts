//Utilidades de Angular
import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';

//Servicios utilzados
import { EventService } from 'src/app/services/event.service';
import { PreferencesService } from 'src/app/services/preferences.service';

//Interfaces utilizadas
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { GlobalConvertService } from 'src/app/displays/listado_Documento_Pendiente_Convertir/services/global-convert.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {

  @Input() regresar?: number; //identificador para saber desde donde activa el evento para regresar.

  error!: ErrorInterface; //guardar el error 
  user: string = ""; //nombre del usuario que inicio sesion.
  //empresas y estaciones
  empresa?: EmpresaInterface;
  estacion?: EstacionInterface;

  constructor(
    //Instancia de servicios
    private _location: Location,
    private _eventService: EventService,
    private _globalConvertSrevice: GlobalConvertService,

  ) {
  }

  //Obtiene el error que va a mostrarse
  ngOnInit(): void {
    this.error = PreferencesService.error;
    this.user = PreferencesService.user;
    //TODO: SI no hay usuario traducir texto

    //Evitar el error sino hay estaciones despues del login
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
      case 7:
        //desde error de configuracion seleccionada
        this._eventService.regresarConfiguracionSeleccionadaEvent(true);
        break;
      case 8:
        //desde error de configuracion seleccionada
        this._eventService.regresarDesdeImpresionEvent(true);
        break;

      case 9:
        //desde error de tipos de documentos
        this._globalConvertSrevice.mostrarTiposDoc();
        break;
      case 10:
        //desde error de documento origen
        this._globalConvertSrevice.mostrarDocOrigen();
        break;
      case 11:
        //desde error de documento destino 
        this._globalConvertSrevice.mostrarDocDestino();
        break;
      case 12:
        //desde error de conversion de documento
        this._globalConvertSrevice.mostrarDocConversion();
        break;
      case 13:
        //desde error de detalle de conversion de documento
        this._globalConvertSrevice.mostrarDetalleDocConversion();
        break;
      case 14:
        //desde error de detalle de conversion de documento
        //TODO: no se aplicó
        this._eventService.regresarErrorProductoEvent(true);
        break;
      case 15:
        //desde error de pasos
        this._eventService.regresarAPasosEvent(true);
        break;
      case 16:
        //desde a registro de eerores
        this._eventService.verErroresEvent(true);
        break;
      default:
        this._location.back();

        break;
    }
  }

}
