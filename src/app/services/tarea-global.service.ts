import { Injectable } from "@angular/core";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { TareaInterface } from "../displays/shrTarea_3/interfaces/tarea-user.interface";

@Injectable({
    providedIn: 'root',
})
export class GlobalTareasService {

    fechaInicialFormat?: string;
    fechaFinalFormat?: string;

    idPantalla: number = 0;

    idActualizar: number = 0;
    idUsuarios: number = 0;

    vistaDia: boolean = false;

    inputFechaInicial?: NgbDateStruct; //fecha inicial 
    inputFechaFinal?: NgbDateStruct;

    fechaIni?: Date;
    fechaFin?: Date;

    fechaIniCalendario?: Date;
    horaInicioMinima?: Date;
    horaFinMinima?: Date;

    copyFechaIni?: Date;
    copyFechaFin?: Date;

    fecha?: Date;
    // calenarioHoraInicioMinima?: Date;
    calendarioHoraFinMinima?: Date;
    fechaStruct?: NgbDateStruct;

    horaInicial!: string;
    horaFinal!: string;

    tareaDetalles?: TareaInterface;

    buscarUsuarios: number = 0;

}