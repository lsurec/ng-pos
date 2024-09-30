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

    //funcion que va a realizar el consumo privado para obtener las empresas
    getObjetosProducto(
        token: string,
        producto: number,
        um: number,
        empresa: number
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Producto/imagenes/${producto}/${um}/${empresa}`, { headers: headers, observe: 'response' });
    }

    //funcion que va a realizar el consumo privado para obtener las empresas
    getValidateProduct(
        user: string,
        serie: string,
        tipoDocumento: number,
        estacion: number,
        empresa: number,
        bodega: number,
        tipoTransaccion: number,
        unidadMedida: number,
        producto: number,
        cantidad: number,
        tipoCambio: number,
        moneda: number,
        tipoPrecio: number,
        token: string,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "user": user,
                "serie": serie,
                "tipoDocumento": tipoDocumento,
                "estacion": estacion,
                "empresa": empresa,
                "bodega": bodega,
                "tipoTransaccion": tipoTransaccion,
                "unidadMedida": unidadMedida,
                "producto": producto,
                "cantidad": cantidad,
                "tipoCambio": tipoCambio,
                "moneda": moneda,
                "tipoPrecio": tipoPrecio,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Producto/validate`, { headers: headers, observe: 'response' });
    }


    //funcion que va a realizar el consumo privado para obtener las empresas
    getFormulaPrecioU(
        token: string,
        fechaIni: string,
        fechaFin: string,
        precioU: string,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "fechaIni": fechaIni,
                "fechaFin": fechaFin,
                "precioU": precioU,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Producto/formula/precio/unitario`, { headers: headers, observe: 'response' });
    }

   
    //funcion que va a realizar el consumo privado para obtner el sku de un producto enviando el id
    getSku(
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


    //funcion que va a realizar el consumo privado para obtner las bodegas y existencias en las que está un producto
    getBodegaProducto(
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

    //funcion que va a realizar el consumo privado para obtner los prodictos en una busqueda por descripcion
    getProduct(
        token: string,
        user: string,
        station: number,
        search: string,
        start: number,
        end: number,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "user": user,
                "station": station,
                "search": search,
                "start": start,
                "end": end,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Producto/buscar`, { headers: headers, observe: 'response' });
    }
   
    //funcion que va a realizar el consumo privado para obtner los tipos de precios para un producto
    getPrecios(
        user: string,
        token: string,
        bodega: number,
        producto: number,
        um: number,
        correntista:number,
        cuentaCta: string,
    ) {

        let headers = new HttpHeaders(
            {
                "Authorization": "bearer " + token,
                "bodega": bodega,
                "producto": producto,
                'um': um,
                'user': user,
                'correntista': correntista,
                'cuentaCta': cuentaCta,
            }
        )

        //consumo de api
        return this._http.get(`${this._urlBase}Producto/precios`, { headers: headers, observe: 'response' });
    }

    //funcion que va a realizar el consumo privado para obtner el factor de conversion para un producto
    getFactorConversion(
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
}