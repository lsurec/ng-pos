export interface DocXMLInterface {
    id:                    number;
    userName:              string;
    fecha_Hora:            Date;
    d_Consecutivo_Interno: number;
    xml_Contenido:         string;
    certificador_DTE:      number;
    xml_Documento_Firmado: string;
    respuesta:             boolean;
    mensaje:               string;
    d_Id_Unc:              string;
}
