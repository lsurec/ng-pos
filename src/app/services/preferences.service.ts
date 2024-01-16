import { Injectable, Input } from "@angular/core";
import { EmpresaInterface } from "../interfaces/empresa.interface";
import { EstacionInterface } from "../interfaces/estacion.interface";
import { ErrorInterface } from "../interfaces/error.interface";

@Injectable()
export class PreferencesService {


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


    static closeSession() {
        localStorage.removeItem(PreferencesService.tokenStorageKey);
        sessionStorage.removeItem(PreferencesService.tokenKey);

    }

    //lenguaje
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

    //token de la secion
    @Input()
    static set token(value: string) {
        sessionStorage.setItem(this.tokenKey, value);
    }

    static get token(): string {
        let value = sessionStorage.getItem(this.tokenKey);
        if (!value) return "";
        return value;
    }

    @Input()
    static set userStorage(value: string) {
        localStorage.setItem(this.userStorageKey, value);
    }

    static get userStorage(): string {
        let value = localStorage.getItem(this.userStorageKey);
        if (!value) return "";
        return value;
    }


    @Input()
    static set user(value: string) {
        sessionStorage.setItem(this.userKey, value);
    }

    static get user(): string {
        let value = sessionStorage.getItem(this.userKey);
        if (!value) return "";
        return value;
    }


    @Input()
    static set empresa(value: EmpresaInterface) {
        sessionStorage.setItem(this.empresaKey, JSON.stringify(value));
    }

    static get empresa(): EmpresaInterface {
        let value = sessionStorage.getItem(this.empresaKey);
        return JSON.parse(value!);
    }

    @Input()
    static set estacion(value: EstacionInterface) {
        sessionStorage.setItem(this.estacionKey, JSON.stringify(value));
    }

    static get estacion(): EstacionInterface {
        let value = sessionStorage.getItem(this.estacionKey);
        return JSON.parse(value!);
    }

    @Input()
    static set theme(value: string) {
        localStorage.setItem(this.temaKey, value);
    }

    static get theme(): string {
        let value = localStorage.getItem(this.temaKey);
        if (!value) return "";
        return value;
    }

    @Input()
    static set baseUrl(value: string) {
        localStorage.setItem(this.urlKey, value);
    }

    static get baseUrl(): string {
        let value = localStorage.getItem(this.urlKey);
        if (!value) return "";
        return value;
    }


    @Input()
    static set conStorageStr(value: string) {
        localStorage.setItem(this.conStoragekey, value);
    }

    static get conStorageStr(): string {
        let value = localStorage.getItem(this.conStoragekey);
        if (!value) return "";
        return value;
    }

    @Input()
    static set conStr(value: string) {
        sessionStorage.setItem(this.conKey, value);
    }

    static get conStr(): string {
        let value = sessionStorage.getItem(this.conKey);
        if (!value) return "";
        return value;
    }

    @Input()
    static set error(value: ErrorInterface) {
        sessionStorage.setItem(this.errorKey, JSON.stringify(value));
    }

    static get error(): ErrorInterface {
        let value = sessionStorage.getItem(this.errorKey);
        return JSON.parse(value!);
    }

    @Input()
    static set tipoCambio(value: number) {
        sessionStorage.setItem(this.tipoCambioKey, value.toString());
    }

    static get tipoCambio(): number {
        let value = sessionStorage.getItem(this.tipoCambioKey);


        return parseFloat(value!);
    }


    @Input()
    static set documento(value: string) {
        localStorage.setItem(this.documentkey, value.toString());
    }

    static get documento(): string {
        let value = localStorage.getItem(this.documentkey);

        if (!value) return "";
        return value;
    }

}