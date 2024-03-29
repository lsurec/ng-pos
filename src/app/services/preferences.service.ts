import { Injectable, Input } from "@angular/core";
import { EmpresaInterface } from "../interfaces/empresa.interface";
import { EstacionInterface } from "../interfaces/estacion.interface";
import { ErrorInterface } from "../interfaces/error.interface";

//Serviico para guardar y obtner datos guardados en el storage (Preferencias de usuario)
@Injectable()
export class PreferencesService {


    //Llaves para los valores del storage
    private static readonly userKey = 'user';
    private static readonly userStorageKey: string = 'userStorage';
    private static readonly tokenKey: string = 'token';
    private static readonly tokenStorageKey: string = 'tokenStorage';
    private static readonly languageKey: string = 'language';
    private static readonly empresaKey: string = 'empresa';
    private static readonly estacionKey: string = 'estacion';
    private static readonly temaKey: string = 'tema';
    private static readonly urlKey: string = 'url';
    private static readonly conKey: string = 'conStr';
    private static readonly conStoragekey: string = 'conStorageStr';
    private static readonly errorKey: string = 'error';
    private static readonly tipoCambioKey: string = 'tipoCambio';
    private static readonly documentkey: string = 'document';
    private static readonly previewKey: string = 'preview';
    private static readonly impresoraKey: string = 'impresora';
    private static readonly printServiceKey: string = 'printlocal';
    private static readonly portKey: string = 'port';
    private static readonly copiesKey: string = 'copies';


    //Borrar datos al cerrar sesion
    static closeSession() {
        localStorage.removeItem(PreferencesService.tokenStorageKey);
        sessionStorage.removeItem(PreferencesService.tokenKey);

    }

    //lenguaje de la aplicacion
    @Input()
    static set lang(value: string) {
        localStorage.setItem(this.languageKey, value);
    }

    static get lang(): string {
        let value = localStorage.getItem(this.languageKey);
        if (!value) return "";
        return value;
    }

    //token permanente
    @Input()
    static set tokenStorage(value: string) {
        localStorage.setItem(this.tokenStorageKey, value);
    }

    static get tokenStorage(): string {
        let value = localStorage.getItem(this.tokenStorageKey);
        if (!value) return "";
        return value;
    }

    //token de la sesion
    @Input()
    static set token(value: string) {
        sessionStorage.setItem(this.tokenKey, value);
    }

    static get token(): string {
        let value = sessionStorage.getItem(this.tokenKey);
        if (!value) return "";
        return value;
    }

    //usuario permanente
    @Input()
    static set userStorage(value: string) {
        localStorage.setItem(this.userStorageKey, value);
    }

    static get userStorage(): string {
        let value = localStorage.getItem(this.userStorageKey);
        if (!value) return "";
        return value;
    }

    //usuario de la sesion 
    @Input()
    static set user(value: string) {
        sessionStorage.setItem(this.userKey, value);
    }

    static get user(): string {
        let value = sessionStorage.getItem(this.userKey);
        if (!value) return "";
        return value;
    }


    //empresa seleccionada
    @Input()
    static set empresa(value: EmpresaInterface) {
        sessionStorage.setItem(this.empresaKey, JSON.stringify(value));
    }

    static get empresa(): EmpresaInterface {
        let value = sessionStorage.getItem(this.empresaKey);
        return JSON.parse(value!);
    }

    //estacion seleccionada
    @Input()
    static set estacion(value: EstacionInterface) {
        sessionStorage.setItem(this.estacionKey, JSON.stringify(value));
    }

    static get estacion(): EstacionInterface {
        let value = sessionStorage.getItem(this.estacionKey);
        return JSON.parse(value!);
    }

    //thema seleccionado para la aplicacion
    @Input()
    static set theme(value: string) {
        localStorage.setItem(this.temaKey, value);
    }

    static get theme(): string {
        let value = localStorage.getItem(this.temaKey);
        if (!value) return "";
        return value;
    }

    //url para los servicios 
    @Input()
    static set baseUrl(value: string) {
        localStorage.setItem(this.urlKey, value);
    }

    static get baseUrl(): string {
        let value = localStorage.getItem(this.urlKey);
        if (!value) return "";
        return value;
    }


    //cadena de conexion ara fel permanente
    @Input()
    static set conStorageStr(value: string) {
        localStorage.setItem(this.conStoragekey, value);
    }

    static get conStorageStr(): string {
        let value = localStorage.getItem(this.conStoragekey);
        if (!value) return "";
        return value;
    }

    //cadena de conexion para fel de la sesion
    @Input()
    static set conStr(value: string) {
        sessionStorage.setItem(this.conKey, value);
    }

    static get conStr(): string {
        let value = sessionStorage.getItem(this.conKey);
        if (!value) return "";
        return value;
    }

    //informe de error
    @Input()
    static set error(value: ErrorInterface) {
        sessionStorage.setItem(this.errorKey, JSON.stringify(value));
    }

    static get error(): ErrorInterface {
        let value = sessionStorage.getItem(this.errorKey);
        return JSON.parse(value!);
    }

    //tipo cambio obtenido
    @Input()
    static set tipoCambio(value: number) {
        sessionStorage.setItem(this.tipoCambioKey, value.toString());
    }

    static get tipoCambio(): number {
        let value = sessionStorage.getItem(this.tipoCambioKey);


        return parseFloat(value!);
    }

    //documento local guardado
    @Input()
    static set documento(value: string) {
        localStorage.setItem(this.documentkey, value.toString());
    }

    static get documento(): string {
        let value = localStorage.getItem(this.documentkey);

        if (!value) return "";
        return value;
    }

    //vista previa 
    @Input()
    static set vistaPrevia(value: string) {
        localStorage.setItem(this.previewKey, value);
    }

    static get vistaPrevia(): string {
        let value = localStorage.getItem(this.previewKey);
        if (!value) return "";
        return value;
    }

    @Input()
    static set impresora(value: string) {
        localStorage.setItem(this.impresoraKey, value);
    }

    static get impresora(): string {
        let value = localStorage.getItem(this.impresoraKey);
        if (!value) return "";
        return value;
    }

    @Input()
    static set localPrint(value: string) {
        localStorage.setItem(this.printServiceKey, value);
    }

    static get localPrint(): string {
        let value = localStorage.getItem(this.printServiceKey);
        if (!value) return "";
        return value;
    }

    @Input()
    static set port(value: string) {
        localStorage.setItem(this.portKey, value);
    }

    static get port(): string {
        let value = localStorage.getItem(this.portKey);
        if (!value) return "";
        return value;
    }


    @Input()
    static set copies(value: string) {
        localStorage.setItem(this.copiesKey, value);
    }

    static get copies(): string {
        let value = localStorage.getItem(this.copiesKey);
        if (!value) return "";
        return value;
    }
}