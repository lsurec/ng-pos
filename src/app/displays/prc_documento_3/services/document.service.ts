import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ResponseInterface } from 'src/app/interfaces/response.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { PostDocumentInterface } from '../interfaces/post-document.interface';

@Injectable()
export class DocumentService {
    private _urlBase: string = PreferencesService.baseUrl;

    //inicializar http
    constructor(private _http: HttpClient) {
    }

    getStructureDocProcessed(
        user: string,
        token: string,
        filter: string,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "user": user,
                "filtro": filter ? filter : "empty",
                "allDocs": filter ? "false" : "true",
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Documento/structure/processed`, { headers: headers, observe: 'response' });
    }

    getStructureDosPendigs(
        user: string,
        token: string,
        userFilter: string,
        filter: string,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "user": user,
                "userFilter": userFilter ? userFilter : "empty",
                "filtro": filter ? filter : "empty",
                "allDocs": filter ? "false" : "true",
                "allUser": userFilter ? "false" : "true",
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Documento/structure/pendings`, { headers: headers, observe: 'response' });
    }


    //funcion que va a realizar el consumo privado para obtener las empresas
    getPagos(user: string, token: string, doc: number) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "consecutivo": doc,
                "user": user,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Documento/pagos`, { headers: headers, observe: 'response' });
    }

    //funcion que va a realizar el consumo privado para obtener las empresas
    getDetalles(user: string, token: string, doc: number) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "consecutivo": doc,
                "user": user,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Documento/detalles`, { headers: headers, observe: 'response' });
    }

    //funcion que va a realizar el consumo privado para obtener las empresas
    getEncabezados(
        user: string,
        token: string,
        doc: number,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "consecutivo": doc,
                "user": user,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Documento/encabezados`, { headers: headers, observe: 'response' });
    }

    //funcion que va a realizar el consumo privado pra obtener lo sultimos 10 docummentos hechos
    getDocument(
        user: string,
        token: string,
        document: number,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "consecutivo": document,
                "user": user,

            }
        )
        //consumo de api
        return this._http.get(`${this._urlBase}Documento`, { headers: headers, observe: 'response' });
    }

    //funcion que va a realizar el consumo privado para crear un nuevo documento
    postDocument(
        token: string,
        document: PostDocumentInterface
    ) {

        let paramsStr = JSON.stringify(document); //JSON to String

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "Content-Type": "application/json",
            }
        )

        //consumo de api
        return this._http.post(`${this._urlBase}Documento`, paramsStr, { headers: headers, observe: 'response' });
    }



    //funcion que va a realizar el consumo privado para crear un nuevo documento
    updateDocument(
        token: string,
        document: PostDocumentInterface,
        consecutivo: number,
    ) {

        let paramsStr = JSON.stringify(document); //JSON to String


        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "Content-Type": "application/json",
            }
        )

        //consumo de api
        return this._http.post(`${this._urlBase}Documento/update/estructura/${consecutivo}`, paramsStr, { headers: headers, observe: 'response' });
    }


    getDataComanda(
        user: string,
        token: string,
        consecutivo: number,
    ) {

        let paramsStr = JSON.stringify(document); //JSON to String


        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "Content-Type": "application/json",
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Printer/comanda/${user}/${consecutivo}`, { headers: headers, observe: 'response' });

    }


}