import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ResApiInterface } from "../../../interfaces/res-api.interface";
import { ResponseInterface } from "src/app/interfaces/response.interface";
import { PreferencesService } from "src/app/services/preferences.service";
import { EmpresaInterface } from "src/app/interfaces/empresa.interface";

@Injectable()

export class IdReferenciaService {

    private _user: string = "";
    private _token: string = "";
    //urlBase
    private _urlBase: string = PreferencesService.baseUrl;
    private _empresa!: EmpresaInterface;

    //inicializar http
    constructor(private _http: HttpClient) {
        //asignacion de urlBase
        //asignacion de urlBase
        this._user = PreferencesService.user; //usuario de la sesion
        this._token = PreferencesService.token;   //token de la sesion
        this._empresa = PreferencesService.empresa;
    }

    private _getIdReferencia(filtro: any) {
        //configurar headers
        let headers = new HttpHeaders(
            {
                "Content-Type": "application/json",
                "Authorization": "bearer " + this._token,
                "empresa": this._empresa.empresa.toString(),
                "filtro": filtro,
                "user": this._user,
            }
        )
        //consumo de api
        return this._http.get(`${this._urlBase}Tareas/idReferencia`, { headers: headers });
    }

    getIdReferencia(filtro: any): Promise<ResApiInterface> {
        //consumo del primer servicio
        return new Promise((resolve, reject) => {
            this._getIdReferencia(filtro).subscribe(
                //si esta correcto
                res => {
                    let response: ResponseInterface = <ResponseInterface>res;

                    let resApi: ResApiInterface = {
                        status: true,
                        response: response.data,
                        storeProcedure: response.storeProcedure
                    }
                    resolve(resApi);
                },
                //si algo sale mal
                err => {
                    let response: ResponseInterface = <ResponseInterface>err;

                    let resApi: ResApiInterface = {
                        status: false,
                        response: response.data,
                        storeProcedure: response.storeProcedure
                    }
                    resolve(resApi);
                }
            )
        })
    }
}