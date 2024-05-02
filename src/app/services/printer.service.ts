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



    async getReportCotizacion( doc: DocPrintModel) {
        let logo_empresa = await this._generateBase64('/assets/empresa.png');
        let backgroundimg = await this._generateBase64('/assets/Image-not-found.png');

        var docDefinition: TDocumentDefinitions = {
            pageMargins: [40, 130, 40, 30],
            footer: function (currentPage, pageCount) {
                return [
                    {
                        marginLeft: 40,
                        text: [
                            {
                                text: '30/04/2024 08:18:55 a. m. ',
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
                                                            text: '45874',
                                                            style: 'dataText',
                                                            fontSize: 7,
                                                        },

                                                        {
                                                            marginRight: 25,

                                                            text: '10/10/2024',
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
                                    text: "Mafer Brenes",
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
                                            text: 'Lendy Castañon',
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
                                    text: "45949849",
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
                                            text: 'alfayomegaeventos@hotmail.com',
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
                                    text: "45949849-1",
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
                                            text: '14/02/2021 - 14/02/2021',
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
                                    text: "",
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
                                            text: '14/02/2021',
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
                                    text: "Manzana A, Sector B1, Lote 12 Ciudad San Cristobal Zona 8 de Mixco",
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
                                            text: '14/02/2021',
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
                                            text: 'Mafer Bernes',
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
                                            text: 'Reprehenderit minim commodo Lorem cupidatat labore fugiat nostrud occaecat elit ipsum do.',
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
                                            text: 'Manzana A, Sector B1, Lote 12 Ciudad San Cristobal Zona 8 de Mixco',
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
                                            text: 'Reprehenderit minim commodo Lorem cupidatat labore fugiat nostrud occaecat elit ipsum do.',
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
                        widths: ['12%', '10%', '10%', '23%', '15%', '10%', '10%', '10%',],
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
                                {
                                    text: 'Precio x Dia',
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
                            [
                                {
                                    text: '50.00',
                                    style: 'normalText'
                                },
                                {
                                    text: '25',
                                    style: 'normalText'
                                },
                                {
                                    text: 'CRIS-196',
                                    style: 'normalText'
                                },
                                {
                                    text: 'COPA LABRADA DE PANAL PARA AGUA COLOR AMBAR - ',
                                    style: 'normalText'
                                },

                                {
                                    image: backgroundimg,
                                    fit: [50, 50],


                                },
                                {
                                    text: '50.00',
                                    style: 'normalText'
                                },
                                {
                                    text: '50.00',
                                    style: 'normalText'
                                },
                                {
                                    text: '50.00',
                                    style: 'normalText'
                                },
                            ],
                            [
                                {
                                    text: '50.00',
                                    style: 'normalText'
                                },
                                {
                                    text: '25',
                                    style: 'normalText'
                                },
                                {
                                    text: 'CRIS-196',
                                    style: 'normalText'
                                },
                                {
                                    text: 'COPA LABRADA DE PANAL PARA AGUA COLOR AMBAR - ',
                                    style: 'normalText'
                                },

                                {
                                    image: backgroundimg,
                                    fit: [50, 50],


                                },
                                {
                                    text: '50.00',
                                    style: 'normalText'
                                },
                                {
                                    text: '50.00',
                                    style: 'normalText'
                                },
                                {
                                    text: '50.00',
                                    style: 'normalText'
                                },
                            ]
                        ]
                    }
                },
                {
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
                                    text: '500.48',
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


    async getReport(doc: DocPrintModel) {

        
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

        
        let logo_empresa = await this._generateBase64('/assets/empresa.png');

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

        
        let logo_empresa  =await this._generateBase64('/assets/logo_demosoft.png');

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
                    image:logo_empresa,
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