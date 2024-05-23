export interface ComentarioInterface {
    tarea_Comentario: number;
    tarea:            number;
    comentario:       string;
    fecha_Hora:       Date;
    userName:         string;
    nameUser:         string;
}

export interface ComentarioPruebaInterface {
    id:               number;
    tarea_Comentario: number;
    fecha_Hora:       Date;
    comentario:       string;
    userName:         string;
    tarea:            number;
    email:            string;
    descripcion:      string;
    prioridad:        string;
    referencia_Id:    string;
    cliente:          string;
    comentarios:      number;
    name:             string;
    nombre_Usuario:   string;
}

export interface ComentarInterface {
    tarea:            number;
    userName:         string;
    comentario:       string;
}