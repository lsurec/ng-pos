import { Injectable } from '@angular/core';
import { urlApi } from '../providers/api.provider';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ResApiInterface } from '../interfaces/res-api.interface';
import { DocPrintModel } from '../interfaces/doc-print.interface';
import { TranslateService } from '@ngx-translate/core';
import { ValidateProductInterface } from '../displays/listado_Documento_Pendiente_Convertir/interfaces/validate-product.interface';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { FacturaService } from '../displays/prc_documento_3/services/factura.service';
import { FormatoComandaInterface } from '../displays/prcRestaurante/interfaces/data-comanda.interface';

@Injectable()
export class PrinterService {

    private _urlBase: string = urlApi.apiServer.urlPrint;

    //inicializar http
    constructor(private _http: HttpClient,
        private _facturaService: FacturaService,
        private _translate: TranslateService,
    ) {
    }

    private _getStatusPrint(

        printer: string,
    ) {

        return this._http.get(`${this._urlBase}printer/online/${printer}`, { observe: 'response' });

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

                    console.error(err);


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

    ) {

        return this._http.get(`${this._urlBase}Printer/status`, { observe: 'response' });

    }

    getStatus(
    ): Promise<ResApiInterface> {
        return new Promise((resolve, reject) => {
            this._getStatus().subscribe(
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

                    console.error(err);


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
        return this._http.post(`${this._urlBase}Printer`, formData, { headers: headers, observe: 'response' });
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

                    console.error(err);

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
        return this._http.get(`${this._urlBase}printer`, { observe: 'response' });
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

                    console.error(err);

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
        let logo_empresa = await this._generateBase64('assets/empresa.png');
        let backgroundimg = await this._generateBase64('assets/image-not-found-icon.png');
        // data:image/jpeg;base64,




        let date: Date = doc.cliente.fecha;

        let fecha = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        let hora = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;



        let terminos: any[] = [];


        for (let i = 0; i < this._facturaService.terminosyCondiciones.length; i++) {
            const element = this._facturaService.terminosyCondiciones[i];
            terminos.push(
                {
                    marginTop: 2,
                    table: {
                        widths: ['100%'],
                        body: [
                            [
                                {
                                    text: [
                                        {
                                            text: `${i + 1}. `,
                                            style: 'normalTextBold'
                                        },
                                        {
                                            text: element,
                                            style: 'normalText'
                                        },
                                    ]
                                }
                            ]
                        ]
                    }
                },

            );
        }


        let transacciones: any[] = [];

        doc.items.forEach(item => {
            transacciones.push(
                [
                    {
                        text: item.precioRepocision,
                        style: 'normalText'
                    },
                    {
                        text: item.cantidad,
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
                        image: item.imagen64 ? `data:image/jpeg;base64,${item.imagen64}` : backgroundimg,
                        fit: [50, 50],
                        alignment: 'center',
                        
                    },
                    {
                        text: item.unitario,
                        alignment: 'right',
                    },
                    // {
                    //     text: item.cargos,
                    //     style: 'normalText'
                    // }, {
                    //     text: item.descuentos,
                    //     style: 'normalText'
                    // },
                    {
                        text: item.total,
                        alignment: 'right',
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
                                        image: doc.image64Empresa ? `data:image/jpeg;base64,${doc.image64Empresa}` : logo_empresa,
                                        width: 115,
                                        absolutePosition: { x: 20, y: 10 }
                                    },
                                    [
                                        {
                                            text: doc.empresa.razonSocial,
                                            style: 'headerText'
                                        },
                                        {
                                            text: doc.empresa.nombre,
                                            style: 'headerText'
                                        },
                                        {
                                            text: doc.empresa.direccion,
                                            style: 'headerText'
                                        },
                                        {
                                            text: doc.empresa.nit,
                                            style: 'headerText'
                                        },
                                        {
                                            text: doc.empresa.tel,
                                            style: 'headerText'
                                        },
                                        // {
                                        //     text: 'ALFA Y OMEGA ANTIGUA',
                                        //     style: 'headerText'
                                        // },
                                        // {
                                        //     text: '1a. Avenida Sur #21 Antigua Guatemala Sacatepequez',
                                        //     style: 'headerText'
                                        // },
                                        // {
                                        //     text: '(502) 7822 8375',
                                        //     style: 'headerText'
                                        // },
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
                                            text: doc.fechas!.fechaInicio && doc.fechas!.fechaFin ? `${this.formatDate(doc.fechas!.fechaInicio)} -  ${this.formatDate(doc.fechas!.fechaFin)}` : "",
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
                                            text: doc.fechas!.fechaInicioRef ? this.formatDate(doc.fechas!.fechaInicioRef) : "",
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
                                            text: doc.fechas!.fechaFinRef ? this.formatDate(doc.fechas!.fechaFinRef) : "",
                                            style: 'normalText',
                                        }
                                    ]
                                }
                            ],
                            [
                                {
                                    text: "TIPO CLIENTE:",
                                    style: 'normalTextBold',
                                },
                                {
                                    text: doc.cliente.tipo,
                                    style: 'normalText',
                                }
                                ,
                                {
                                    text: [
                                        {
                                            text: "Tipo evento: ",
                                            style: 'normalTextBold',
                                        },
                                        {
                                            text: doc.documento.evento,
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
                // {
                //     marginTop: 10,
                //     text: [
                //         {
                //             text: "Evento: ",
                //             style: 'normalTextBold',
                //         },
                //         {
                //             text: `${doc.cantidadDias ?? 0}`,
                //             style: 'normalText',
                //         }
                //     ]
                // },
                {
                    marginTop: 10,
                    marginBottom: 10,
                    text: [
                        {
                            text: "Cantidad dias: ",
                            style: 'normalTextBold',
                        },
                        {
                            text: `${doc.cantidadDias ?? 0}`,
                            style: 'normalText',
                        }
                    ]
                },
                {
                    fillColor: '#CCCCCC',
                    table: {
                        widths: ['10%', '10%', '10%', '30%', '20%', '10%', '10%',],
                        // widths: ['10%', '10%', '10%', '20%', '10%', '10%', '10%', '10%', '10%',],
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
                                // {
                                //     text: 'Cargo',
                                //     style: 'normalTextBold'
                                // },
                                //  {
                                //     text: 'Descuento',
                                //     style: 'normalTextBold'
                                // },
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
                        widths: ['10%', '10%', '10%', '30%', '20%', '10%', '10%',],
                        body: [
                            ...transacciones
                        ]
                    }
                },
                {
                    marginTop: 5,
                    marginLeft: 175,
                    layout: 'noBorders',
                    table: {

                        widths: ['55%', '45%'],
                        body: [
                            [
                                {
                                    text: 'Sub-total',
                                    style: 'headerText'
                                },
                                {
                                    text: doc.montos.subtotal,
                                    style: 'headerText',
                                    alignment: 'right',
                                }
                            ]
                        ]
                    }
                },
                {
                    marginLeft: 180,
                    layout: 'noBorders',
                    table: {

                        widths: ['55%', '45%'],
                        body: [
                            [
                                {
                                    text: '(+) Cargos',
                                    style: 'headerText',
                                    color: 'green'
                                },
                                {
                                    text: doc.montos.cargos,
                                    style: 'headerText',
                                    alignment: 'right',
                                }
                            ]
                        ]
                    }
                },
                {
                    marginLeft: 195,
                    layout: 'noBorders',
                    table: {

                        widths: ['55%', '45%'],
                        body: [
                            [
                                {
                                    text: '(-) Descuentos',
                                    style: 'headerText',
                                    color: 'red'
                                },
                                {
                                    text: doc.montos.descuentos,
                                    style: 'headerText',
                                    alignment: 'right',
                                }
                            ]
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
                    marginTop: 10,
                    text: 'CONTRATO DE TERMINOS Y CONDICIONES DE LA COTIZACIÓN',
                    bold: true,
                    fontSize: 13,
                },
                ...terminos,
                {
                    marginTop: 10,
                    text: 'Cuentas',
                    bold: true,
                    fontSize: 13,
                },

                {
                    layout: {
                        hLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 1 : 0; // Línea horizontal solo en los bordes superior e inferior
                        },
                        vLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.widths!.length) ? 1 : 0; // Línea vertical solo en los bordes izquierdo y derecho
                        },
                        paddingTop: function (i, node) { return 0; },
                        paddingBottom: function (i, node) { return 0; }
                    },
                    marginTop: 5,
                    table: {
                        widths: ['100%'],
                        body: [
                            [
                                {
                                    text: "ALFA Y OMEGA",
                                    style: 'normalText'
                                },

                            ],
                            [
                                {
                                    text: "BANCO INDUSTRIAL",
                                    style: 'normalText'
                                },



                            ],
                            [
                                {
                                    text: "006-015563-0",
                                    style: 'normalText'
                                },


                            ],
                            [
                                {
                                    text: "Monetarios",
                                    style: 'normalText'
                                },
                            ]
                        ]
                    }
                },
                {
                    layout: {
                        hLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 1 : 0; // Línea horizontal solo en los bordes superior e inferior
                        },
                        vLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.widths!.length) ? 1 : 0; // Línea vertical solo en los bordes izquierdo y derecho
                        },
                        paddingTop: function (i, node) { return 0; },
                        paddingBottom: function (i, node) { return 0; }
                    },
                    marginTop: 5,
                    table: {
                        widths: ['100%'],
                        body: [
                            [
                                {
                                    text: "ALFA Y OMEGA",
                                    style: 'normalText'
                                },
                            ],
                            [
                                {
                                    text: "BANCO GYT MONETARIOS",
                                    style: 'normalText'
                                },
                            ],
                            [
                                {
                                    text: "001-0020034-5",
                                    style: 'normalText'
                                },
                            ]
                        ]
                    }
                },
                {
                    layout: {
                        hLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 1 : 0; // Línea horizontal solo en los bordes superior e inferior
                        },
                        vLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.widths!.length) ? 1 : 0; // Línea vertical solo en los bordes izquierdo y derecho
                        },
                        paddingTop: function (i, node) { return 0; },
                        paddingBottom: function (i, node) { return 0; }
                    },
                    marginTop: 5,
                    table: {
                        widths: ['100%'],
                        body: [
                            [
                                {
                                    text: "BAC MONETARIOS",
                                    style: 'normalText'
                                },
                            ],
                            [
                                {
                                    text: "AGROINVERSIONES DIVERSAS LA SELVA S A",
                                    style: 'normalText'
                                },
                            ],
                            [
                                {
                                    text: "No.902811157",
                                    style: 'normalText'
                                },
                            ],
                        ]
                    }
                },
                {
                    marginTop:5,
                    text:'Enviar boleta a su ejecutiva.',
                    style:'normalTextBold'
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
                
                normalTextEnd: {
                    fontSize: 9,
                    alignment:'right'
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


        // let logo_empresa = await this._generateBase64('/assets/empresa.png');;

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
                                //TODO:REvisar traduccion
                                // { text: this._translate.instant('pos.factura.recibido'), style: 'normalText' },
                                { text: 'Monto:', style: 'normalText' },
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
                // {
                //     image: logo_empresa,
                //     fit: [161.73, 76.692],
                //     alignment: 'center',
                // },
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
                    text: `${this._translate.instant('pos.factura.serieInterna')}: ${doc.documento.serieInterna}`,
                    style: 'center',
                    margin: [0, 10, 0, 0],
                },
                {
                    text: `${this._translate.instant('pos.factura.no_interno')} ${doc.documento.noInterno}`,
                    style: 'center',
                },
                {
                    //TODO:Translate
                    text: `Cons. Interno: ${doc.documento.consecutivo}`,
                    style: 'center',
                },
                //TODO:Agregar datos de certificacion
                {
                    margin: [0, 10, 0, 0],

                    text: `${this._translate.instant('pos.factura.serie')}: ${doc.documento.serie}`,
                    style: 'centerBold',
                },
                {
                    text: `No. ${doc.documento.no}`,
                    style: 'centerBold',
                },
                {
                    text: `${this._translate.instant('pos.factura.fecha')} ${doc.documento.fechaCert}`,
                    style: 'centerBold',
                },
                {
                    text: this._translate.instant('pos.factura.noAutorizacion'),
                    style: 'centerBold',
                },
                {
                    text: doc.documento.autorizacion,
                    style: 'centerBold',
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

                    text: this._translate.instant('pos.factura.detalle_pagos'),
                    style: 'centerBold',
                },

                ...pagos,


                {
                    margin: [0, 10],
                    text: doc.mensajes[0],
                    style: 'centerBold',
                },
                //TODO:Agregar informacion del certificador
                {
                    text: `Certificador: ${doc.certificador.nombre}`,
                    style: 'center',

                },
                {
                    text: `NIT: ${doc.certificador.nit}`,
                    style: 'center',

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

    async getStatusAccountTMU() {


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
                title: "ESTADO DE CUENTA",
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
                {
                    text: "Club Campestre la montaña",
                    style: 'centerBold',
                },
                {
                    text: "Barra mirablosque",
                    style: 'centerBold',
                },
                {
                    text: "Mesa: Mesa 1",
                    style: 'centerBold',
                },
                {
                    text: "MIRALBOSQUE - 1",
                    style: 'centerBold',
                },
                //TABLA PRODUCTOS
                {
                    layout: 'headerLineOnly',
                    margin: [0, 10, 0, 0],
                    table: {

                        widths: ['15%', '60%', '25%'],
                        headerRows: 1,

                        body: [

                            [
                                { text: this._translate.instant('pos.factura.cant').toUpperCase(), style: 'normalTextBold' },
                                { text: this._translate.instant('pos.factura.descripcion').toUpperCase(), style: 'normalTextBold' },
                                // { text: this._translate.instant('pos.factura.p_u'), style: 'endTextBold' },
                                { text: this._translate.instant('pos.factura.monto').toUpperCase(), style: 'endTextBold' },
                            ],

                            [
                                {
                                    text: "100", style: 'normalText'
                                },
                                {
                                    text: "Consectetur velit duis ea nisi fugiat magna in in aliqua excepteur do.", style: 'normalText'
                                },
                                {
                                    text: "10000", style: 'normalText'
                                },
                            ]

                        ],
                    },

                },
                divider,
                {
                    layout: 'noBorders',
                    table: {

                        widths: ['75%', '25%'],
                        body: [
                            [
                                {
                                    text: "Sub-Total:", style: 'endText',
                                },
                                {
                                    text: "100,000.00", style: 'endText',
                                }
                            ],
                            [
                                {
                                    text: "Descuento:", style: 'endText',
                                },
                                {
                                    text: "100,000.00", style: 'endText',
                                }
                            ],
                            [
                                {
                                    text: "Total:", style: 'endText',
                                },
                                {
                                    text: "100,000.00", style: 'endText',
                                }
                            ]
                        ]
                    }
                },
                divider,
                {
                    margin: [0, 10, 0, 0],

                    layout: 'noBorders',
                    table: {

                        widths: ['75%', '25%'],

                        body: [
                            [
                                {
                                    text: "Propina:", style: 'endText',
                                },
                                divider,
                            ]

                        ]
                    }
                },
                {
                    text: "Nombre:", style: 'normalText', margin: [0, 10, 0, 10],
                },
                divider,
                {
                    margin: [0, 0, 0, 10],

                    text: "NiT:", style: 'normalText'
                },
                divider,
                {
                    margin: [0, 0, 0, 10],
                    text: "Email:", style: 'normalText'
                },
                divider,

                {
                    text: "Le atendió: Mesero", style: 'normalText', margin: [0, 20, 0, 0],
                },
                {
                    text: "12/12/2020", style: 'normalText', margin: [0, 10, 0, 0],
                },
                {
                    text: "12:12:12", style: 'normalText',
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
        }


        return docDefinition;
    }

    async getComandaTMU(format: FormatoComandaInterface) {

        let transacciones: any[] = [];

        format.detalles.forEach(item => {
            transacciones.push(
                [
                    {
                        text: item.cantidad,
                        style: "normalText10"
                    },
                    {
                        text: `${item.des_Producto}${item.observacion ? ' (' + item.observacion + ')' : ''}`,
                        style: "normalText10"
                    },
                ],
            );
        });

        let currentDate: Date = new Date(format.detalles[0].fecha_Hora);

        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();
        let hour = currentDate.getHours();
        let minutes = currentDate.getMinutes();
        let seconds = currentDate.getSeconds();

        let dateStr = `${day}/${month}/${year} ${hour}:${minutes}:${seconds}`;


        var docDefinition: TDocumentDefinitions = {

            info: {
                title: format.detalles[0].bodega,
                author: 'DEMOSOFT S.A.',
                subject: 'ticket',
                keywords: 'tck, sale',
            },
            pageSize: {
                width: 226.77,
                height: 'auto',
            },
            pageMargins: [5.66, 0, 5.66, 5.66],
            content: [
                {
                    text: format.detalles[0].des_Ubicacion, style: 'center10',
                },
                {
                    text: `Mesa: ${format.detalles[0].des_Mesa}`, style: 'center',
                },
                {
                    text: `${format.detalles[0].serie_Documento} - ${format.detalles[0].iD_Documento_Ref}`, style: 'center10',
                },
                {
                    margin: [10, 10, 10, 0],
                    layout: 'noBorders',
                    table: {
                        // headers are automatically repeated if the table spans over multiple pages
                        // you can declare how many rows should be treated as headers
                        headerRows: 1,
                        widths: ['10%', '90%'],
                        body: [
                            [{ text: 'Cant.', style: "normalText" }, { text: 'Descripción', style: "normalText" },],
                            ...transacciones
                        ],

                    }
                },
                {
                    margin: [0, 10, 0, 0],
                    text: `Le atendió: ${format.detalles[0].userName.toUpperCase()}`, style: 'center',
                },
                {
                    text: dateStr, style: 'center',
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
            ],
            styles: {
                center10: {
                    fontSize: 10,
                    alignment: 'center',
                },
                center: {
                    fontSize: 8,
                    alignment: 'center',
                },

                normalText: {
                    fontSize: 8,
                },
                normalText10: {
                    fontSize: 10,
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