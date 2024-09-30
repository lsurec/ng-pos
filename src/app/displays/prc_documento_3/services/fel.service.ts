import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ResponseInterface } from 'src/app/interfaces/response.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { DataInfileInterface } from '../interfaces/data.infile.interface';
import { ParamUpdateXMLInterface } from '../interfaces/param-update-xml.interface';

@Injectable()
export class FelService {
    private _urlBase: string = PreferencesService.baseUrl;

    //inicializar http
    constructor(private _http: HttpClient) {
    }

    //funcion que va a realizar el consumo privado para obtener las empresas
    getReceptor(
        token: string,
        llave:string,
        prefijo:string,
        recpetor:string,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "llave": llave,
                "prefijo": prefijo,
                "receptor": recpetor,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Fel/consulta/receptor`, { headers: headers, observe: 'response' });
    }

    //funcion que va a realizar consumo privado para validar lascredenciales dl usuario y obtner un token de acceso
    postXmlUpdate(
        token: string,
        credenciales: ParamUpdateXMLInterface) {
        //configurar headers
        let paramsStr = JSON.stringify(credenciales); //JSON to String
        let headers = new HttpHeaders({ "Content-Type": "application/json", "Authorization": "bearer " + token, })

        //consumo de api
        return this._http.post(`${this._urlBase}Fel/doc/xml`, paramsStr, { headers: headers, observe: 'response' });
    }

   

    //funcion que va a realizar consumo privado para validar lascredenciales dl usuario y obtner un token de acceso
    postInfile(
        api: string,
        data: DataInfileInterface,
        token: string,
    ) {
        //configurar headers
        let paramsStr = JSON.stringify(data); //JSON to String
        let headers = new HttpHeaders({ "Content-Type": "application/json", "Authorization": "bearer " + token, })

        //consumo de api
        return this._http.post(`${this._urlBase}Fel/infile/${api}`, paramsStr, { headers: headers, observe: 'response' });

    }

   

    //funcion que va a realizar el consumo privado para obtener las empresas
    private _getParamsApi(
        api: number,
        user: string,
        token: string
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Fel/parametros/${api}/${user}`, { headers: headers, observe: 'response' });
    }

    //funcion asyncrona con promesa  para obtener las empresas
    getParamsApi(
        api: number,
        user: string,
        token: string
    ): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getParamsApi(
                api,
                user,
                token,
            ).subscribe(
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
            );
        });
    }

    //funcion que va a realizar el consumo privado para obtener las empresas
    private _getCredenciales(
        certificador: number,
        empresa: number,
        user: string,
        token: string
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Fel/credenciales/${certificador}/${empresa}/${user}`, { headers: headers, observe: 'response' });
    }

    //funcion asyncrona con promesa  para obtener las empresas
    getCredenciales(
        certificador: number,
        empresa: number,
        user: string,
        token: string
    ): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getCredenciales(
                certificador,
                empresa,
                user,
                token,
            ).subscribe(
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
            );
        });
    }


    //funcion que va a realizar el consumo privado para obtener las empresas
    private _getDocXmlCert(
        user: string,
        token: string,
        consecutivo: number,

    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Fel/xml/cert/${user}/${consecutivo}`, { headers: headers, observe: 'response' });
    }

    //funcion asyncrona con promesa  para obtener las empresas
    getDocXmlCert(
        user: string,
        token: string,
        consecutivo: number,

    ): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getDocXmlCert(
                user,
                token,
                consecutivo,
            ).subscribe(
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
            );
        });
    }


    ///-------------------------

    //funcion que va a realizar el consumo privado para obtener las empresas
    private _getDocXml(
        user: string,
        token: string,
        uuid: string,


    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "uuid": uuid,
                "user": user,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Fel/doc/xml`, { headers: headers, observe: 'response' });
    }

    //funcion asyncrona con promesa  para obtener las empresas
    getDocXml(
        user: string,
        token: string,
        uuid: string,
    ): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getDocXml(
                user,
                token,
                uuid
            ).subscribe(
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
            );
        });
    }

    private _getApi(
        user: string,
        token: string,
        api: number,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Fel/api/${api}/${user}`, { headers: headers, observe: 'response' });
    }

    getApi(
        user: string,
        token: string,
        api: number,
    ): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getApi(
                user,
                token,
                api,
            ).subscribe(
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
        });
    }


}