import { CatalogoAPIInterface } from "../interfaces/catalogo_api.interface";

export const catalogoApi:CatalogoAPIInterface[] = [
    {
      "Api": 1,
      "Nombre_Api": "certificar servicio infile local",
      "Url_Api": "http://192.168.0.7:9192/api/Fel/infile/{certificarInfile}",
      "Req_Autorizacion": "0",
      "Tipo_Metodo": 1,
      "Tipo_Respuesta": 1,
      "Url_Documentacion": "",
      "Certificador_DTE": 1,
      "UserName": "sa",
      "Fecha_Hora": "2024-07-15T19:39:02.17",
      "Tipo_Servicio": 1,
      "Nodo_FirmaDocumentoResponse": "",
      "Api_Certificacion": "1",
      "Api_Anulacion": "0"
    },
    {
      "Api": 2,
      "Nombre_Api": "certificar servicio infile",
      "Url_Api": "https://certificador.feel.com.gt/fel/procesounificado/transaccion/v2/xml",
      "Req_Autorizacion": "0",
      "Tipo_Metodo": 1,
      "Tipo_Respuesta": 1,
      "Url_Documentacion": "",
      "Certificador_DTE": 1,
      "UserName": "sa",
      "Fecha_Hora": "2024-07-15T19:46:27.443",
      "Tipo_Servicio": 1,
      "Nodo_FirmaDocumentoResponse": "",
      "Api_Certificacion": "1",
      "Api_Anulacion": "0"
    },
    {
      "Api": 3,
      "Nombre_Api": "certificar servicio tekra local",
      "Url_Api": "http://192.168.0.7:9192/api/Fel/tekra/certifica",
      "Req_Autorizacion": "0",
      "Tipo_Metodo": 1,
      "Tipo_Respuesta": 1,
      "Url_Documentacion": "",
      "Certificador_DTE": 2,
      "UserName": "sa",
      "Fecha_Hora": "2024-07-15T22:38:05.867",
      "Tipo_Servicio": 1,
      "Nodo_FirmaDocumentoResponse": "documentoCertificado",
      "Api_Certificacion": "1",
      "Api_Anulacion": "0"
    }
  ];