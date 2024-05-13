export interface APIInterface {
    api:                         number;
    nombre_Api:                  string;
    url_Api:                     string;
    req_Autorizacion:            boolean;
    tipo_Metodo:                 number;
    tipo_Respuesta:              number;
    url_Documentacion:           string;
    certificador_DTE:            number;
    userName:                    string;
    fecha_Hora:                  Date;
    tipo_Servicio:               number;
    nom_Tipo_Metodo:             string;
    nom_Tipo_Respuesta:          string;
    nom_Certificador:            string;
    nom_Tipo_Servicio:           string;
    nodo_FirmaDocumentoResponse: string;
}
