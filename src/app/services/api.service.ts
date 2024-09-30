import { Injectable } from '@angular/core';
import { ResApiInterface } from '../interfaces/res-api.interface';
import { ResponseInterface } from '../interfaces/response.interface';
import { firstValueFrom, Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class ApiService {


    // función asíncrona para obtener las empresas con menos código repetitivo
    static async apiUse(api: () => Observable<any>): Promise<ResApiInterface> {
        try {
            const res = await firstValueFrom(api());
            const response: ResponseInterface = res.body as ResponseInterface;

            return {
                status: true,
                response: response.data,
                storeProcedure: response.storeProcedure
            };
        } catch (err: any) {
            let resApi: ResApiInterface = {
                status: false,
                response: err?.error?.data || err.message || 'Unknown error',
                storeProcedure: err?.error?.storeProcedure,
                url: err.url
            };
            return resApi;
        }
    }

}