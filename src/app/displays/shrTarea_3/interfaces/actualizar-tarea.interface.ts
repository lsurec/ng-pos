export interface ActualizarDetalleTareaInterface{
    tarea:            number;
    userName:         string;
    actualizacion:    number;
}

export interface ActualizarNivelPrioridadInterface{
    tarea:     number;
    userName:  string;
    prioridad: number;
}

export interface ActualizarEstadoInterface{
    tarea:            number;
    userName:         string;
    estado:           number;
}