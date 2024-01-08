import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

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

    verActualizarEvent(eventData: boolean) {
        this.verActualizar.next(eventData);
    }

    private verDocumento = new Subject<any>();

    verDocumento$ = this.verDocumento.asObservable();

    verDocumentoEvent(eventData: boolean) {
        this.verDocumento.next(eventData);
    }

}