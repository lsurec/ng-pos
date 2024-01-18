import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ClienteInterface } from '../displays/prc_documento_3/interfaces/cliente.interface';

@Injectable({
    providedIn: 'root'
})

//Eventos que se activan en un componente hacia otro
export class EventService {


    //evento para salir de un modulo
    private customEventSubject = new Subject<any>();

    customEvent$ = this.customEventSubject.asObservable();

    emitCustomEvent(eventData: boolean) {
        this.customEventSubject.next(eventData);
    }


    //eventos para ver la pantalla crer nueva cuenta correntista
    private verCrear = new Subject<any>();

    verCrear$ = this.verCrear.asObservable();

    verCrearEvent(eventData: boolean) {
        this.verCrear.next(eventData);
    }

    //eventos para ver la pantalla para actualizar cuenta correntista
    private verActualizar = new Subject<any>();

    verActualizar$ = this.verActualizar.asObservable();

    verActualizarEvent(eventData: ClienteInterface) {
        this.verActualizar.next(eventData);
    }

    //Eventos para regresar a el modulo de factura 
    private verDocumento = new Subject<any>();

    verDocumento$ = this.verDocumento.asObservable();

    verDocumentoEvent(eventData: boolean) {
        this.verDocumento.next(eventData);
    }

    //eventos para ver la pantallad e confirmacion de docummento
    private verResumen = new Subject<any>();

    verResumen$ = this.verResumen.asObservable();

    verResumenEvent(eventData: boolean) {
        this.verResumen.next(eventData);
    }

    //Eventos para ver el historial de docuemntos recientes
    private verHistorial = new Subject<any>();

    verHistorial$ = this.verHistorial.asObservable();

    verHistorialEvent(eventData: boolean) {
        this.verHistorial.next(eventData);
    }

    //Eventos para ver informe de error en el modulo de facturas
    private verInformeError = new Subject<any>();

    verInformeError$ = this.verInformeError.asObservable();

    verInformeErrorEvent(eventData: boolean) {
        this.verInformeError.next(eventData);
    }

    //evento para regresar a pantalla actualizar cuenta correntista
    private regresarEditarCliente = new Subject<any>();

    regresarEditarCliente$ = this.regresarEditarCliente.asObservable();

    regresarEditarClienteEvent(eventData: boolean) {
        this.regresarEditarCliente.next(eventData);
    }

    //Evento para regresar a pantalla crear nueva cuenta correntista
    private regresarNuevaCuenta = new Subject<any>();

    regresarNuevaCuenta$ = this.regresarNuevaCuenta.asObservable();

    regresarNuevaCuentaEvent(eventData: boolean) {
        this.regresarNuevaCuenta.next(eventData);
    }

    //Eventos para regresar a pantalla de confirmacion de documento
    private regresarResumen = new Subject<any>();

    regresarResumen$ = this.regresarResumen.asObservable();

    regresarResumenEvent(eventData: boolean) {
        this.regresarResumen.next(eventData);
    }

    //eventos para regresar al historial de documentos
    private regresarHistorial = new Subject<any>();

    regresarHistorial$ = this.regresarHistorial.asObservable();

    regresarHistorialEvent(eventData: boolean) {
        this.regresarHistorial.next(eventData);
    }

    //eventos para regresae a la pantalla detalle de un documento previammente hecho
    private regresarResumenDocHistorial = new Subject<any>();

    regresarResumenDocHistorial$ = this.regresarResumenDocHistorial.asObservable();

    regresarResumenDocHistorialEvent(eventData: boolean) {
        this.regresarResumenDocHistorial.next(eventData);
    }
}