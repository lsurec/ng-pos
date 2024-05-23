export interface UsuarioInvitadoInterface {
    tarea_UserName: number;
    tarea:          number;
    userName_T:     string;
    estado:         number;
    userName:       string;
    fecha_Hora:     Date;
    m_UserName:     null;
    m_Fecha_Hora:   null;
}

export interface EnviarInvitadoInterface {
    tarea: number
    user_Res_Invi: string
    user: string
}

export interface InvitadoInterface {
    tarea_UserName: number;
    eMail:          string;
    userName:       string;
}