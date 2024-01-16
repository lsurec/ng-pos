import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ClienteInterface } from '../displays/prc_documento_3/interfaces/cliente.interface';

@Injectable({
    providedIn: 'root'
})
export class EventService {
    private customEventSubject = new Subject<any>();

    customEvent$ = this.customEventSubject.asObservable();

    emitCustomEvent(eventData: boolean) {
        this.customEventSubject.next(eventData);
    }


    private verCrear = new Subject<any>();

    verCrear$ = this.verCrear.asObservable();

    verCrearEvent(eventData: boolean) {
        this.verCrear.next(eventData);
    }


    private verActualizar = new Subject<any>();

    verActualizar$ = this.verActualizar.asObservable();

    verActualizarEvent(eventData: ClienteInterface) {
        this.verActualizar.next(eventData);
    }

    private verDocumento = new Subject<any>();

    verDocumento$ = this.verDocumento.asObservable();

    verDocumentoEvent(eventData: boolean) {
        this.verDocumento.next(eventData);
    }

    private verResumen = new Subject<any>();

    verResumen$ = this.verResumen.asObservable();

    verResumenEvent(eventData: boolean) {
        this.verResumen.next(eventData);
    }

    private verHistorial = new Subject<any>();

    verHistorial$ = this.verHistorial.asObservable();

    verHistorialEvent(eventData: boolean) {
        this.verHistorial.next(eventData);
    }

    private verInformeError = new Subject<any>();

    verInformeError$ = this.verInformeError.asObservable();

    verInformeErrorEvent(eventData: boolean) {
        this.verInformeError.next(eventData);
    }

    private regresarEditarCliente = new Subject<any>();

    regresarEditarCliente$ = this.regresarEditarCliente.asObservable();

    regresarEditarClienteEvent(eventData: boolean) {
        this.regresarEditarCliente.next(eventData);
    }

    private regresarNuevaCuenta = new Subject<any>();

    regresarNuevaCuenta$ = this.regresarNuevaCuenta.asObservable();

    regresarNuevaCuentaEvent(eventData: boolean) {
        this.regresarNuevaCuenta.next(eventData);
    }

    private regresarResumen = new Subject<any>();

    regresarResumen$ = this.regresarResumen.asObservable();

    regresarResumenEvent(eventData: boolean) {
        this.regresarResumen.next(eventData);
    }

    private regresarHistorial = new Subject<any>();

    regresarHistorial$ = this.regresarHistorial.asObservable();

    regresarHistorialEvent(eventData: boolean) {
        this.regresarHistorial.next(eventData);
    }

    private regresarResumenDocHistorial = new Subject<any>();

    regresarResumenDocHistorial$ = this.regresarResumenDocHistorial.asObservable();

    regresarResumenDocHistorialEvent(eventData: boolean) {
        this.regresarResumenDocHistorial.next(eventData);
    }
}