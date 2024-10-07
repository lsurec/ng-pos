import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PreferencesService } from 'src/app/services/preferences.service';
import { SendOrderinterface } from '../interfaces/send-order.interface';

@Injectable()
export class RestaurantService {

    private _urlBase: string = PreferencesService.baseUrl;

    //inicializar http
    constructor(private _http: HttpClient) {
    }

    // función que va a realizar el consumo privado para obtener las empresas
    getLocations(
        typeDoc: number,
        enterprise: number,
        station: number,
        series: string,
        user: string,
        token: string,

    ) {
        const headers = new HttpHeaders({
            "Authorization": "bearer " + token,
            "typeDoc": typeDoc,
            "enterprise": enterprise,
            "station": station,
            "series": series,
            "user": user,
        });

        // consumo de api
        return this._http.get(`${this._urlBase}Restaurant/locations`, { headers: headers, observe: 'response' });
    }


    // función que va a realizar el consumo privado para obtener las empresas
    getTables(
        typeDoc: number,
        enterprise: number,
        station: number,
        series: string,
        elementAssigned: number,
        user: string,
        token: string,

    ) {
        const headers = new HttpHeaders({
            "Authorization": "bearer " + token,
            "typeDoc": typeDoc,
            "enterprise": enterprise,
            "station": station,
            "series": series,
            "elementAssigned": elementAssigned,
            "user": user,
            "token": token,
        });

        // consumo de api
        return this._http.get(`${this._urlBase}Restaurant/tables`, { headers: headers, observe: 'response' });
    }

    getAccountPin(
        token: string,
        enterprice: number,
        pin: string,

    ) {
        const headers = new HttpHeaders({
            "Authorization": "bearer " + token,
            "enterprise": enterprice,
            "pin": pin,
        });

        // consumo de api
        return this._http.get(`${this._urlBase}Restaurant/account/pin`, { headers: headers, observe: 'response' });
    }


    getClassifications(
        typeDoc: number,
        enterprise: number,
        station: number,
        series: string,
        user: string,
        token: string,
    ) {
        const headers = new HttpHeaders({
            "Authorization": "bearer " + token,
            "typeDoc": typeDoc,
            "enterprise": enterprise,
            "station": station,
            "series": series,
            "user": user,
            "token": token,
        });

        // consumo de api
        return this._http.get(`${this._urlBase}Restaurant/classifications`, { headers: headers, observe: 'response' });
    }

    getProducts(
        classification: number,
        station: number,
        user: string,
        token: string,
    ) {
        const headers = new HttpHeaders({
            "Authorization": "bearer " + token,
            "classification": classification,
            "station": station,
            "user": user,
        });

        // consumo de api
        return this._http.get(`${this._urlBase}Restaurant/classification/products`, { headers: headers, observe: 'response' });
    }

    getGarnish(
        product: number,
        um: number,
        user: string,
        token: string,
    ) {
        const headers = new HttpHeaders({
            "Authorization": "bearer " + token,
            "user": user,
            "product": product,
            "um": um,
        });

        // consumo de api
        return this._http.get(`${this._urlBase}Restaurant/product/garnish`, { headers: headers, observe: 'response' });
    }


    //funcion que va a realizar el consumo privado pra crear y/o actulaizar una cuenta correntista
    notifyComanda(
        order: SendOrderinterface,
        token: string,
    ) {
        let paramsStr = JSON.stringify(order); //JSON to String

        //confgurar headers
        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "Content-Type": "application/json",
            }
        )
        //consumo de api
        return this._http.post(`${this._urlBase}Restaurant/send/order`, paramsStr, { headers: headers, observe: 'response' });
    }




}