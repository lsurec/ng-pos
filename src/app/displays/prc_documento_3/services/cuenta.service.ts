import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PreferencesService } from 'src/app/services/preferences.service';
import { CuentaCorrentistaInterface } from '../interfaces/cuenta-correntista';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ResponseInterface } from 'src/app/interfaces/response.interface';

@Injectable()
export class CuentaService {


    private _urlBase: string = PreferencesService.baseUrl;

    //inicializar http
    constructor(private _http: HttpClient) {
    }

    //funcion que va a realizar el consumo privado
    private _postCuenta(
        user: string,
        token: string,
        empresa: number,
        cuenta: CuentaCorrentistaInterface,
    ) {

        let paramsStr = JSON.stringify(cuenta); //JSON to String


        //confgurar headers

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "Content-Type": "application/json",
                "user": user,
                "empresa": empresa,
            }
        )

        //consumo de api
        return this._http.post(`${this._urlBase}Cuenta`, paramsStr, { headers: headers, observe: 'response' });


    }

    //funcion asyncrona con promesa
    postCuenta(
        user: string,
        token: string,
        empresa: number,
        cuenta: CuentaCorrentistaInterface,
    ): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._postCuenta(
                user,
                token,
                empresa,
                cuenta,
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
                    let response: ResponseInterface = <ResponseInterface>err.error;

                    let resApi: ResApiInterface = {
                        status: false,
                        response: err.error,
                        storeProcedure: response.storeProcedure,
                        url: err.url,
                    }
                    resolve(resApi);
                }
            )
        })
    }

    //obtner nombre de una cuenta por idCuenta
    private _getNombreCuenta(token: string, cuenta: number,) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Cuenta/nombre/${cuenta}`, { headers: headers, observe: 'response' });
    }

    //funcion asyncrona con promesa
    getNombreCuenta(token: string, cuenta: number,): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getNombreCuenta(token, cuenta).subscribe(
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

                    let response: ResponseInterface = <ResponseInterface>err.error;

                    let resApi: ResApiInterface = {
                        status: false,
                        response: err.error,
                        storeProcedure: response.storeProcedure,
                        url: err.url,
                    }
                    resolve(resApi);
                }
            )
        }
        )
    }


    //funcion que va a realizar el consumo privado
    private _getClient(
        user: string,
        token: string,
        empresa: number,
        filter: string,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "user": user,
                "filter": filter,
                "empresa": empresa,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Cuenta/cliente`, { headers: headers, observe: 'response' });
    }

    //funcion asyncrona con promesa
    getClient(
        user: string,
        token: string,
        empresa: number,
        filter: string,
    ): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getClient(
                user,
                token,
                empresa,
                filter,
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

                    console.log(err);
                    

                    let response: ResponseInterface = <ResponseInterface>err.error;

                    let resApi: ResApiInterface = {
                        status: false,
                        response: err.error,
                        storeProcedure: response.storeProcedure,
                        url: err.url,
                    }
                    resolve(resApi);
                }
            )
        }
        )
    }

    //funcion que va a realizar el consumo privado
    private _getSeller(
        user: string, 
        token: string,
        doc:number,
        serie:string,
        empresa:number,
        ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "user": user,
                "doc": doc,
                "serie": serie,
                "empresa": empresa,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Cuenta/vendedor`, { headers: headers, observe: 'response' });
    }

    //funcion asyncrona con promesa
    getSeller(
        user: string, 
        token: string,
        doc:number,
        serie:string,
        empresa:number,
    ): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getSeller(
                user,
                 token,
                 doc,
                 serie,
                 empresa,
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
                    let response: ResponseInterface = <ResponseInterface>err.error;

                    let resApi: ResApiInterface = {
                        status: false,
                        response: err.error,
                        storeProcedure: response.storeProcedure,
                        url: err.url,
                    }
                    resolve(resApi);
                }
            )
        }
        )
    }

    
}