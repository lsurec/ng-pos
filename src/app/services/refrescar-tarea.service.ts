import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { TareaInterface } from '../displays/prcTarea_1/interfaces/tarea-user.interface';
import { TareaCalendarioInterface } from '../displays/shrTarea_3/interfaces/tarea-calendario.interface';

@Injectable({
    providedIn: 'root'
})

export class RefrescarService {
    // Creamos un BehaviorSubject de tipo boolean
    public tarea = new BehaviorSubject<boolean>(false);

    //tareas
    tareaCompleta!: TareaInterface;
    public tareas = new BehaviorSubject<TareaInterface>(this.tareaCompleta);

    //calendario
    tareaCalendario!: TareaCalendarioInterface;
    public tareasCalendario = new BehaviorSubject<TareaCalendarioInterface>(this.tareaCalendario)


}