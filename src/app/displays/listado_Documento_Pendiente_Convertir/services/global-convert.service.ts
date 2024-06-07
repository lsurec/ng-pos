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

    performanSearchOrigin:string = "";

    editDoc:boolean = false; //editar documento
    regresar: number = 0; //Desde donde se navegó

    isLoading: boolean = false; //pantalla de carga
    showError: boolean = false; //ostrar pantalla de rror
    verTiposDocConversion: boolean = false; //mmostrar oanatalal tipos de documento
    verDocOrigen: boolean = false;  //Mostrar anatalal documento origen
    verDocDestino: boolean = false; //mostrar panatlla docuemtos destino
    verDocConversion: boolean = false; //Mostrar pantalla conversin de docuemtno origen a documento  destino
    verDetalleDocConversion: boolean = false;   //Ver detalels del docuemtno convetrido 
    verPrint: boolean = false;  //ver pantalla de impersion

    docSelect?: TypesDocConvertInterface; //tipo de documento seleccioando 
    docs: TypesDocConvertInterface[] = [];  //lsiat de tipos de docuemmmtnos disponobles

    screen: string = "";    //id de la panatalla

    docsOrigin: OriginDocInterface[] = []; //Docuemntos orieen disponobles
    docsOriginFilter: OriginDocInterface[] = []; //docuemmntos origen con filtro aplicados
    docOriginSelect?: OriginDocInterface; //Documento origen seleccionado

    docsDestination: DestinationDocInterface[] = [];    //Docuementos destino duponibles
    docDestinationSelect?: DestinationDocInterface; //docuemmnto destino seleccionado

    fechaInicial?: NgbDateStruct; //fecha inicial 
    fechaFinal?: NgbDateStruct; //fecha final

    detailsOrigin: DetailOriginDocInterInterface[] = []; //Detalles dle docuemtno origen

    docDestino: number = -1;     //Codigo asignado al documento

    docDestinoSelect?: DocConvertInterface; //Docuemto destino selccionado
    detialsDocDestination: DetailDestinationDocIntnterface[] = []; // documetnos destinos disponibles

    docPrint?: DocPrintModel; //Daros del docuemtno par

    //agregar un 0 al princiiop de un numero de un solo digito 
    addLeadingZero(number: number): string {
        return number.toString().padStart(2, '0');
    }

    //formato para la fech avalido para el servico 
    formatStrFilterDate(date: NgbDateStruct) {
        return `${date.year}${this.addLeadingZero(date.month)}${this.addLeadingZero(date.day)}`;
    }

    //mosttrar pantalla tipos de docuemntos
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

    //mosttrar pantalla error
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

    //mosttrar pantallla documetos orugen
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

    //mosttrar pantallla documetos destino
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

    //mostr pantalla conversion de docuemtno origen a docuemtno destino
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

    //mostrar oabtalla docuemtno destino convertido
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

    //mostrr apantalla de imprecion
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