import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ResponseInterface } from 'src/app/interfaces/response.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ParamConvertDocInterface } from '../interfaces/param-convert-doc.interface';
import { UpdateDocInterface } from '../interfaces/update-doc.interface';
import { UpdateRefInterface } from '../interfaces/update-ref-interface';
import { NewTransactionInterface } from '../../prc_documento_3/interfaces/new-transaction.interface';

@Injectable()
export class ReceptionService {

    private _urlBase: string = PreferencesService.baseUrl;

    //inicializar http
    constructor(private _http: HttpClient) {
    }


    //funcion que va a realizar el consumo privado pra crear y/o actulaizar una cuenta correntista
    insertarTransaccion(
        token: string,
        transaction: NewTransactionInterface,
    ) {

        let paramsStr = JSON.stringify(transaction); //JSON to String
        //confgurar headers

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "Content-Type": "application/json",
            }
        )

        //consumo de api
        return this._http.post(`${this._urlBase}Recepcion/doc/insertar/transaccion`, paramsStr, { headers: headers, observe: 'response' });
    }

    //funcion que va a realizar el consumo privado pra crear y/o actulaizar una cuenta correntista
    anularTransaccion(
        token: string,
        transaction: NewTransactionInterface,
    ) {

        let paramsStr = JSON.stringify(transaction); //JSON to String


        //confgurar headers

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "Content-Type": "application/json",
            }
        )

        //consumo de api
        return this._http.post(`${this._urlBase}Recepcion/doc/anular/transaccion`, paramsStr, { headers: headers, observe: 'response' });


    }

    //funcion que va a realizar el consumo privado pra crear y/o actulaizar una cuenta correntista
    updateRef(
        token: string,
        doc: UpdateRefInterface,
    ) {

        let paramsStr = JSON.stringify(doc); //JSON to String


        //confgurar headers

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "Content-Type": "application/json",
            }
        )

        //consumo de api
        return this._http.post(`${this._urlBase}Recepcion/modify/doc/ref`, paramsStr, { headers: headers, observe: 'response' });
    }

    //funcion que va a realizar el consumo privado pra crear y/o actulaizar una cuenta correntista
    updateDocument(
        token: string,
        doc: UpdateDocInterface,
    ) {

        let paramsStr = JSON.stringify(doc); //JSON to String


        //confgurar headers

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "Content-Type": "application/json",
            }
        )

        //consumo de api
        return this._http.post(`${this._urlBase}Recepcion/modify/doc`, paramsStr, { headers: headers, observe: 'response' });


    }

    //funcion que va a realizar el consumo privado para obtener las empresas
    getDataPrint(
        token: string,
        user: string,
        documento: number,
        tipoDocumento: number,
        serieDocumento: string,
        empresa: number,
        localizacion: number,
        estacion: number,
        fechaReg: number,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "user": user,
                "documento": documento,
                "tipoDocumento": tipoDocumento,
                "serieDocumento": serieDocumento,
                "empresa": empresa,
                "localizacion": localizacion,
                "estacion": estacion,
                "fechaReg": fechaReg,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Recepcion/data/print`, { headers: headers, observe: 'response' });
    }

    //funcion que va a realizar el consumo privado para obtener las empresas
    getDetallesDocDestino(
        token: string,
        user: string,
        documento: number,
        tipoDocumento: number,
        serieDocumento: string,
        empresa: number,
        localizacion: number,
        estacion: number,
        fechaReg: number,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "user": user,
                "documento": documento,
                "tipoDocumento": tipoDocumento,
                "serieDocumento": serieDocumento,
                "empresa": empresa,
                "localizacion": localizacion,
                "estacion": estacion,
                "fechaReg": fechaReg,
            }
        )
        //consumo de api
        return this._http.get(`${this._urlBase}Recepcion/documento/destino/detalles`, { headers: headers, observe: 'response' });
    }

    //funcion que va a realizar el consumo privado para crear un nuevo documento
    postConvertir(
        token: string,
        document: ParamConvertDocInterface,
    ) {

        let paramsStr = JSON.stringify(document); //JSON to String


        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "Content-Type": "application/json",

            }
        )

        //consumo de api
        return this._http.post(`${this._urlBase}Recepcion/documento/convertir`, paramsStr, { headers: headers, observe: 'response' });

    }

    //funcion que va a realizar el consumo privado pra crear y/o actulaizar una cuenta correntista
    postActualizar(
        user: string,
        token: string,
        consecutivo: number,
        cantidad: number,
    ) {


        //confgurar headers

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "Content-Type": "application/json",
                "user": user,
                "consecutivo": consecutivo,
                "cantidad": cantidad,
            }
        )

        //consumo de api
        return this._http.post(`${this._urlBase}Recepcion/documento/actualizar`, null, { headers: headers, observe: 'response' });


    }


    //funcion que va a realizar el consumo privado para obtener las empresas
    getDetallesDocOrigen(
        token: string,
        user: string,
        documento: number,
        tipoDocumento: number,
        serieDocumento: string,
        empresa: number,
        localizacion: number,
        estacion: number,
        fechaReg: number,
    ) {


        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "user": user,
                "documento": documento,
                "tipoDocumento": tipoDocumento,
                "serieDocumento": serieDocumento,
                "empresa": empresa,
                "localizacion": localizacion,
                "estacion": estacion,
                "fechaReg": fechaReg,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Recepcion/documento/origen/detalles`, { headers: headers, observe: 'response' });
    }

    //funcion que va a realizar el consumo privado para obtener las empresas
    getTiposDoc(user: string, token: string) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Recepcion/tipos/documentos/${user}`, { headers: headers, observe: 'response' });
    }


    //funcion que va a realizar el consumo privado para obtener las empresas
    getPendindgDocs(
        user: string,
        token: string,
        doc: number,
        fechaIni: string,
        fechaFin: string,
        criterio: string,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "user": user,
                "doc": doc,
                "fechaIni": fechaIni,
                "fechaFin": fechaFin,
                "criterio": criterio ? criterio : "empty",
                "opcion": criterio ? 0 : 1
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Recepcion/pending/documents`, { headers: headers, observe: 'response' });
    }

    //funcion que va a realizar el consumo privado para obtener las empresas
    getDestinationDocs(
        user: string,
        token: string,
        doc: number,
        serie: string,
        empresa: number,
        estacion: number,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "user": user,
                "doc": doc,
                "serie": serie,
                "empresa": empresa,
                "estacion": estacion,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Recepcion/destination/docs`, { headers: headers, observe: 'response' });
    }

}