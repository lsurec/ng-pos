import { CatalogoParametroInterface } from "../interfaces/catalogo_parametro.interface";

export const catalogoParametro:CatalogoParametroInterface[] = [
    {
        "Parametro": 1,
        "Descripcion": "Credenciales y documento para certificar (infile)",
        "Api": 1,
        "Tipo_Dato": 5,
        "Plantilla": "usuarioFirma:{UsuarioFirma},llaveFirma:{LlaveFirma},usuarioApi:{UsuarioApi},llaveApi:{LlaveApi},DocXML:{xml_Contenido}",
        "Tipo_Parametro": 2,
        "Plantilla_Xml": ""
    },
    {
        "Parametro": 2,
        "Descripcion": "credenciales y docuemnto para certificar (tekra)",
        "Api": 3,
        "Tipo_Dato": 5,
        "Plantilla": "pn_usuario:{pn_usuario},pn_clave:{pn_clave},pn_cliente:{pn_cliente},pn_contrato:{pn_contrato},pn_id_origen:{pn_id_origen},pn_ip_origen:{pn_ip_origen},pn_firmar_emisor:{pn_firmar_emisor},document:{xml_Contenido}",
        "Tipo_Parametro": 2,
        "Plantilla_Xml": ""
    }
];