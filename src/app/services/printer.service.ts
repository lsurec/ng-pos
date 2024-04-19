import { Injectable } from '@angular/core';
import { urlApi } from '../providers/api.provider';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ResApiInterface } from '../interfaces/res-api.interface';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { DocPrintModel } from '../interfaces/doc-print.interface';
import { PreferencesService } from './preferences.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalConvertService } from '../displays/listado_Documento_Pendiente_Convertir/services/global-convert.service';

@Injectable()
export class PrinterService {

    private _urlBase: string = urlApi.apiServer.urlPrint;
    private _port: string = PreferencesService.port;

    //inicializar http
    constructor(private _http: HttpClient,
        private _translate: TranslateService,
        private _convertService: GlobalConvertService,
    ) {
    }

    //funcion que va a realizar el consumo privado para obtener las empresas
    private _getStatusPrint(

        printer: string,
    ) {

        return this._http.get(`${this._urlBase}${this._port}/api/printer/online/${printer}`, { observe: 'response' });

    }

    //funcion asyncrona con promesa  para obtener las empresas
    getStatusPrint(
        printer: string,
    ): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getStatusPrint(printer).subscribe(
                //si esta correcto
                res => {

                    let resApi: ResApiInterface = {
                        status: true,
                        response: res.body,
                    }
                    resolve(resApi);
                },
                //si algo sale mal
                err => {

                    console.log(err);


                    let resApi: ResApiInterface = {
                        status: false,
                        response: err.error,
                        url: err.url,
                    }
                    resolve(resApi);
                }
            )
        }
        )
    }

    //funcion que va a realizar el consumo privado para obtener las empresas
    private _getStatus(

        port: string,
    ) {

        return this._http.get(`${this._urlBase}${port}/api/Printer/status`, { observe: 'response' });

    }

    //funcion asyncrona con promesa  para obtener las empresas
    getStatus(
        port: string,
    ): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getStatus(port).subscribe(
                //si esta correcto
                res => {

                    let resApi: ResApiInterface = {
                        status: true,
                        response: res.body,
                    }
                    resolve(resApi);
                },
                //si algo sale mal
                err => {

                    let resApi: ResApiInterface = {
                        status: false,
                        response: err.error,
                        url: err.url,
                    }
                    resolve(resApi);
                }
            )
        }
        )
    }

    private _postPrint(
        file: File,
        printer: string,
        copies: string,
    ) {
        const formData = new FormData();
        formData.append('files', file);
        //configurar headers
        let headers = new HttpHeaders(
            {
                "printerName": printer,
                "copies": copies,
            }
        )
        //consumo de api
        return this._http.post(`${this._urlBase}${this._port}/api/Printer`, formData, { headers: headers, observe: 'response' });
    }

    postPrint(
        file: File,
        printer: string,
        copies: string,): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._postPrint(
                file,
                printer,
                copies,
            ).subscribe(
                //si esta correcto
                res => {

                    let resApi: ResApiInterface = {
                        status: true,
                        response: res.body,
                    }
                    resolve(resApi);
                },
                //si algo sale mal
                err => {
                    try {
                        let message = err.message;

                        let resApi: ResApiInterface = {
                            status: false,
                            response: message,
                            url: err.url,
                        }
                        resolve(resApi);

                    } catch (ex) {
                        let resApi: ResApiInterface = {
                            status: false,
                            response: err,
                            url: err.url,
                        }
                        resolve(resApi);
                    }
                }
            )
        })
    }

    //funcion que va a realizar el consumo privado para obtener las empresas
    private _getPrinters() {

        //consumo de api
        return this._http.get(`${this._urlBase}${this._port}/api/printer`, { observe: 'response' });
    }

    //funcion asyncrona con promesa  para obtener las empresas
    getPrinters(): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getPrinters().subscribe(
                //si esta correcto
                res => {

                    let resApi: ResApiInterface = {
                        status: true,
                        response: res.body,
                    }
                    resolve(resApi);
                },
                //si algo sale mal
                err => {
                    try {
                        let message = err.message;

                        let resApi: ResApiInterface = {
                            status: false,
                            response: message,
                            url: err.url,
                        }
                        resolve(resApi);

                    } catch (ex) {
                        let resApi: ResApiInterface = {
                            status: false,
                            response: err,
                            url: err.url,
                        }
                        resolve(resApi);
                    }
                }
            )
        }
        )
    }

    private _logo_empresa: any;
    private _imageBase64: any;

    private async _generateBase64(source: string): Promise<void> {
        this._imageBase64 = "";
        return new Promise((resolve, reject) => {
            this._http.get(source, { responseType: 'blob' })
                .subscribe(res => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        var base64data = reader.result;
                        this._imageBase64 = base64data;
                        //   console.log(base64data);
                        resolve();
                    }
                    reader.readAsDataURL(res);
                    //console.log(res);
                });
        });
    }


    private formatDate(dateOrigin: Date): string {

        let date: Date = new Date(dateOrigin);


        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        // Agregar ceros a la izquierda si es necesario
        const dayString = day < 10 ? '0' + day : day.toString();
        const monthString = month < 10 ? '0' + month : month.toString();

        return `${dayString}/${monthString}/${year}`;
    }


    async getReport(doc: DocPrintModel) {

        await this._generateBase64('/assets/empresa.png');
        this._logo_empresa = this._imageBase64;

        let date: Date = doc.cliente.fecha;

        let fecha = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        let hora = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;


        let transacciones: any[] = [];

        doc.items.forEach(item => {
            transacciones.push(
                [
                    { text: item.cantidad, style: 'normalText', },
                    { text: item.descripcion, style: 'normalText' },
                    { text: item.unitario, style: 'endText', },
                    { text: item.total, style: 'endText', },
                ],

            );
        });

        console.log(transacciones);


        let pagos: any[] = [];

        doc.pagos.forEach(pago => {
            pagos.push(
                {
                    text: pago.tipoPago,
                    style: 'endTextBold',
                },
                {
                    table: {
                        widths: ['50%', '50%',],
                        body: [

                            [
                                { text: this._translate.instant('pos.factura.recibido'), style: 'normalText', },
                                { text: pago.pago, style: 'endText', },
                            ],
                            [
                                { text: this._translate.instant('pos.factura.recibido'), style: 'normalText' },
                                { text: pago.monto, style: 'endText', },
                            ],
                            [
                                { text: this._translate.instant('pos.factura.cambio_efectivo'), style: 'normalText' },
                                { text: pago.cambio, style: 'endText', },
                            ],

                        ],
                    },
                    layout: 'noBorders',
                },
            );

        });


        let divider = {
            layout: 'headerLineOnly',
            table: {
                widths: ['100%'],
                headerRows: 1,
                body: [
                    [
                        {
                            text: ''
                        }
                    ],
                    [
                        {
                            text: ''
                        }
                    ],
                ]
            }
        };


        var docDefinition: TDocumentDefinitions = {
            info: {
                title: doc.documento.titulo,
                author: 'Demosoft',
                subject: 'ticket',
                keywords: 'tck, sale',
            },
            pageSize: {
                width: 226.77,
                height: 'auto',
            },
            pageMargins: [5.66, 0, 5.66, 5.66],
            content: [
                //DATOS EMPRESA
                {
                    image: this._logo_empresa,
                    fit: [161.73, 76.692],
                    alignment: 'center',
                },
                {
                    text: doc.empresa.razonSocial,
                    style: 'centerBold',
                    margin: [0, 10, 0, 0],
                },
                {
                    text: doc.empresa.nombre,
                    style: 'centerBold',
                },
                {
                    text: doc.empresa.direccion,
                    style: 'centerBold',
                },
                {
                    text: `${this._translate.instant('pos.factura.nit')} ${doc.empresa.nit}`,
                    style: 'centerBold',
                },
                {
                    text: `${this._translate.instant('pos.factura.tel')} ${doc.empresa.tel}`,
                    style: 'centerBold',
                },
                {
                    text: doc.documento.titulo,
                    style: 'centerBold',
                    margin: [0, 10, 0, 0],

                },
                {
                    text: doc.documento.descripcion,
                    style: 'centerBold',
                },
                {
                    text: `${this._translate.instant('pos.factura.no_interno')} ${doc.documento.noInterno}`,
                    style: 'center',
                    margin: [0, 10, 0, 0],

                },
                //TODO:Agregar datos de certificacion


                //CLiente
                {
                    text: `${this._translate.instant('pos.factura.cliente').toUpperCase()}:`,
                    style: 'center',
                    margin: [0, 10, 0, 0],

                },
                {
                    text: `${this._translate.instant('pos.factura.nombre')} :  ${doc.cliente.nombre}`,
                    style: 'center',
                },
                {
                    text: `${this._translate.instant('pos.factura.nit')} :  ${doc.cliente.nit}`,
                    style: 'center',
                },

                {
                    text: `${this._translate.instant('pos.factura.direccion')} : ${doc.cliente.direccion}`,
                    style: 'center',
                },

                {
                    text: `${this._translate.instant('pos.factura.tel')} ${doc.cliente.tel}`,
                    style: 'center',
                },
                {
                    table: {
                        widths: ['50%', '50%',],
                        body: [
                            [
                                { text: this._translate.instant('pos.factura.fecha').toUpperCase() + fecha, style: 'center' },
                                { text: this._translate.instant('pos.factura.hora').toUpperCase() + hora, style: 'center', },
                            ],

                        ],
                    },
                    layout: 'noBorders',
                },
                {
                    margin: [0, 10, 0, 0],
                    text: "TIPO EVENTO: " + this._convertService.docOriginSelect?.referencia_D_Des_Tipo_Referencia?.toUpperCase(), style: 'center'
                },

                {
                    margin: [0, 10, 0, 0],
                    text: "FECHA ENTREGA: " + this.formatDate(this._convertService.docOriginSelect!.referencia_D_Fecha_Ini!), style: 'center'
                },
                { text: "FECHA RECOGER: " + this.formatDate(this._convertService.docOriginSelect!.referencia_D_Fecha_Fin!), style: 'center', },
                { text: "FECHA INICIO: " + this.formatDate(this._convertService.docOriginSelect!.fecha_Ini!), style: 'center' },
                { text: "FECHA FIN: " + this.formatDate(this._convertService.docOriginSelect!.fecha_Fin!), style: 'center', },

                //TABLA PRODUCTOS
                {
                    layout: 'headerLineOnly',
                    margin: [0, 10, 0, 0],
                    table: {

                        widths: ['15%', '45%', '15%', '25%'],
                        headerRows: 1,

                        body: [

                            [
                                { text: this._translate.instant('pos.factura.cant').toUpperCase(), style: 'normalTextBold' },
                                { text: this._translate.instant('pos.factura.descripcion').toUpperCase(), style: 'normalTextBold' },
                                { text: this._translate.instant('pos.factura.p_u'), style: 'endTextBold' },
                                { text: this._translate.instant('pos.factura.monto').toUpperCase(), style: 'endTextBold' },
                            ],

                            ...transacciones

                        ],
                    },

                },
                divider,
                {
                    layout: 'headerLineOnly',
                    table: {

                        widths: ['50%', '50%'],

                        body: [

                            [
                                { text: this._translate.instant('pos.factura.subtotal'), style: 'normalTextBold' },
                                { text: doc.montos.subtotal, style: 'endTextBold' },

                            ],
                            [
                                { text: this._translate.instant('pos.factura.cargo'), style: 'normalTextBold' },
                                { text: doc.montos.cargos, style: 'endTextBold' },

                            ],
                            [
                                { text: this._translate.instant('pos.factura.descuento'), style: 'normalTextBold' },
                                { text: doc.montos.descuentos, style: 'endTextBold' },

                            ],

                        ],
                    },


                },
                divider,


                {
                    layout: 'headerLineOnly',
                    table: {

                        widths: ['50%', '50%'],

                        body: [

                            [
                                {
                                    text: this._translate.instant('pos.factura.total').toUpperCase(),
                                    style: 'normalTextBold'
                                },
                                {
                                    text: doc.montos.total,
                                    style: 'endTextBold'
                                },

                            ],
                        ],
                    },


                },
                {
                    text: doc.montos.totalLetras,
                    style: 'normalText',
                    alignment: 'justify',
                },
                divider,

                {
                    margin: [0, 10],

                    text: this._translate.instant('pos.factura.detalle_pagos'),
                    style: 'centerBold',
                },

                ...pagos,

                {
                    text: "Contacto: ", style: 'normalText',
                },
                { text: this._convertService.docOriginSelect?.referencia_D_Observacion_2, style: 'normalText', },

                { text: "Descripcion: ", style: 'normalText', },
                { text: this._convertService.docOriginSelect?.referencia_D_Descripcion, style: 'normalText', },

                { text: "Direccion entrega: ", style: 'normalText', },
                { text: this._convertService.docOriginSelect?.referencia_D_Observacion_3, style: 'normalText', },

                { text: "Observacion: ", style: 'normalText', },
                { text: this._convertService.docOriginSelect?.referencia_D_Observacion, style: 'normalText', },

                //TODO:Agregar informacion del certificador

                {
                    margin: [0, 10],
                    text: doc.mensajes[0],
                    style: 'centerBold',
                },

                {
                    margin: [0, 20, 0, 0],
                    text: '---------------------------------------------------------------',
                    style: 'center',
                },

                {
                    text: 'Power By',
                    style: 'center',
                },

                {
                    text: 'Desarrollo Moderno de Software S.A.',
                    style: 'center',
                },

                {
                    text: 'www.demosoft.com.gt',
                    style: 'center',
                },
                // {
                //   image: this.logo_empresa,
                //   fit: [141.73, 56.692],
                //   alignment: 'center',
                // },



            ],
            styles: {
                center: {
                    fontSize: 8,
                    alignment: 'center',
                },
                centerBold: {
                    fontSize: 8,
                    alignment: 'center',
                    bold: true,
                },
                normalText: {
                    fontSize: 8,
                },
                normalTextBold: {
                    fontSize: 8,
                    bold: true,
                },

                endText: {
                    fontSize: 8,
                    alignment: 'right',
                },
                endTextBold: {
                    fontSize: 8,
                    alignment: 'right',
                    bold: true,
                },
                header: {
                    fontSize: 9,
                    bold: true,
                    alignment: 'center',
                },
                tHeaderLabel: {
                    fontSize: 8,
                    alignment: 'right',
                },
                tHeaderValue: {
                    fontSize: 8,
                    bold: true,
                },
                tProductsHeader: {
                    fontSize: 8.5,
                    bold: true,
                },
                tProductsBody: {
                    fontSize: 8,
                },
                tTotals: {
                    fontSize: 9,
                    bold: true,
                    alignment: 'right',
                },
                tClientLabel: {
                    fontSize: 8,
                    alignment: 'right',
                },
                tClientValue: {
                    fontSize: 8,
                    bold: true,
                },
                text: {
                    fontSize: 8,
                    alignment: 'center',
                },
                link: {
                    fontSize: 8,
                    bold: true,
                    margin: [0, 0, 0, 4],
                    alignment: 'center',
                },
            },
        };

        return docDefinition;
    }


    async getReportConvert(doc: DocPrintModel) {

        await this._generateBase64('/assets/empresa.png');
        this._logo_empresa = this._imageBase64;

        let date: Date = doc.cliente.fecha;

        let fecha = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        let hora = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;


        let transacciones: any[] = [];

        doc.items.forEach(item => {
            transacciones.push(
                [
                    { text: item.cantidad, style: 'normalText', },
                    { text: item.descripcion, style: 'normalText' },
                    { text: item.unitario, style: 'endText', },
                    { text: item.total, style: 'endText', },
                ],

            );
        });



        let divider = {
            layout: 'headerLineOnly',
            table: {
                widths: ['100%'],
                headerRows: 1,
                body: [
                    [
                        {
                            text: ''
                        }
                    ],
                    [
                        {
                            text: ''
                        }
                    ],
                ]
            }
        };


        var docDefinition: TDocumentDefinitions = {
            info: {
                title: doc.documento.titulo,
                author: 'Demosoft',
                subject: 'ticket',
                keywords: 'tck, sale',
            },
            pageSize: {
                width: 226.77,
                height: 'auto',
            },
            pageMargins: [5.66, 0, 5.66, 5.66],
            content: [
                //DATOS EMPRESA
                {
                    image: this._logo_empresa,
                    fit: [161.73, 76.692],
                    alignment: 'center',
                },
                {
                    text: doc.empresa.razonSocial,
                    style: 'centerBold',
                    margin: [0, 10, 0, 0],
                },
                {
                    text: doc.empresa.nombre,
                    style: 'centerBold',
                },
                {
                    text: doc.empresa.direccion,
                    style: 'centerBold',
                },
                {
                    text: `${this._translate.instant('pos.factura.nit')} ${doc.empresa.nit}`,
                    style: 'centerBold',
                },
                {
                    text: `${this._translate.instant('pos.factura.tel')} ${doc.empresa.tel}`,
                    style: 'centerBold',
                },
                {
                    text: doc.documento.titulo,
                    style: 'centerBold',
                    margin: [0, 10, 0, 0],

                },
                {
                    text: doc.documento.descripcion,
                    style: 'centerBold',
                },
                {
                    text: `${this._translate.instant('pos.factura.no_interno')} ${doc.documento.noInterno}`,
                    style: 'center',
                    margin: [0, 10, 0, 0],

                },

                //CLiente
                {
                    text: `${this._translate.instant('pos.factura.cliente').toUpperCase()}:`,
                    style: 'center',
                    margin: [0, 10, 0, 0],

                },
                {
                    text: `${this._translate.instant('pos.factura.nombre')} :  ${doc.cliente.nombre}`,
                    style: 'center',
                },
                {
                    text: `${this._translate.instant('pos.factura.nit')} :  ${doc.cliente.nit}`,
                    style: 'center',
                },

                {
                    text: `${this._translate.instant('pos.factura.direccion')} : ${doc.cliente.direccion}`,
                    style: 'center',
                },

                {
                    text: `${this._translate.instant('pos.factura.tel')} ${doc.cliente.tel}`,
                    style: 'center',
                },
                {
                    table: {
                        widths: ['50%', '50%',],
                        body: [
                            [
                                { text: this._translate.instant('pos.factura.fecha').toUpperCase() + fecha, style: 'center' },
                                { text: this._translate.instant('pos.factura.hora').toUpperCase() + hora, style: 'center', },
                            ],

                        ],
                    },
                    layout: 'noBorders',
                },
                //TABLA PRODUCTOS
                {
                    layout: 'headerLineOnly',
                    margin: [0, 10, 0, 0],
                    table: {

                        widths: ['15%', '45%', '15%', '25%'],
                        headerRows: 1,

                        body: [

                            [
                                { text: this._translate.instant('pos.factura.cant').toUpperCase(), style: 'normalTextBold' },
                                { text: this._translate.instant('pos.factura.descripcion').toUpperCase(), style: 'normalTextBold' },
                                { text: this._translate.instant('pos.factura.p_u'), style: 'endTextBold' },
                                { text: this._translate.instant('pos.factura.monto').toUpperCase(), style: 'endTextBold' },
                            ],

                            ...transacciones

                        ],
                    },

                },
                divider,
                {
                    layout: 'headerLineOnly',
                    table: {

                        widths: ['50%', '50%'],

                        body: [

                            [
                                { text: this._translate.instant('pos.factura.subtotal'), style: 'normalTextBold' },
                                { text: doc.montos.subtotal, style: 'endTextBold' },

                            ],
                            [
                                { text: this._translate.instant('pos.factura.cargo'), style: 'normalTextBold' },
                                { text: doc.montos.cargos, style: 'endTextBold' },

                            ],
                            [
                                { text: this._translate.instant('pos.factura.descuento'), style: 'normalTextBold' },
                                { text: doc.montos.descuentos, style: 'endTextBold' },

                            ],

                        ],
                    },


                },
                divider,


                {
                    layout: 'headerLineOnly',
                    table: {

                        widths: ['50%', '50%'],

                        body: [

                            [
                                {
                                    text: this._translate.instant('pos.factura.total').toUpperCase(),
                                    style: 'normalTextBold'
                                },
                                {
                                    text: doc.montos.total,
                                    style: 'endTextBold'
                                },

                            ],
                        ],
                    },


                },
                {
                    text: doc.montos.totalLetras,
                    style: 'normalText',
                    alignment: 'justify',
                },
                divider,


                {
                    margin: [0, 10],
                    text: doc.mensajes[0],
                    style: 'centerBold',
                },

                {
                    margin: [0, 20, 0, 0],
                    text: '---------------------------------------------------------------',
                    style: 'center',
                },

                {
                    text: 'Power By',
                    style: 'center',
                },

                {
                    text: 'Desarrollo Moderno de Software S.A.',
                    style: 'center',
                },

                {
                    text: 'www.demosoft.com.gt',
                    style: 'center',
                },
                // {
                //   image: this.logo_empresa,
                //   fit: [141.73, 56.692],
                //   alignment: 'center',
                // },



            ],
            styles: {
                center: {
                    fontSize: 8,
                    alignment: 'center',
                },
                centerBold: {
                    fontSize: 8,
                    alignment: 'center',
                    bold: true,
                },
                normalText: {
                    fontSize: 8,
                },
                normalTextBold: {
                    fontSize: 8,
                    bold: true,
                },

                endText: {
                    fontSize: 8,
                    alignment: 'right',
                },
                endTextBold: {
                    fontSize: 8,
                    alignment: 'right',
                    bold: true,
                },
                header: {
                    fontSize: 9,
                    bold: true,
                    alignment: 'center',
                },
                tHeaderLabel: {
                    fontSize: 8,
                    alignment: 'right',
                },
                tHeaderValue: {
                    fontSize: 8,
                    bold: true,
                },
                tProductsHeader: {
                    fontSize: 8.5,
                    bold: true,
                },
                tProductsBody: {
                    fontSize: 8,
                },
                tTotals: {
                    fontSize: 9,
                    bold: true,
                    alignment: 'right',
                },
                tClientLabel: {
                    fontSize: 8,
                    alignment: 'right',
                },
                tClientValue: {
                    fontSize: 8,
                    bold: true,
                },
                text: {
                    fontSize: 8,
                    alignment: 'center',
                },
                link: {
                    fontSize: 8,
                    bold: true,
                    margin: [0, 0, 0, 4],
                    alignment: 'center',
                },
            },
        };

        return docDefinition;
    }


    async getTestTemplate() {

        await this._generateBase64('/assets/logo_demosoft.png');
        this._logo_empresa = this._imageBase64;

        let date: Date = new Date();

        let fecha = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        let hora = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;


        let divider = {
            layout: 'headerLineOnly',
            table: {
                widths: ['100%'],
                headerRows: 1,
                body: [
                    [
                        {
                            text: ''
                        }
                    ],
                    [
                        {
                            text: ''
                        }
                    ],
                ]
            }
        };


        var docDefinition: TDocumentDefinitions = {
            info: {
                title: this._translate.instant('pos.factura.ticket_prueba'),
                author: 'Demosoft',
                subject: 'ticket',
                keywords: 'tck, sale',
            },
            pageSize: {
                width: 226.77,
                height: 'auto',
            },
            pageMargins: [5.66, 0, 5.66, 5.66],
            content: [
                //DATOS EMPRESA
                {
                    image: this._logo_empresa,
                    fit: [161.73, 76.692],
                    alignment: 'center',
                },
                {
                    text: 'DESARROLLO MODERNO DE SOFTWARE S.A.',
                    style: 'centerBold',
                    margin: [0, 10, 0, 0],
                },
                {
                    text: 'DEMOSOFT S.A.', style: 'centerBold'
                },
                {
                    text: this._translate.instant('pos.factura.ticket_prueba'),
                    style: 'centerBold',
                    margin: [0, 10, 0, 2.25],
                },
                //DATOS CEBECERA FACTURAR
                {
                    margin: [0, 10, 0, 0],
                    table: {
                        widths: ['50%', '50%',],
                        body: [
                            [
                                { text: this._translate.instant('pos.factura.fecha').toUpperCase() + fecha, style: 'center' },
                                { text: this._translate.instant('pos.factura.hora').toUpperCase() + hora, style: 'center', },
                            ],

                        ],
                    },
                    layout: 'noBorders',
                },
                //TABLA PRODUCTOS
                {
                    layout: 'headerLineOnly',
                    margin: [0, 10, 0, 0],
                    table: {

                        widths: ['15%', '45%', '15%', '25%'],
                        headerRows: 1,

                        body: [

                            [
                                { text: this._translate.instant('pos.factura.cant').toUpperCase(), style: 'normalTextBold' },
                                { text: this._translate.instant('pos.factura.descripcion').toUpperCase(), style: 'normalTextBold' },
                                { text: this._translate.instant('pos.factura.p_u'), style: 'endTextBold' },
                                { text: this._translate.instant('pos.factura.monto').toUpperCase(), style: 'endTextBold' },
                            ],

                            [
                                { text: '5000', style: 'normalText', },
                                { text: 'Minim occaecat nulla in ullamco commodo.', style: 'normalText' },
                                { text: '295.00', style: 'endText', },
                                { text: '295000.50', style: 'endText', },
                            ],

                        ],
                    },

                },
                divider,
                {
                    layout: 'headerLineOnly',
                    table: {

                        widths: ['50%', '50%'],

                        body: [

                            [
                                { text: this._translate.instant('pos.factura.subtotal'), style: 'normalTextBold' },
                                { text: '00.00', style: 'endTextBold' },
                            ],
                            [
                                { text: this._translate.instant('pos.factura.cargo'), style: 'normalTextBold' },
                                { text: '00.00', style: 'endTextBold' },
                            ],
                            [
                                { text: this._translate.instant('pos.factura.descuento'), style: 'normalTextBold' },
                                { text: '00.00', style: 'endTextBold' },
                            ],
                        ],
                    },


                },
                divider,


                {
                    layout: 'headerLineOnly',
                    table: {

                        widths: ['50%', '50%'],

                        body: [

                            [
                                {
                                    text: this._translate.instant('pos.factura.total').toUpperCase(),
                                    style: 'normalTextBold'
                                },
                                {
                                    text: '00.00',
                                    style: 'endTextBold'
                                },

                            ],
                        ],
                    },


                },
                {
                    text: 'CERO QUETZALES CON (93/100)',
                    style: 'normalText',
                    alignment: 'justify',
                },
                divider,

                {
                    margin: [0, 10],

                    text: this._translate.instant('pos.factura.detalle_pagos'),
                    style: 'centerBold',
                },

                {
                    text: this._translate.instant('pos.factura.efectivo'),
                    style: 'endTextBold',
                },

                {
                    table: {
                        widths: ['50%', '50%',],
                        body: [

                            [
                                { text: this._translate.instant('pos.factura.recibido'), style: 'normalText', },
                                { text: '00.00', style: 'endText', },
                            ],
                            [
                                { text: this._translate.instant('pos.factura.monto'), style: 'normalText' },
                                { text: '00.00', style: 'endText', },
                            ],
                            [
                                { text: this._translate.instant('pos.factura.cambio'), style: 'normalText' },
                                { text: '00.00', style: 'endText', },
                            ],

                        ],
                    },
                    layout: 'noBorders',
                },

                {
                    margin: [0, 20, 0, 0],
                    text: '---------------------------------------------------------------',
                    style: 'center',
                },

                {
                    text: 'Power By',
                    style: 'center',
                },

                {
                    text: 'Desarrollo Moderno de Software S.A.',
                    style: 'center',
                },

                {
                    text: 'www.demosoft.com.gt',
                    style: 'center',
                },
                // {
                //   image: this.logo_empresa,
                //   fit: [141.73, 56.692],
                //   alignment: 'center',
                // },



            ],
            styles: {
                center: {
                    fontSize: 8,
                    alignment: 'center',
                },
                centerBold: {
                    fontSize: 8,
                    alignment: 'center',
                    bold: true,
                },
                normalText: {
                    fontSize: 8,
                },
                normalTextBold: {
                    fontSize: 8,
                    bold: true,
                },

                endText: {
                    fontSize: 8,
                    alignment: 'right',
                },
                endTextBold: {
                    fontSize: 8,
                    alignment: 'right',
                    bold: true,
                },
                header: {
                    fontSize: 9,
                    bold: true,
                    alignment: 'center',
                },
                tHeaderLabel: {
                    fontSize: 8,
                    alignment: 'right',
                },
                tHeaderValue: {
                    fontSize: 8,
                    bold: true,
                },
                tProductsHeader: {
                    fontSize: 8.5,
                    bold: true,
                },
                tProductsBody: {
                    fontSize: 8,
                },
                tTotals: {
                    fontSize: 9,
                    bold: true,
                    alignment: 'right',
                },
                tClientLabel: {
                    fontSize: 8,
                    alignment: 'right',
                },
                tClientValue: {
                    fontSize: 8,
                    bold: true,
                },
                text: {
                    fontSize: 8,
                    alignment: 'center',
                },
                link: {
                    fontSize: 8,
                    bold: true,
                    margin: [0, 0, 0, 4],
                    alignment: 'center',
                },
            },
        };

        return docDefinition;
    }


}