export interface TareaCalendarioInterface {
    r_UserName:             string;
    tarea:                  number;
    descripcion:            string;
    fecha_Ini:              Date;
    fecha_Fin:              Date;
    referencia:             number;
    userName:               string;
    observacion_1:          string;
    nom_User:               string;
    nom_Cuenta_Correntista: any;
    des_Tipo_Tarea:         string;
    cuenta_Correntista:     any;
    cuenta_Cta:             any;
    contacto_1:             any;
    direccion_Empresa:      any;
    weekNumber:             number;
    cantidad_Contacto:      any;
    nombre_Contacto:        any;
    descripcion_Tarea:      string;
    texto:                  string;
    backColor:              string;
    estado:                 number;
    des_Tarea:              string;
    usuario_Responsable:    null | string;
    nivel_Prioridad:        number;
    nom_Nivel_Prioridad:    string;
}