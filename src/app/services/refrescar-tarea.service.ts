import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TareaCalendarioInterface } from '../displays/prcTarea_1/interfaces/tarea-calendario.interface';
import { TareaInterface } from '../displays/shrTarea_3/interfaces/tarea.interface';

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