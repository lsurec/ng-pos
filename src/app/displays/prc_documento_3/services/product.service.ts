import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ResponseInterface } from 'src/app/interfaces/response.interface';
import { PreferencesService } from 'src/app/services/preferences.service';

@Injectable()
export class ProductService {

    private _urlBase: string = PreferencesService.baseUrl;

    //inicializar http
    constructor(private _http: HttpClient) {
    }

    //funcion que va a realizar el consumo privado
    private _getSku(
        token: string,
        producto: number,
        um: number,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Producto/sku/${producto}/${um}`, { headers: headers, observe: 'response' });
    }

    //funcion asyncrona con promesa
    getSku(
        token: string,
        producto: number,
        um: number,
    ): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getSku(
                token,
                producto,
                um,
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

                    if (err.status == 400) {
                        let response: ResponseInterface = <ResponseInterface>err.error;

                        let resApi: ResApiInterface = {
                            status: false,
                            response: response.data,
                            storeProcedure: response.storeProcedure,
                            url: err.url,
                        }
                        resolve(resApi);
                        return;
                    }

                    let resApi: ResApiInterface = {
                        status: false,
                        response: err,
                        storeProcedure: ""
                    }

                    resolve(resApi);
                }
            )
        }
        )
    }

    //funcion que va a realizar el consumo privado
    private _getDescripcion(
        token: string,
        producto: number,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Producto/descripcion/${producto}`, { headers: headers, observe: 'response' });
    }

    //funcion asyncrona con promesa
    getDescripcion(
        token: string,
        producto: number,
    ): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getDescripcion(
                token,
                producto
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

                    if (err.status == 400) {
                        let response: ResponseInterface = <ResponseInterface>err.error;

                        let resApi: ResApiInterface = {
                            status: false,
                            response: response.data,
                            storeProcedure: response.storeProcedure,
                            url: err.url,
                        }
                        resolve(resApi);
                        return;
                    }

                    let resApi: ResApiInterface = {
                        status: false,
                        response: err,
                        storeProcedure: ""
                    }

                    resolve(resApi);
                }
            )
        }
        )
    }

    //funcion que va a realizar el consumo privado
    private _getBodegaProducto(
        user: string,
        token: string,
        empresa: number,
        estacion: number,
        producto: number,
        um: number,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "user": user,
                "empresa": empresa,
                "estacion": estacion,
                "producto": producto,
                "um": um,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Bodega/producto`, { headers: headers, observe: 'response' });
    }

    //funcion asyncrona con promesa
    getBodegaProducto(
        user: string,
        token: string,
        empresa: number,
        estacion: number,
        producto: number,
        um: number,
    ): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getBodegaProducto(
                user,
                token,
                empresa,
                estacion,
                producto,
                um,
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

                    if (err.status == 400) {
                        let response: ResponseInterface = <ResponseInterface>err.error;

                        let resApi: ResApiInterface = {
                            status: false,
                            response: response.data,
                            storeProcedure: response.storeProcedure,
                            url: err.url,
                        }
                        resolve(resApi);
                        return;
                    }

                    let resApi: ResApiInterface = {
                        status: false,
                        response: err,
                        storeProcedure: ""
                    }

                    resolve(resApi);
                }
            )
        }
        )
    }

    //funcion que va a realizar el consumo privado
    private _getProductId(
        token: string,
        id: string,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Producto/buscar/id/${id}`, { headers: headers, observe: 'response' });
    }

    //funcion asyncrona con promesa
    getProductId(
        token: string,
        id: string,
    ): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getProductId
                (
                    token,
                    id,
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

                        if (err.status == 400) {
                            let response: ResponseInterface = <ResponseInterface>err.error;

                            let resApi: ResApiInterface = {
                                status: false,
                                response: response.data,
                                storeProcedure: response.storeProcedure,
                                url: err.url,
                            }
                            resolve(resApi);
                            return;
                        }

                        let resApi: ResApiInterface = {
                            status: false,
                            response: err,
                            storeProcedure: ""
                        }

                        resolve(resApi);
                    }
                )
        }
        )
    }

    //funcion que va a realizar el consumo privado
    private _getProductDesc(
        token: string,
        descripcion: string,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Producto/buscar/descripcion/${descripcion}`, { headers: headers, observe: 'response' });
    }

    //funcion asyncrona con promesa
    getProductDesc(
        token: string,
        descripcion: string,
    ): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getProductDesc(
                token,
                descripcion,
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

                    if (err.status == 400) {
                        let response: ResponseInterface = <ResponseInterface>err.error;

                        let resApi: ResApiInterface = {
                            status: false,
                            response: response.data,
                            storeProcedure: response.storeProcedure,
                            url: err.url,
                        }
                        resolve(resApi);
                        return;
                    }

                    let resApi: ResApiInterface = {
                        status: false,
                        response: err,
                        storeProcedure: ""
                    }

                    resolve(resApi);
                }
            )
        }
        )
    }

    //funcion que va a realizar el consumo privado
    private _getPrecios(
        user: string,
        token: string,
        bodega: number,
        producto: number,
        um: number,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "bodega": bodega,
                "producto": producto,
                'um': um,
                'user': user,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Producto/precios`, { headers: headers, observe: 'response' });
    }

    //funcion asyncrona con promesa
    getPrecios(
        user: string,
        token: string,
        bodega: number,
        producto: number,
        um: number,
    ): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getPrecios(
                user,
                token,
                bodega,
                producto,
                um,
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

                    if (err.status == 400) {
                        let response: ResponseInterface = <ResponseInterface>err.error;

                        let resApi: ResApiInterface = {
                            status: false,
                            response: response.data,
                            storeProcedure: response.storeProcedure,
                            url: err.url,
                        }
                        resolve(resApi);
                        return;
                    }

                    let resApi: ResApiInterface = {
                        status: false,
                        response: err,
                        storeProcedure: ""
                    }

                    resolve(resApi);
                }
            )
        }
        )
    }

    //funcion que va a realizar el consumo privado
    private _getFactorConversion(
        user: string,
        token: string,
        bodega: number,
        producto: number,
        um: number,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "bodega": bodega,
                "producto": producto,
                'um': um,
                'user': user,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Producto/factor/conversion`, { headers: headers, observe: 'response' });
    }

    //funcion asyncrona con promesa
    getFactorConversion(
        user: string,
        token: string,
        bodega: number,
        producto: number,
        um: number,
    ): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getFactorConversion(
                user,
                token,
                bodega,
                producto,
                um,
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

                    if (err.status == 400) {
                        let response: ResponseInterface = <ResponseInterface>err.error;

                        let resApi: ResApiInterface = {
                            status: false,
                            response: response.data,
                            storeProcedure: response.storeProcedure,
                            url: err.url,
                        }
                        resolve(resApi);
                        return;
                    }

                    let resApi: ResApiInterface = {
                        status: false,
                        response: err,
                        storeProcedure: ""
                    }

                    resolve(resApi);
                }
            )
        }
        )
    }
}