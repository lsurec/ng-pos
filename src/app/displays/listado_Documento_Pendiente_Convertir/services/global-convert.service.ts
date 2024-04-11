import { Injectable } from '@angular/core';
import { TypesDocConvertInterface } from '../interfaces/types-doc-convert.interface';
import { OriginDocInterface } from '../interfaces/origin-doc.interface';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DestinationDocInterface } from '../interfaces/destination-doc.interface';
import { DetailOriginDocInterInterface } from '../interfaces/detail-origin-doc.interface';
import { DocConvertInterface } from '../interfaces/doc-convert-interface';
import { DetailDestinationDocIntnterface } from '../interfaces/detail-destination-doc.interface';
import { DocPrintModel } from 'src/app/interfaces/doc-print.interface';


@Injectable({
    providedIn: 'root',
})
export class GlobalConvertService {


    editDoc:boolean = false;
    regresar: number = 0;

    isLoading: boolean = false; //pantalla de carga
    showError: boolean = false;
    verTiposDocConversion: boolean = false;
    verDocOrigen: boolean = false;
    verDocDestino: boolean = false;
    verDocConversion: boolean = false;
    verDetalleDocConversion: boolean = false;
    verPrint: boolean = false;

    docSelect?: TypesDocConvertInterface;
    docs: TypesDocConvertInterface[] = [];

    screen: string = "";

    docsOrigin: OriginDocInterface[] = [];
    docsOriginFilter: OriginDocInterface[] = [];
    docOriginSelect?: OriginDocInterface;

    docsDestination: DestinationDocInterface[] = [];
    docDestinationSelect?: DestinationDocInterface;


    fechaInicial?: NgbDateStruct; //fecha inicial 
    fechaFinal?: NgbDateStruct;

    detailsOrigin: DetailOriginDocInterInterface[] = [];

    docDestino: number = -1;

    docDestinoSelect?: DocConvertInterface;
    detialsDocDestination: DetailDestinationDocIntnterface[] = [];


    docPrint?: DocPrintModel;


    addLeadingZero(number: number): string {
        return number.toString().padStart(2, '0');
    }

    formatStrFilterDate(date: NgbDateStruct) {
        return `${date.year}${this.addLeadingZero(date.month)}${this.addLeadingZero(date.day)}`;
    }


    mostrarTiposDoc() {
        this.verTiposDocConversion = true;
        this.isLoading = false;
        this.showError = false;
        this.verDocOrigen = false;
        this.verDocDestino = false;
        this.verDocConversion = false;
        this.verDetalleDocConversion = false;
        this.verPrint = false;
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
        this.verPrint = false;

    }

    mostrarDocOrigen() {
        this.verDocOrigen = true;
        this.showError = false;
        this.isLoading = false;
        this.verDocDestino = false;
        this.verDocConversion = false;
        this.verTiposDocConversion = false;
        this.verDetalleDocConversion = false;
        this.verPrint = false;

    }

    mostrarDocDestino() {
        this.verDocDestino = true;
        this.showError = false;
        this.isLoading = false;
        this.verDocOrigen = false;
        this.verDocConversion = false;
        this.verTiposDocConversion = false;
        this.verDetalleDocConversion = false;
        this.verPrint = false;

    }

    mostrarDocConversion() {
        this.verDocConversion = true;
        this.showError = false;
        this.isLoading = false;
        this.verDocOrigen = false;
        this.verDocDestino = false;
        this.verTiposDocConversion = false;
        this.verDetalleDocConversion = false;
        this.verPrint = false;

    }

    mostrarDetalleDocConversion() {
        this.verDetalleDocConversion = true;
        this.isLoading = false;
        this.showError = false;
        this.verDocOrigen = false;
        this.verDocDestino = false;
        this.verDocConversion = false;
        this.verTiposDocConversion = false;
        this.verPrint = false;

    }



    mostrarImpresion() {
        this.verDetalleDocConversion = false;
        this.isLoading = false;
        this.showError = false;
        this.verDocOrigen = false;
        this.verDocDestino = false;
        this.verDocConversion = false;
        this.verTiposDocConversion = false;
        this.verPrint = true;

    }
}