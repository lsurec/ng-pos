export interface UsuarioResponsableInterface {
    tarea:               number;
    t_UserName:          string;
    estado:              number;
    userName:            string;
    fecha_Hora:          Date;
    m_UserName:          null;
    m_Fecha_Hora:        null;
    consecutivo_Interno: number;
}

export interface EnviarResponsableInterface {
    tarea: number
    user_Res_Invi: string
    user: string
}

export interface ResponsablesInterface {
    t_UserName:          string;
    estado:              string;
    userName:            string;
    fecha_Hora:          Date;
    m_UserName:          null | string;
    m_Fecha_Hora:        Date | null;
    dHm:                 null | string;
    consecutivo_Interno: number;
}