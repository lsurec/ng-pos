export interface TareaInterface {
    id:                        number;
    tarea:                     null;
    iD_Tarea:                  number;
    usuario_Creador:           string;
    email_Creador:             string;
    usuario_Responsable:       any;
    descripcion:               string;
    fecha_Inicial:             Date;
    fecha_Final:               Date;
    referencia:                number;
    iD_Referencia:             string;
    descripcion_Referencia:    string;
    ultimo_Comentario:         null | string;
    fecha_Ultimo_Comentario:   Date | null;
    usuario_Ultimo_Comentario: null | string;
    tarea_Observacion_1:       string;
    tarea_Fecha_Ini:           Date;
    tarea_Fecha_Fin:           Date;
    tipo_Tarea:                number;
    descripcion_Tipo_Tarea:    string;
    estado_Objeto:             number;
    tarea_Estado:              string;
    usuario_Tarea:             string;
    backColor:                 string;
    nivel_Prioridad:           number;
    nom_Nivel_Prioridad:       string;
}