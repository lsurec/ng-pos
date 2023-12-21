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
}