import { Injectable } from '@angular/core';
import { ResApiInterface } from '../interfaces/res-api.interface';
import { ResponseInterface } from '../interfaces/response.interface';
import { firstValueFrom, Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class ApiService {


    // función asíncrona para uso de apis, manejo de errores
    static async apiUse(api: () => Observable<any>): Promise<ResApiInterface> {
        try {
            //Uso del api
            const res = await firstValueFrom(api());

            //Resultado del api
            const response: ResponseInterface = res.body as ResponseInterface;
            //Retronarn respuesta correcta
            return {
                status: true,
                response: response.data,
                storeProcedure: response.storeProcedure
            };
        } catch (err: any) {
            //Si existen errores
            console.log(err);
            
            let resApi: ResApiInterface = {
                status: false,
                response: err?.error?.data || err.message || 'Unknown error',
                storeProcedure: err?.error?.storeProcedure,
                url: err.url
            };

            //Retonra el error con la interfaz requerida
            return resApi;
        }
    }

}