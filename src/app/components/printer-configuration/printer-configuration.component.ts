import { Component, Input, OnInit } from '@angular/core';
import { EventService } from 'src/app/services/event.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { Location } from '@angular/common';
import { ImpresoraFormatoInterface } from 'src/app/interfaces/impre-form.interface';
import { PrinterService } from 'src/app/services/printer.service';
import { HttpClient } from '@angular/common/http';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';


(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-printer-configuration',
  templateUrl: './printer-configuration.component.html',
  styleUrls: ['./printer-configuration.component.scss'],
  providers: [PrinterService],

})
export class PrinterConfigurationComponent implements OnInit {

  impresoras: string[] = [];
  impresora?: string; //impresora para imprimir


  formatos: ImpresoraFormatoInterface[] = [
    {
      id: 1,
      nombre: "TM-U",
      checked: false
    },
    {
      id: 1,
      nombre: "A-06",
      checked: false
    },
    {
      id: 1,
      nombre: "A-04",
      checked: false
    },
  ]

  @Input() volver?: number;
  @Input() pantalla?: number;

  formato?: ImpresoraFormatoInterface; //formato de impresion
  vistaPrevia: boolean = false; //ver vista previa de configuraciones de la impresion
  imprimirNavegador: boolean = false; //para activar la impresion desde el navegador
  isLoading: boolean = false; //pantalla de carga
  copias: number = 1; //cantidad de copias a imprimir
  readonly regresar: number = 8; //id de la pantalla
  verError: boolean = false; //ocultar y mostrar pantalla de error


  constructor(
    private _eventService: EventService,
    private _location: Location,
    private _printerService: PrinterService,
    private _http: HttpClient,

  ) {

    //evento para regresar desde error 

    this._eventService.regresarDesdeImpresion$.subscribe((eventData) => {
      this.verError = false;
    });

    // //veriicar si hay impresora y marcarla
    // if (!PreferencesService.imprimir) {
    //   console.log('no hay impresora');
    // } else {
    //   for (let index = 0; index < this.impresoras.length; index++) {
    //     const element = this.impresoras[index];
    //     if (element.nombre.toLowerCase() == this.impresoras[index].nombre.toLowerCase()) {

    //       this.impresora = element;
    //     }
    //   }
    // }
    // //asignar un formato
    // this.formato = this.formatos[0];

    // if (!PreferencesService.vistaPrevia) {
    //   console.log('sin vista previa');
    // } else {
    //   if (PreferencesService.vistaPrevia == '1')
    //     this.vistaPrevia = true;
    // }
  }

  ngOnInit(): void {

    this.loadData();
  }




  async loadData() {

    this.isLoading = true;
    let resApi: ResApiInterface = await this._printerService.getPrinters();

    this.isLoading = false;


  }
  logo_empresa: any;
  imageBase64: any;

  async generateBase64(source: string): Promise<void> {
    this.imageBase64 = "";
    return new Promise((resolve, reject) => {
      this._http.get(source, { responseType: 'blob' })
        .subscribe(res => {
          const reader = new FileReader();
          reader.onloadend = () => {
            var base64data = reader.result;
            this.imageBase64 = base64data;
            //   console.log(base64data);
            resolve();
          }
          reader.readAsDataURL(res);
          //console.log(res);
        });
    });
  }

  async imprimir() {


    await this.generateBase64('/assets/logo_demosoft.png');
    this.logo_empresa = this.imageBase64;

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
        //TODO:translate
        title: 'TICKET DE PRUEBA',
        author: 'Demosoft',
        subject: 'ticket',
        keywords: 'tck, sale',
      },
      pageSize: {
        width: 130.77,
        height: 'auto',
      },
      pageMargins: [5.66, 0, 5.66, 5.66],
      content: [
        //DATOS EMPRESA
        {
          image: this.logo_empresa,
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
          //TODO:translate
          text: 'TICKET DE PRUEBA',
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
                //TODO:translate
                { text: 'FECHA: ' + fecha, style: 'center' },
                { text: 'HORA: ' + hora, style: 'center', },
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
                //TODO:Translate
                { text: 'CANT.', style: 'normalTextBold' },
                { text: 'DESCRIPCION', style: 'normalTextBold' },
                { text: 'P/U', style: 'endTextBold' },
                { text: 'MONTO', style: 'endTextBold' },
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
                //TODO:Translate
                { text: 'Sub-Total.', style: 'normalTextBold' },
                { text: '00.00', style: 'endTextBold' },

              ],
              [
                //TODO:Translate
                { text: 'Cargos', style: 'normalTextBold' },
                { text: '00.00', style: 'endTextBold' },

              ],
              [
                //TODO:Translate
                { text: 'Descuentos.', style: 'normalTextBold' },
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
                //TODO:Translate
                {
                  text: 'TOTAL',
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

          text: 'DETALLE PAGOS:',
          style: 'centerBold',
        },

        {
          text: 'EFECTIVO',
          style: 'endTextBold',
        },

        {
          table: {
            widths: ['50%', '50%',],
            body: [

              [

                //TODO:translate
                { text: 'Recibido:', style: 'normalText', },
                { text: '00.00', style: 'endText', },

              ],
              [
                //TODO:translate
                { text: 'Monto:', style: 'normalText' },
                { text: '00.00', style: 'endText', },

              ],
              [
                //TODO:translate
                { text: 'Cambio: ', style: 'normalText' },
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

    // pdfMake.createPdf(docDefinition).print();



    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.getBlob(async (blob) => {
      // ...
      var pdfFile = new File([blob], 'doc_tmu.pdf', { type: 'application/pdf' });

      let resPrint: ResApiInterface = await this._printerService.postPrint(pdfFile, "MHT-POS80", 1);

      console.log(resPrint);


    });





  }


  //regresar a home
  goBack() {

    switch (this.volver) {
      case 1:
        //desde home
        this._eventService.regresarHomedesdeImpresorasEvent(true);
        break;

      case 2:
        //desde resumen del documento     
        this._eventService.regresarResumenEvent(true);
        break;
      default:
        this._location.back();
        break;
    }
  }

  restar() {
    this.copias!--;

    if (this.copias! <= 0) {
      this.copias = 1;
    }
  }

  sumar() {
    this.copias!++;
  }

  guardar() {
    // PreferencesService.imprimir = this.impresora!.nombre; //nombre de la impresora seleccionada
    // if (!this.vistaPrevia) {
    //   PreferencesService.vistaPrevia = '0';
    // } else {
    //   PreferencesService.vistaPrevia = '1';
    // }
  }

  ver() {
    console.log(PreferencesService.imprimir);
    console.log(PreferencesService.vistaPrevia);
  }

  error() {
    this.verError = true;

  }
}
