import { Injectable } from '@angular/core';
import { urlApi } from '../providers/api.provider';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ResApiInterface } from '../interfaces/res-api.interface';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { DocPrintModel } from '../interfaces/doc-print.interface';
import { PreferencesService } from './preferences.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalConvertService } from '../displays/listado_Documento_Pendiente_Convertir/services/global-convert.service';
import { ValidateProductInterface } from '../displays/listado_Documento_Pendiente_Convertir/interfaces/validate-product.interface';

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

    private _getStatusPrint(

        printer: string,
    ) {

        return this._http.get(`${this._urlBase}${this._port}/api/printer/online/${printer}`, { observe: 'response' });

    }

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

    private _getStatus(

        port: string,
    ) {

        return this._http.get(`${this._urlBase}${port}/api/Printer/status`, { observe: 'response' });

    }

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

    private _getPrinters() {

        //consumo de api
        return this._http.get(`${this._urlBase}${this._port}/api/printer`, { observe: 'response' });
    }

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


    private async _generateBase64(source: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this._http.get(source, { responseType: 'blob' })
                .subscribe(res => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        var base64data = reader.result;
                        //   console.log(base64data);
                        resolve(base64data);
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

    async getFormatProductValidate(tarnsaciones: ValidateProductInterface[]) {
        let logo_empresa = await this._generateBase64('/assets/Empresa.jpg');

        let date: Date = new Date();

        let fecha = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        let hora = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;


        let transacciones: any[] = [];

        tarnsaciones.forEach(item => {


            let mensajes: any[] = [];

            item.mensajes.forEach(element => {
                mensajes.push([{
                    text: element,
                    style: 'normalText',
                    colSpan: 5,

                },],);
            });
            transacciones.push(
                [
                    {
                        text: item.sku,
                        style: 'normalText'
                    },

                    {
                        text: item.productoDesc,
                        style: 'normalText'
                    },
                    {
                        text: item.bodega,
                        style: 'normalText'
                    },
                    {
                        text: item.tipoDoc,
                        style: 'normalText'
                    },
                    {
                        text: item.serie,
                        style: 'normalText'
                    },

                ],
                [
                    {
                        text: 'Mensajes:',
                        style: 'normalTextBold',
                        colSpan: 5,
                    },

                ],
                ...mensajes

            );
        });



        var docDefinition: TDocumentDefinitions = {
            info: {
                title: 'RPT_VALIDA_PRODUCTO',
                author: 'DEMOSOFT S.A.',
            },
            pageMargins: [40, 130, 40, 30],
            footer: function (currentPage, pageCount) {
                return [
                    {
                        marginLeft: 40,
                        text: [
                            {
                                text: `${fecha} ${hora} `,
                                fontSize: 6,
                                color: '#999999'
                            },
                            {
                                text: 'Pagina ' + currentPage.toString() + ' de ' + pageCount,
                                fontSize: 6,
                            }
                        ]
                    }
                ];
            },
            header:
                // you can apply any logic and return any valid pdfmake element

                [

                    {
                        margin: [0, 15, 0, 0],
                        table: {

                            heights: 'auto',
                            widths: ['33%', '34%', '33%'], // Ancho de las columnas
                            body: [
                                [
                                    {
                                        image: logo_empresa,
                                        width: 115,
                                        absolutePosition: { x: 20, y: 10 }
                                    },
                                    [
                                        {
                                            text: 'AGROINVERSIONES DIVERSAS LA SELVA, S.A.',
                                            style: 'headerText'
                                        },
                                        {
                                            text: 'NIT: 7057806',
                                            style: 'headerText'
                                        },
                                        {
                                            text: 'ALFA Y OMEGA',
                                            style: 'headerText'
                                        },
                                        {
                                            text: '0 Avenida 5-35, Zona 9 Guatemala',
                                            style: 'headerText'
                                        },
                                        {
                                            text: '(502) 2505 1000',
                                            style: 'headerText'
                                        },
                                        {
                                            text: 'ALFA Y OMEGA ANTIGUA',
                                            style: 'headerText'
                                        },
                                        {
                                            text: '1a. Avenida Sur #21 Antigua Guatemala Sacatepequez',
                                            style: 'headerText'
                                        },
                                        {
                                            text: '(502) 7822 8375',
                                            style: 'headerText'
                                        },
                                    ],

                                    [
                                        {
                                            layout: 'noBorders',

                                            table: {

                                                widths: ['50%', '50%'],
                                                body: [
                                                    [
                                                        {
                                                            marginLeft: 20,
                                                            marginRight: 20,
                                                            table: {
                                                                widths: ['80%'],
                                                                body: [
                                                                    [
                                                                        {
                                                                            text: 'DISPONIBILIDAD DE PRODUCTOS',
                                                                            style: 'docText',
                                                                        },
                                                                    ],
                                                                ]
                                                            },
                                                            colSpan: 2,
                                                        },




                                                    ],

                                                ]
                                            }
                                        },
                                    ],

                                ],

                            ]
                        },
                        layout: 'noBorders'
                    }
                ]
            ,
            content: [

                {
                    fillColor: '#CCCCCC',
                    table: {
                        widths: ['10%', '30%', '20%', '20%', '20%',],
                        body: [
                            [

                                {
                                    text: 'Codigo',
                                    style: 'normalTextBold'
                                },

                                {
                                    text: 'Descripción',
                                    style: 'normalTextBold'
                                },
                                {
                                    text: 'Bodega',
                                    style: 'normalTextBold'
                                },
                                {
                                    text: 'Tipo Documento',
                                    style: 'normalTextBold'
                                },
                                {
                                    text: 'Serie Documento',
                                    style: 'normalTextBold'
                                },
                            ]
                        ]
                    }
                },
                {
                    layout: 'noBorders',
                    table: {

                        widths: ['10%', '30%', '20%', '20%', '20%',],

                        body: [
                            ...transacciones

                        ]
                    }
                },


            ],
            styles: {
                headerText: {
                    fontSize: 11,
                    bold: true,
                    alignment: 'center',
                },
                normalText: {
                    fontSize: 9,
                },
                normalTextBold: {
                    fontSize: 9,
                    bold: true,
                },
                dataText: {
                    fontSize: 6,
                    bold: true,
                },
                docText: {
                    fontSize: 12,
                    bold: true,
                    alignment: 'center'
                },

            }
        };

        return docDefinition;


    }

    async getPDFDocLetter() {


        let logo_empresa = await this._generateBase64('/assets/empresa.png');
        let felImg = await this._generateBase64('/assets/fel.png');
        let logoDemosoft = await this._generateBase64('/assets/logo_demosoft.png');

        let date: Date = new Date();

        let fecha = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        let hora = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;




        var docDefinition: TDocumentDefinitions = {
            pageSize: 'LETTER',
            info: {
                title: 'TD_Cotizacion_IMG',
                author: 'DEMOSOFT S.A.',
            },
            pageMargins: [25, 100, 25, 60],
            footer: function (currentPage, pageCount) {
                return [
                    {
                        layout: 'noBorders',
                        table: {
                            widths: ['20%', '30%', '30%', '20%'],
                            body: [
                                [

                                    {
                                        image: felImg,
                                        fit: [50, 50],
                                        alignment: 'center'

                                    },


                                    [
                                        {
                                            marginTop: 10,
                                            text: 'Datos del Certificador:',
                                            style: 'textFooter',
                                            alignment: 'center',
                                        },
                                        {
                                            text: 'Infile S.A.',
                                            style: 'textFooter',
                                            alignment: 'center',
                                        },
                                        {
                                            text: 'NIT: 6518584-87',
                                            style: 'textFooter',
                                            alignment: 'center',
                                        },
                                    ],
                                    [
                                        {
                                            marginTop: 10,

                                            text: 'Powered By:',
                                            style: 'textFooter',
                                            alignment: 'center',
                                        },
                                        {
                                            text: 'Desarrollo Moderno de Software S.A.',
                                            style: 'textFooter',
                                            alignment: 'center',
                                        },
                                        {
                                            text: 'www.demosoft.com.gt',
                                            style: 'textFooter',
                                            alignment: 'center',
                                        },
                                    ],
                                    [
                                        {
                                            image: logoDemosoft,
                                            fit: [50, 50],
                                            alignment: 'center'

                                        },
                                        {
                                            alignment: 'center',
                                            text: [
                                                {
                                                    text: `${fecha} ${hora} `,
                                                    style: 'textFooter',
                                                },
                                                {
                                                    text: 'Pagina ' + currentPage.toString() + ' de ' + pageCount,
                                                    fontSize: 6,
                                                }
                                                ,

                                            ]
                                        }
                                    ],
                                ]
                            ]
                        }
                    },

                ];
            },
            header:
                // you can apply any logic and return any valid pdfmake element

                [

                    {
                        margin: [0, 15, 0, 0],
                        table: {

                            heights: 'auto',
                            widths: ['30%', '35%', '35%'], // Ancho de las columnas
                            body: [
                                [
                                    {
                                        image: logo_empresa,
                                        width: 90,
                                        absolutePosition: { x: 20, y: 10 }
                                    },
                                    [
                                        {
                                            text: 'AGROINVERSIONES DIVERSAS LA SELVA, S.A.',
                                            style: 'headerText'
                                        },
                                        {
                                            text: 'Empresa Test',
                                            style: 'headerText'
                                        },
                                        {
                                            text: '0 Avenida 5-35, Zona 9 Guatemala',
                                            style: 'headerText'
                                        },
                                        {
                                            text: 'test@gmail.com',
                                            style: 'headerText'
                                        },
                                        {
                                            text: 'NIT: 1181185-4',
                                            style: 'headerText'
                                        },
                                        {
                                            text: 'TEL: (502) 2505 1000',
                                            style: 'headerText'
                                        },


                                    ],
                                    [

                                        {
                                            text: 'Factura',
                                            style: 'felText',

                                        },
                                        {
                                            text: 'DOCUMENTO TRIBUTARIO ELECTRONICO',
                                            style: 'felText',

                                        },
                                        {
                                            text: 'SERIE: 49491',
                                            style: 'felText',

                                        },
                                        {
                                            text: 'No. 54485151',
                                            style: 'felText',

                                        },
                                        {
                                            text: 'Fecha certificacion: 12/12/2024 14:00:62',
                                            style: 'felText',

                                        },
                                        {
                                            text: 'Firma electronica:',
                                            style: 'felText',

                                        },
                                        {
                                            text: 'BA86F308-C4F7-4E13-A930-D859E3AC55FF',
                                            style: 'felText',
                                        },
                                    ],


                                ],

                            ]
                        },
                        layout: 'noBorders'
                    }
                ]
            ,
            content: [
                {
                    layout: 'noBorders',
                    table: {
                        widths: ['50%', '50%'],
                        body: [
                            [
                                {
                                    text: 'No. Interno: 49494',
                                    style: 'normalText'
                                },
                                {
                                    text: 'Vendedor: Nombre venedor',
                                    style: 'normalText',
                                    alignment: 'right'
                                }
                            ]
                        ]
                    }
                },
                {
                    marginTop: 10,
                    table: {
                        widths: ['71%', '*'],
                        body: [
                            [
                                [
                                    {
                                        text: [
                                            {
                                                text: 'Nombre: ',
                                                style: 'normalTextBold'
                                            },
                                            {
                                                text: 'Nobre clinete',
                                                style: 'normalText'
                                            }
                                        ]
                                    },
                                    {
                                        text: [
                                            {
                                                text: 'NIT: ',
                                                style: 'normalTextBold'
                                            },
                                            {
                                                text: '5184189-5',
                                                style: 'normalText'
                                            }
                                        ]
                                    },
                                    {
                                        text: [
                                            {
                                                text: 'Direccion: ',
                                                style: 'normalTextBold'
                                            },
                                            {
                                                text: 'Ciudad',
                                                style: 'normalText'
                                            }
                                        ]
                                    }
                                ],
                                [

                                    {
                                        text: [
                                            {
                                                text: 'Fecha: ',
                                                style: 'normalTextBold'
                                            },
                                            {
                                                text: '12/12/2024 14:15:15',
                                                style: 'normalText'
                                            }
                                        ]

                                    },
                                    {
                                        text: [
                                            {
                                                text: 'Tel: ',
                                                style: 'normalTextBold'
                                            },
                                            {
                                                text: '6419115',
                                                style: 'normalText'
                                            }
                                        ]
                                    },
                                    {
                                        text: [
                                            {
                                                text: 'Correo: ',
                                                style: 'normalTextBold'
                                            },
                                            {
                                                text: 'cliente@gmail.com',
                                                style: 'normalText'
                                            }
                                        ]
                                    }
                                ]
                            ]
                        ]
                    }
                },


                {
                    marginTop: 15,
                    marginBottom: 15,
                    table: {
                        widths: ['10%', '10%', '10%', '45%', '10%', '15%'],
                        body: [
                            [

                                {
                                    text: 'CODIGO',
                                    style: ['headerText', 'fillColor'],
                                },
                                {
                                    text: 'CANTIDAD',
                                    style: ['headerText', 'fillColor'],
                                },
                                {
                                    text: 'UM',
                                    style: ['headerText', 'fillColor'],
                                },
                                {
                                    text: 'DESCRIPCION',
                                    style: ['headerText', 'fillColor'],
                                },
                                {
                                    text: 'P/U',
                                    style: ['headerText', 'fillColor'],
                                },
                                {
                                    text: 'TOTAL',
                                    style: ['headerText', 'fillColor'],
                                }
                            ],
                            [

                                {
                                    text: 'KSNK-451',
                                    style: 'normalText',
                                    alignment: 'center',
                                    border: [true, false, false, false]
                                },
                                {
                                    text: '10',
                                    style: 'normalText',
                                    alignment: 'center',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: 'und',
                                    style: 'normalText',
                                    alignment: 'center',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: 'Lorem sunt nostrud nisi officia duis officia ex.',
                                    style: 'normalText',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: 'Q. 10.00',
                                    style: 'normalText',
                                    alignment: 'right',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: 'Q. 10000.00',
                                    style: 'normalText',
                                    alignment: 'right',
                                    border: [false, false, true, false]
                                }
                            ],
                            [

                                {
                                    text: 'KSNK-451',
                                    style: 'normalText',
                                    alignment: 'center',
                                    border: [true, false, false, false]
                                },
                                {
                                    text: '10',
                                    style: 'normalText',
                                    alignment: 'center',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: 'und',
                                    style: 'normalText',
                                    alignment: 'center',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: 'Lorem sunt nostrud nisi officia duis officia ex.',
                                    style: 'normalText',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: 'Q. 10.00',
                                    style: 'normalText',
                                    alignment: 'right',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: 'Q. 10000.00',
                                    style: 'normalText',
                                    alignment: 'right',
                                    border: [false, false, true, false]
                                }
                            ],
                            [
                                {
                                    text: 'TOTAL',
                                    style: ['headerText', 'fillColor'],
                                    colSpan: 5,
                                },
                                {}, // Celda adicional para fusionar con la primera celda
                                {}, // Celda adicional para fusionar
                                {}, // Celda adicional para fusionar
                                {}, // Celda adicional para fusionar
                                {
                                    text: 'Q.10000.00',
                                    style: 'headerText',
                                    alignment: 'right',
                                } // La última celda
                            ],
                            [
                                {
                                    text: 'TOTAL EN LETRAS: Qui eu minim excepteur nulla veniam pariatur aute quis non.',
                                    style: 'normalTextBold',
                                    colSpan: 6,
                                },
                                {}, {}, {}, {}, {},
                            ]
                        ]
                    }
                },
                [
                    {
                        text:
                            '*NO SE ACEPTAN CAMBIOS NI DEVOLUCIONES*',
                        style: 'headerText'
                    },
                    {
                        text:
                            '*GRACIAS POR TU COMPRA*',
                        style: 'headerText'
                    }
                ]

            ],
            styles: {
                textFooter: {
                    fontSize: 6,
                    color: '#134895',
                },
                fillColor: {
                    fillColor: '#134895',
                    color: '#ffffff'
                },
                felText: {
                    fontSize: 8,
                    bold: true,
                    marginLeft: 20,
                },
                headerText: {
                    fontSize: 8,
                    bold: true,
                    alignment: 'center',
                },
                normalText: {
                    fontSize: 8,
                },
                normalTextBold: {
                    fontSize: 8,
                    bold: true,
                },


            }
        };

        return docDefinition;



    }

    async getPDFCotizacionAlfaYOmega(doc: DocPrintModel) {
        let logo_empresa = await this._generateBase64('/assets/Empresa.jpg');
        let backgroundimg = await this._generateBase64('/assets/Image-not-found.png');

        let date: Date = doc.cliente.fecha;

        let fecha = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        let hora = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;



        let transacciones: any[] = [];

        doc.items.forEach(item => {
            transacciones.push(
                [
                    {
                        text: '50.00',
                        style: 'normalText'
                    },
                    {
                        text: item.cantidad,
                        style: 'normalText'
                    },
                    {
                        text: item.cantidadDias, //TODO:set precio dia
                        style: 'normalText'
                    },
                    {
                        text: item.sku,
                        style: 'normalText'
                    },
                    {
                        text: item.descripcion,
                        style: 'normalText'
                    },

                    {
                        image: backgroundimg,
                        fit: [50, 50],

                    },
                    {
                        text: item.unitario,
                        style: 'normalText'
                    },
                   
                    {
                        text: item.total,
                        style: 'normalText'
                    },
                ],

            );
        });




        var docDefinition: TDocumentDefinitions = {
            info: {
                title: 'TD_Cotizacion_IMG',
                author: 'DEMOSOFT S.A.',
            },
            pageMargins: [40, 130, 40, 30],
            footer: function (currentPage, pageCount) {
                return [
                    {
                        marginLeft: 40,
                        text: [
                            {
                                text: `${fecha} ${hora} `,
                                fontSize: 6,
                                color: '#999999'
                            },
                            {
                                text: 'Pagina ' + currentPage.toString() + ' de ' + pageCount,
                                fontSize: 6,
                            }
                        ]
                    }
                ];
            },
            header:
                // you can apply any logic and return any valid pdfmake element

                [

                    {
                        margin: [0, 15, 0, 0],
                        table: {

                            heights: 'auto',
                            widths: ['33%', '34%', '33%'], // Ancho de las columnas
                            body: [
                                [
                                    {
                                        image: logo_empresa,
                                        width: 115,
                                        absolutePosition: { x: 20, y: 10 }
                                    },
                                    [
                                        {
                                            text: 'AGROINVERSIONES DIVERSAS LA SELVA, S.A.',
                                            style: 'headerText'
                                        },
                                        {
                                            text: 'NIT: 7057806',
                                            style: 'headerText'
                                        },
                                        {
                                            text: 'ALFA Y OMEGA',
                                            style: 'headerText'
                                        },
                                        {
                                            text: '0 Avenida 5-35, Zona 9 Guatemala',
                                            style: 'headerText'
                                        },
                                        {
                                            text: '(502) 2505 1000',
                                            style: 'headerText'
                                        },
                                        {
                                            text: 'ALFA Y OMEGA ANTIGUA',
                                            style: 'headerText'
                                        },
                                        {
                                            text: '1a. Avenida Sur #21 Antigua Guatemala Sacatepequez',
                                            style: 'headerText'
                                        },
                                        {
                                            text: '(502) 7822 8375',
                                            style: 'headerText'
                                        },
                                    ],

                                    [
                                        {
                                            layout: 'noBorders',

                                            table: {

                                                widths: ['50%', '50%'],
                                                body: [
                                                    [
                                                        {
                                                            marginLeft: 20,
                                                            marginRight: 20,
                                                            table: {
                                                                widths: ['80%'],
                                                                body: [
                                                                    [
                                                                        {
                                                                            text: 'COTIZACIÓN',
                                                                            style: 'docText',
                                                                        },
                                                                    ],
                                                                ]
                                                            },
                                                            colSpan: 2,
                                                        },




                                                    ],

                                                ]
                                            }
                                        },
                                        {
                                            alignment: 'center',
                                            layout: 'noBorders',
                                            table: {

                                                widths: ['35%', '65%'],
                                                body: [
                                                    [
                                                        {
                                                            table: {
                                                                widths: ['100%'],
                                                                body: [
                                                                    [
                                                                        {
                                                                            text: 'NO. COTIZACIÓN',
                                                                            style: 'dataText',
                                                                        },
                                                                    ],
                                                                ]
                                                            },
                                                        },

                                                        {
                                                            table: {
                                                                widths: ['70%'],
                                                                body: [
                                                                    [
                                                                        {
                                                                            text: 'FECHA DE COTIZACIÓN',
                                                                            style: 'dataText',
                                                                        },
                                                                    ],
                                                                ]
                                                            },
                                                        },
                                                    ],
                                                ]
                                            }
                                        },
                                        {
                                            alignment: 'center',
                                            layout: 'noBorders',


                                            table: {

                                                widths: ['35%', '65%'],

                                                body: [
                                                    [
                                                        {
                                                            text: doc.noDoc,
                                                            style: 'dataText',
                                                            fontSize: 7,
                                                        },

                                                        {
                                                            marginRight: 25,

                                                            text: fecha,
                                                            style: 'dataText',
                                                            fontSize: 7,

                                                        },
                                                    ],
                                                ]
                                            }
                                        }
                                    ],

                                ],

                            ]
                        },
                        layout: 'noBorders'
                    }
                ]
            ,
            content: [
                {
                    alignment: 'left',
                    layout: 'noBorders', // optional
                    table: {
                        widths: ['10%', '50%', '*'],

                        body: [
                            [
                                {
                                    text: "CLIENTE:",
                                    style: 'normalTextBold',
                                },
                                {
                                    text: doc.cliente.nombre,
                                    style: 'normalText',
                                }
                                ,
                                {
                                    text: [
                                        {
                                            text: "Vendedor: ",
                                            style: 'normalTextBold',
                                        },
                                        {
                                            text: doc.vendedor,
                                            style: 'normalText',
                                        }
                                    ]
                                }
                            ],
                            [
                                {
                                    text: "TELEFONO:",
                                    style: 'normalTextBold',
                                },
                                {
                                    text: doc.cliente.tel,
                                    style: 'normalText',
                                }
                                ,
                                {
                                    text: [
                                        {
                                            text: "Correo: ",
                                            style: 'normalTextBold',
                                        },
                                        {
                                            text: doc.cliente.correo,
                                            style: 'normalText',
                                        }
                                    ]
                                }
                            ],
                            [
                                {
                                    text: "NIT:",
                                    style: 'normalTextBold',
                                },
                                {
                                    text: doc.cliente.nit,
                                    style: 'normalText',
                                }
                                ,
                                {
                                    text: [
                                        {
                                            text: "Fecha Evento: ",
                                            style: 'normalTextBold',
                                        },
                                        {
                                            text: `${this.formatDate(doc.fechas!.fechaInicio)} -  ${this.formatDate(doc.fechas!.fechaFin)}`,
                                            style: 'normalText',
                                        }
                                    ]
                                }
                            ],
                            [
                                {
                                    text: "EMAIL:",
                                    style: 'normalTextBold',
                                },
                                {
                                    text: doc.cliente.correo,
                                    style: 'normalText',
                                }
                                ,
                                {
                                    text: [
                                        {
                                            text: "Fecha Entrega: ",
                                            style: 'normalTextBold',
                                        },
                                        {
                                            text: this.formatDate(doc.fechas!.fechaInicioRef),
                                            style: 'normalText',
                                        }
                                    ]
                                }
                            ],
                            [
                                {
                                    text: "DIRECCION:",
                                    style: 'normalTextBold',
                                },
                                {
                                    text: doc.cliente.direccion,
                                    style: 'normalText',
                                }
                                ,
                                {
                                    text: [
                                        {
                                            text: "Fecha Recoger: ",
                                            style: 'normalTextBold',
                                        },
                                        {
                                            text: this.formatDate(doc.fechas!.fechaFinRef),
                                            style: 'normalText',
                                        }
                                    ]
                                }
                            ],
                        ]
                    }
                },
                {
                    marginTop: 10,
                    layout: 'noBorders',
                    table: {
                        widths: ["50%", "50%"],
                        body: [
                            [
                                {
                                    text: [
                                        {
                                            text: "Contacto: ",
                                            style: 'normalTextBold',
                                        },
                                        {
                                            text: doc.refObservacones!.observacion2,
                                            style: 'normalText',
                                        }
                                    ]
                                },
                                {
                                    text: [
                                        {
                                            text: "Descripcion: ",
                                            style: 'normalTextBold',
                                        },
                                        {
                                            text: doc.refObservacones!.descripcion,
                                            style: 'normalText',
                                        }
                                    ]
                                }
                            ],
                            [
                                {
                                    text: [
                                        {
                                            text: "Direccion Entrega: ",
                                            style: 'normalTextBold',
                                        },
                                        {
                                            text: doc.refObservacones!.observacion3,
                                            style: 'normalText',
                                        }
                                    ]
                                },
                                {
                                    text: [
                                        {
                                            text: "Observacion: ",
                                            style: 'normalTextBold',
                                        },
                                        {
                                            text: doc.refObservacones!.observacion,
                                            style: 'normalText',
                                        }
                                    ]
                                }
                            ]
                        ]
                    }
                },
                {
                    fillColor: '#CCCCCC',
                    table: {
                        widths: ['12%', '10%', '10%','10%', '23%', '15%', '10%',  '10%',],
                        body: [
                            [
                                {
                                    text: 'Precio Reposicion',
                                    style: 'normalTextBold'
                                },

                                {
                                    text: 'Cantidad',
                                    style: 'normalTextBold'
                                },
                                {
                                    text: 'Cantidad Dias',
                                    style: 'normalTextBold'
                                },
                                {
                                    text: 'Codigo',
                                    style: 'normalTextBold'
                                },
                                [
                                    {
                                        text: 'Descripción',
                                        style: 'normalTextBold'
                                    },
                                    {
                                        text: 'Alquier de:',
                                        style: 'normalTextBold'
                                    }
                                ],
                                {
                                    text: 'Imagen',
                                    style: 'normalTextBold'
                                },
                                {
                                    text: 'Precio Unitario',
                                    style: 'normalTextBold'
                                },
                               
                                {
                                    text: 'Total',
                                    style: 'normalTextBold'
                                },
                            ]
                        ]
                    }
                },
                {
                    layout: 'noBorders',
                    table: {

                        widths: ['12%', '10%', '10%', '23%', '15%', '10%', '10%', '10%',],

                        body: [
                            ...transacciones
                        ]
                    }
                },
                {
                    marginTop: 5,
                    marginLeft: 172,
                    fillColor: '#CCCCCC',
                    layout: 'noBorders',
                    table: {

                        widths: ['55%', '45%'],
                        body: [
                            [
                                {
                                    text: 'TOTAL',
                                    style: 'headerText'
                                },
                                {
                                    text: doc.montos.total,
                                    style: 'headerText',
                                    alignment: 'right',
                                }
                            ]
                        ]
                    }
                },
                {
                    marginTop: 5,
                    text: 'CONTRATO DE TERMINOS Y CONDICIONES DE LA COTIZACIÓN',
                    bold: true,
                    fontSize: 13,
                },
                {
                    marginTop: 2,
                    table: {
                        widths: ['100%'],
                        body: [
                            [
                                {
                                    text: [
                                        {
                                            text: '1. ',
                                            style: 'normalTextBold'
                                        },
                                        {
                                            text: 'Esta Cotización no es reservación',
                                            style: 'normalText'
                                        },
                                    ]
                                }
                            ]
                        ]
                    }
                },
                {
                    marginTop: 2,

                    table: {
                        widths: ['100%'],
                        body: [
                            [
                                {
                                    text: [
                                        {
                                            text: '2. ',
                                            style: 'normalTextBold'
                                        },
                                        {
                                            text: 'Al confirmar su cotizacion se requiere de contrato firmado',
                                            style: 'normalText'
                                        },
                                    ]
                                }
                            ]
                        ]
                    }
                },
                {
                    marginTop: 2,

                    table: {
                        widths: ['100%'],
                        body: [
                            [
                                {
                                    text: [
                                        {
                                            text: '3. ',
                                            style: 'normalTextBold'
                                        },
                                        {
                                            text: 'Los precios cotizados estan sujetos a cambios',
                                            style: 'normalText'
                                        },
                                    ]
                                }
                            ]
                        ]
                    }
                },
                {
                    marginTop: 2,

                    table: {
                        widths: ['100%'],
                        body: [
                            [
                                {
                                    text: [
                                        {
                                            text: '4. ',
                                            style: 'normalTextBold'
                                        },
                                        {
                                            text: 'Se cobrara Q 125.00 por cheque rechazado por cargos administrativos',
                                            style: 'normalText'
                                        },
                                    ]
                                }
                            ]
                        ]
                    }
                },
                {
                    marginTop: 2,

                    table: {
                        widths: ['100%'],
                        body: [
                            [
                                {
                                    text: [
                                        {
                                            text: '5. ',
                                            style: 'normalTextBold'
                                        },
                                        {
                                            text: 'Se solicitara cheque de garantía',
                                            style: 'normalText'
                                        },
                                    ]
                                }
                            ]
                        ]
                    }
                },
                {
                    marginTop: 2,

                    table: {
                        widths: ['100%'],
                        body: [
                            [
                                {
                                    text: [
                                        {
                                            text: '6. ',
                                            style: 'normalTextBold'
                                        },
                                        {
                                            text: 'Se cobrará por daños al mobiliario y equipo según contrato ',
                                            style: 'normalText'
                                        },
                                    ]
                                }
                            ]
                        ]
                    }
                }
            ],
            styles: {
                headerText: {
                    fontSize: 11,
                    bold: true,
                    alignment: 'center',
                },
                normalText: {
                    fontSize: 9,
                },
                normalTextBold: {
                    fontSize: 9,
                    bold: true,
                },
                dataText: {
                    fontSize: 6,
                    bold: true,
                },
                docText: {
                    fontSize: 17,
                    bold: true,
                    alignment: 'center'
                },

            }
        };

        return docDefinition;

    }


    async getPDFDocTMU(doc: DocPrintModel) {


        let logo_empresa = await this._generateBase64('/assets/empresa.png');;

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
                    image: logo_empresa,
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



    async getTestTemplate() {


        let logo_empresa = await this._generateBase64('/assets/logo_demosoft.png');

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
                    image: logo_empresa,
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