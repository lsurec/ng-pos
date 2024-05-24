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


     //funcion que va a realizar el consumo privado para obtener las empresas
     private _getPagos(user: string, token: string, doc:number) {

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

    //funcion asyncrona con promesa  para obtener las empresas
    getPagos(user: string, token: string, doc:number): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getPagos(user, token,doc).subscribe(
                //si esta correcto
                res => {
                    let response: ResponseInterface = <ResponseInterface>res.body;

                    let resApi: ResApiInterface = {
                        status: true,
                        response: response.data,
                        storeProcedure: response.storeProcedure
                    }
                    resolve(resApi);
                },
                //si algo sale mal
                err => {
                    try {
                        let response: ResponseInterface = <ResponseInterface>err.error;

                        let resApi: ResApiInterface = {
                            status: false,
                            response: err.error,
                            storeProcedure: response.storeProcedure,
                            url: err.url,
                        }
                        resolve(resApi);
                    } catch (e) {


                        try {
                            let message = err.message;

                            let resApi: ResApiInterface = {
                                status: false,
                                response: message,
                                url: err.url,
                            }
                            resolve(resApi);

                        } catch (ex) {
                            let resApi: ResApiInterface = {
                                status: false,
                                response: err,
                                url: err.url,
                            }
                            resolve(resApi);
                        }


                    }
                }
            )
        }
        )
    }

    //funcion que va a realizar el consumo privado para obtener las empresas
    private _getDetalles(user: string, token: string, doc: number) {

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

    //funcion asyncrona con promesa  para obtener las empresas
    getDetalles(user: string, token: string, doc: number): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getDetalles(user, token, doc).subscribe(
                //si esta correcto
                res => {
                    let response: ResponseInterface = <ResponseInterface>res.body;

                    let resApi: ResApiInterface = {
                        status: true,
                        response: response.data,
                        storeProcedure: response.storeProcedure
                    }
                    resolve(resApi);
                },
                //si algo sale mal
                err => {
                    try {
                        let response: ResponseInterface = <ResponseInterface>err.error;

                        let resApi: ResApiInterface = {
                            status: false,
                            response: err.error,
                            storeProcedure: response.storeProcedure,
                            url: err.url,
                        }
                        resolve(resApi);
                    } catch (e) {


                        try {
                            let message = err.message;

                            let resApi: ResApiInterface = {
                                status: false,
                                response: message,
                                url: err.url,
                            }
                            resolve(resApi);

                        } catch (ex) {
                            let resApi: ResApiInterface = {
                                status: false,
                                response: err,
                                url: err.url,
                            }
                            resolve(resApi);
                        }


                    }
                }
            )
        }
        )
    }


    //funcion que va a realizar el consumo privado para obtener las empresas
    private _getEncabezados(
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

    //funcion asyncrona con promesa  para obtener las empresas
    getEncabezados(
        user: string,
        token: string,
        doc: number,
    ): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getEncabezados(user, token, doc).subscribe(
                //si esta correcto
                res => {
                    let response: ResponseInterface = <ResponseInterface>res.body;

                    let resApi: ResApiInterface = {
                        status: true,
                        response: response.data,
                        storeProcedure: response.storeProcedure
                    }
                    resolve(resApi);
                },
                //si algo sale mal
                err => {
                    try {
                        let response: ResponseInterface = <ResponseInterface>err.error;

                        let resApi: ResApiInterface = {
                            status: false,
                            response: err.error,
                            storeProcedure: response.storeProcedure,
                            url: err.url,
                        }
                        resolve(resApi);
                    } catch (e) {


                        try {
                            let message = err.message;

                            let resApi: ResApiInterface = {
                                status: false,
                                response: message,
                                url: err.url,
                            }
                            resolve(resApi);

                        } catch (ex) {
                            let resApi: ResApiInterface = {
                                status: false,
                                response: err,
                                url: err.url,
                            }
                            resolve(resApi);
                        }


                    }
                }
            )
        }
        )
    }

    //funcion que va a realizar el consumo privado pra obtener lo sultimos 10 docummentos hechos
    private _getDocument(
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

    //funcion asyncrona con promesa pra obtener lo sultimos 10 docummentos hechos
    getDocument(

        user: string,
        token: string,
        document: number,
    ): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getDocument(user, token, document,).subscribe(
                //si esta correcto
                res => {
                    let response: ResponseInterface = <ResponseInterface>res.body;

                    let resApi: ResApiInterface = {
                        status: true,
                        response: response.data,
                        storeProcedure: response.storeProcedure
                    }
                    resolve(resApi);
                },
                //si algo sale mal
                err => {

                    try {
                        let response: ResponseInterface = <ResponseInterface>err.error;

                        let resApi: ResApiInterface = {
                            status: false,
                            response: err.error,
                            storeProcedure: response.storeProcedure,
                            url: err.url,
                        }
                        resolve(resApi);
                    } catch (e) {


                        try {
                            let message = err.message;

                            let resApi: ResApiInterface = {
                                status: false,
                                response: message,
                                url: err.url,
                            }
                            resolve(resApi);

                        } catch (ex) {
                            let resApi: ResApiInterface = {
                                status: false,
                                response: err,
                                url: err.url,
                            }
                            resolve(resApi);
                        }


                    }
                }
            )
        }
        )
    }


    //funcion que va a realizar el consumo privado para crear un nuevo documento
    private _postDocument(
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

    //funcion asyncrona con promesa para crear un nuevo documento
    postDocument(
        token: string,
        document: PostDocumentInterface
    ): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._postDocument(token, document,).subscribe(
                //si esta correcto
                res => {
                    let response: ResponseInterface = <ResponseInterface>res.body;

                    let resApi: ResApiInterface = {
                        status: true,
                        response: response.data,
                        storeProcedure: response.storeProcedure
                    }
                    resolve(resApi);
                },
                //si algo sale mal
                err => {

                    try {
                        let response: ResponseInterface = <ResponseInterface>err.error;

                        let resApi: ResApiInterface = {
                            status: false,
                            response: err.error,
                            storeProcedure: response.storeProcedure,
                            url: err.url,
                        }
                        resolve(resApi);
                    } catch (e) {


                        try {
                            let message = err.message;

                            let resApi: ResApiInterface = {
                                status: false,
                                response: message,
                                url: err.url,
                            }
                            resolve(resApi);

                        } catch (ex) {
                            let resApi: ResApiInterface = {
                                status: false,
                                response: err,
                                url: err.url,
                            }
                            resolve(resApi);
                        }


                    }
                }
            )
        }
        )
    }


     //funcion que va a realizar el consumo privado para crear un nuevo documento
     private _updateDocument(
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
        return this._http.post(`${this._urlBase}Documento/update/estructura`, paramsStr, { headers: headers, observe: 'response' });

    }

    //funcion asyncrona con promesa para crear un nuevo documento
    updateDocument(
        token: string,
        document: PostDocumentInterface
    ): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._updateDocument(token, document,).subscribe(
                //si esta correcto
                res => {
                    let response: ResponseInterface = <ResponseInterface>res.body;

                    let resApi: ResApiInterface = {
                        status: true,
                        response: response.data,
                        storeProcedure: response.storeProcedure
                    }
                    resolve(resApi);
                },
                //si algo sale mal
                err => {

                    try {
                        let response: ResponseInterface = <ResponseInterface>err.error;

                        let resApi: ResApiInterface = {
                            status: false,
                            response: err.error,
                            storeProcedure: response.storeProcedure,
                            url: err.url,
                        }
                        resolve(resApi);
                    } catch (e) {


                        try {
                            let message = err.message;

                            let resApi: ResApiInterface = {
                                status: false,
                                response: message,
                                url: err.url,
                            }
                            resolve(resApi);

                        } catch (ex) {
                            let resApi: ResApiInterface = {
                                status: false,
                                response: err,
                                url: err.url,
                            }
                            resolve(resApi);
                        }


                    }
                }
            )
        }
        )
    }
}