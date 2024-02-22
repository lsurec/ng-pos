import { Injectable } from '@angular/core';
import { TypesDocConvertInterface } from '../interfaces/types-doc-convert.interface';
import { OriginDocInterface } from '../interfaces/origin-doc.interface';


@Injectable({
    providedIn: 'root',
})
export class GlobalConvertService {
    regresar: number = 0;

    isLoading: boolean = false; //pantalla de carga
    showError: boolean = false;
    verTiposDocConversion: boolean = false;
    verDocOrigen: boolean = false;
    verDocDestino: boolean = false;
    verDocConversion: boolean = false;
    verDetalleDocConversion: boolean = false;

    docSelect?: TypesDocConvertInterface;
    docs: TypesDocConvertInterface[] = [];
    screen: string = "";
    docsOrigin: OriginDocInterface[] = [];

    docDestino?: number;
    //vacio regresar a TypesDocsComponent
    //si tiene algo regresar a hoe

    mostrarTiposDoc() {
        this.verTiposDocConversion = true;
        this.isLoading = false;
        this.showError = false;
        this.verDocOrigen = false;
        this.verDocDestino = false;
        this.verDocConversion = false;
        this.verDetalleDocConversion = false;
    }

    cargarPantalla() {
        this.isLoading = true;
        this.showError = false;
        this.verDocOrigen = false;
        this.verDocDestino = false;
        this.verDocConversion = false;
        this.verTiposDocConversion = false;
        this.verDetalleDocConversion = false;
    }

    mostrarError(idPantalla: number) {
        this.regresar = idPantalla;
        this.showError = true;
        this.isLoading = false;
        this.verDocOrigen = false;
        this.verDocDestino = false;
        this.verDocConversion = false;
        this.verTiposDocConversion = false;
        this.verDetalleDocConversion = false;
    }

    mostrarDocOrigen() {
        this.verDocOrigen = true;
        this.showError = false;
        this.isLoading = false;
        this.verDocDestino = false;
        this.verDocConversion = false;
        this.verTiposDocConversion = false;
        this.verDetalleDocConversion = false;
    }

    mostrarDocDestino() {
        this.verDocDestino = true;
        this.showError = false;
        this.isLoading = false;
        this.verDocOrigen = false;
        this.verDocConversion = false;
        this.verTiposDocConversion = false;
        this.verDetalleDocConversion = false;
    }

    mostrarDocConversion() {
        this.verDocConversion = true;
        this.showError = false;
        this.isLoading = false;
        this.verDocOrigen = false;
        this.verDocDestino = false;
        this.verTiposDocConversion = false;
        this.verDetalleDocConversion = false;
    }

    mostrarDetalleDocConversion() {
        this.verDetalleDocConversion = true;
        this.isLoading = false;
        this.showError = false;
        this.verDocOrigen = false;
        this.verDocDestino = false;
        this.verDocConversion = false;
        this.verTiposDocConversion = false;
    }
}