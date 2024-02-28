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

    //funcion que va a realizar el consumo privado para obtner el sku de un producto enviando el id
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

    //funcion asyncrona con promesa para obtner el sku de un producto enviando el id
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

    //funcion que va a realizar el consumo privado para obtner las bodegas y existencias en las que está un producto
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
        return this._http.get(`${this._urlBase}producto/Bodega`, { headers: headers, observe: 'response' });
    }

    //funcion asyncrona con promesa  para obtner las bodegas y existencias en las que está un producto
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

    //funcion que va a realizar el consumo privado  para obtner los productos en una busqueda por sku
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

    //funcion asyncrona con promesa para obtner los productos en una busqueda por sku
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

    //funcion que va a realizar el consumo privado para obtner los prodictos en una busqueda por descripcion
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

    //funcion asyncrona con promesa para obtner los prodictos en una busqueda por descripcion
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

    //funcion que va a realizar el consumo privado para obtner los tipos de precios para un producto
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

    //funcion asyncrona con promesa para obtner los tipos de precios para un producto
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

    //funcion que va a realizar el consumo privado para obtner el factor de conversion para un producto
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

    //funcion asyncrona con promesa para obtner el factor de conversion para un producto
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