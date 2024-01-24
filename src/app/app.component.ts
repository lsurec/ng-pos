import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PreferencesService } from './services/preferences.service';
import { LanguageInterface } from './interfaces/language.interface';
import { languagesProvider, indexDefaultLang } from './providers/languages.provider';
import { ThemeService } from './services/theme.service';
import { PrinterService } from './services/printer.service';
import { ResApiInterface } from './interfaces/res-api.interface';
import { HttpClient } from '@angular/common/http';

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';


(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [PrinterService]
})
export class AppComponent {

  //Idiomas disponibles para la aplicacion
  languages: LanguageInterface[] = languagesProvider;
  activeLang: LanguageInterface;
  idioma: number = indexDefaultLang;

  constructor(
    private translate: TranslateService,
    private _themeService: ThemeService,
    private _printerService: PrinterService,
    private _http: HttpClient,
  ) {


    this.loadData();

    //Buscar y obtener el leguaje guardado en el servicio  
    let getLanguage = PreferencesService.lang;
    if (!getLanguage) {
      this.activeLang = languagesProvider[indexDefaultLang];
      this.translate.setDefaultLang(this.activeLang.lang);
    } else {
      //sino se encuentra asignar el idioma por defecto
      this.idioma = +getLanguage;
      this.activeLang = languagesProvider[this.idioma];
      this.translate.setDefaultLang(this.activeLang.lang);
    };


    //buscar y asignar tema
    if (PreferencesService.theme == '1') {
      this._themeService.isDarkTheme = true;
      this._themeService.updateTheme();
    }

  }

  async loadData() {
    let resApi: ResApiInterface = await this._printerService.getPrinters();
    console.log(resApi.response);

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

    var docDefinition : TDocumentDefinitions= {
      info : {
        title: 'F001-000001',
        author: 'dmosoft',
        subject: 'ticket',
        keywords: 'tck, sale',
      },
      pageSize: {
        width: 326.77, // Ajusta la anchura según sea necesario
        height: 'auto', // La altura se ajustará automáticamente al contenido
      },
      pageMargins: [10,10],
      content: [
        //DATOS EMPRESA
        {
          image:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAREAAAB4CAMAAADixjaaAAAArlBMVEX////+/v53d3fyUCKAuwECpO//uQJxcXF0dHRubm5qamrW1ta8vLzt7e329vaIiIjGxsZ+fn4An+/519DxWzL++fhjY2PyRAD2+/7/tQAmqO7O6Png7czyTRzM4qn71YT+vSD+7cyKvyBztQCenp631oB2w/H94amWlpbynoyFyfHzlYGzs7Pk5OSnp6f65eDx9+b3+vHyNwD1w7ex03Sv2/L81Xv89N9TU1Pd7/lEUN+xAAAIlUlEQVR4nO2bb7ecthHGJeJaEgIEabNJW7eJE9qQBJH0X9J+/y9WzYwEgkVrn/juXZ+beY5f3IVBSD9Jo5nZtRAsFovFYrFYLBaLxWKxWCwWi8VisVgsFovFYrFetH5f1o9S/PSmrH88uut30h+K+uS7z8RfX31d0qs3Qr5Eib8U9fkPgcg3r0r65qUS+aQoJsJEUEzkKCZyFBM56rdNBOOP47XfLpEAo2t9Kw9MHkbkZHaeV0LY0YH6w/UnJLIFwqcd2N0UsvXdI5kI74wGmaXbdeMJiYi2j/LXIxWdzW+KdrhcaisfhkT0tapQ6o5E7KVGXcbuaqTCmnhzFsDHmarSyj6KiPBKIw+t70rEEHVdnSySOd5UDRDpNU3Pg4gIMeEKMcY5mr9tr9+DSFU3Vy6mq6sTIuODto2wA75/7qTsPJ46dpxa7MxdiOjhuG1EsyfiB0Birsg9k8QMS0RPydnbpbrU9yRS1QcHIcSgcyJhkQS3clmu/c2zSMhFZb0U8mJ0pe5KRE0HIlZVeyLC9o19EJCwh0foz6VNRDT2+Z5Eqvrgv0e9J3IeQD+XroiouxKJPiu/GaKhQEQ7nRE56WcpvttfLEaBhRsnl5+XiG4AiXb5IhENAmnMRuSqm+DvvbceItmdRfjXtm06lMKnYJWZZc+3cKPtTlol+4wQ+pFLl2jRrokfn5qI8ci/6rNZbeH0r/uNiJDNDFqxhY73y+SGYXDT0mOAgAZNK0Q/rsmHEH4On4JVMLN5jiZkv9CNcfZbq9KGVqnZ2aK56ODVtFyXOUrjJNLHJyeirL/g27ZQA2+EsC0n4oxSqmrTvMlm0EqTlAG/LHSwMK4NsVS4UUNzYRVM1WamnV2RwL5MN4yTyVVZV23mOjQmYHpMjFdDW1H5xzsQEU5BSLLNlBzDDbPIHRHo1JA2sncpXFlPKlHhTvMLOiczw4SvuUgcwXp8hwRCb5dd3HbdUuvcXpkeqe4uXukeRHoYnlm3jWhxUfaiRETYSsVJMkbtiEwzdROIyCbOLVjRXzWtROGNjjfC85FIcJ91anVNYvoPJ1IEcoNIC4MBRxWvzzVMXFsiEvJgBKLrYVyWSdW0azCmG1x4AhLEQMRqHIrRU7DSdNJTa3R0VHppmjk8j0SEoEyKWnWGLLQXrQsJKc1AHVPTSI4yUfF5Uf/8tWuEsrrap92MXZ9FgUjYVNg/NfQdpBltkxGBdkZre7fIrsKlVi9kFccLmzPlBB4aC3cqWDhh4aFBBa12nZ9w2MpBYcb7iWJWH4UtT/S3+K6sf30m3vytqH//VCJCnUlxawjY4X2+SCRlfetZ2DUbEagY0CG81DhAu+Yim4PBFsxCmyU8D164w0Hr8Ip4imMqE048/LDEeCQqxSPvlrx9t0SEelPTHhewBEJSJc+JxCWfBzA0MiKi+jzSrvS8HmG0K/AA6XFEa2kBN41F+y3BCp3SaZ5uR2i3h/yriFBEFmsCtKRrWyRCS74+llSIiBrX00TH8a8G6K4qYyORQ8KNvMy49ZJWErZwm8j3Zf3nC/n25y9L+vmXoh8JvhJfjvu5gSWiZJEIbSonT4msJxbl73mJiQ514B6rHcERrNMUl6nJcnDRodVg30Xk07L+/oX49o9lvS0SCZseNznCgegEl0vBj9Bk9lcrDojoISXslCuq3IxYgvugDRG8rrOdjLEIHt5Vm9uTVf8uIr8rioi8LukmkTVujRd9iUjsnLmquBIRlw4sGrTJ95awNQ4ksSEmfTzR68MmgwQcN1fzECLbePDd5A0KRGh5X1VmD0QorjLtORHRpOg0pAA4Je0F99HOfknvfwgRjFvDIvdmXewFIu5q8nMi7fsQgTyvWpmQJ8NFOnUfD5F2wLhVQi/iuD6ISHnXLHTGQ64YY/UqeFhaI2e75jF+RMa41WDkHctH50QoYi151pWInK49K7Zn5uR7ZT/p9KVHzKX2nhXfWb3zrLkPkRhEU9ksfn1z66xR420ikmo8+9N3Vz4GJp11FHP4tPROTl//KCIxisYOimxOz+ORvYc4I7LFV+sI0xbZnhGeYrXQh+UIOrUgT4jgSr4zkRi3VtkslmJWqme5rfojMLI7EGlpQ8xbcXChqJS+kUvPwjxg8kPV/8tWpYmHWpYs74mkc+1+RDBuxemXN4nEFEyNKdHq7HJNJPhFjG11HzMLiX610uAW+r4VMc3DEvcArtXRcvGp1UWtnbkiQhlDTCLvRSTufAwq5Q0iKbEJq7b3Ic9v+6Wezoi0WPbRaoG4tLPzmjEHIpfwLJCSuAVx/ceUWg+NDyadRaAp19oTkXIiR2LD65s7EsG4NTsxixWjnio2SrtpmlwIKM6IbGZDMHNDrLphMNxD0XUal3FKW0umtCcgHKbVnvbYFZFUXAqWTt+PSMpet1pasao4m1T10+TjTokEZ6lXKxo6Zcy4HLKrVFgIe0HlreKd+MIjEa/Xlqt7ErExbk2fy5XnvkrlcZzJUyJQaK22bw1h9pMv7LOCtDap0hJWic4r1Uota7x3IEJFcdKTEoGy5SWr0VThY1aTny/rL2rkADVNtbo2u1R19BPGOIAooLyaPQ1mwo46VpG1qV2THrcu1qK1qod5cz0hZjNGx2aDn1q/Busm6Mp/N8tuVrgAtTFPSYR+dZXNKvzQym73ffarK/oN1vYNVuebKQCstZtt9C57i2TWjwOaLXC+pJG3dp7CZTOM4GEzhHADKsrVBM1uqPD1TfaVUucXaMAt9gmJnH5zefUx/TLvYAt/d6A1uDgt1F2bpavx8uGJ7cb+R5onXZXJ7AmJfKDOa5Xva1Z8+j2bXefvIyLykYiJHMVEjmIiRzGRo5jIUUzkKCZylPhTWd8HIq+/Kun1SyXy57L+J8Uvb8t6qf9LnsVisVgsFovFYrFYLBaLxWKxWCwWi8VisVgs1ovW/wELH0cJQZI3NAAAAABJRU5ErkJggg==AAASUVORK5CYII=', //Logo
          fit: [141.73, 56.692],
          alignment: 'center',
        },
        { text: 'MICROSOFT CORPORATION', style: 'header', margin: [0, 10, 0, 0] },
        { text: 'MICROSOFT', style: 'header' },
        { text: 'Seattle Hanford St 1701, WA 98144', style: 'header' },
        { text: 'EIN 11603314323', style: 'header' },
    
        //TIPO Y NUMERO DOCUMENTO
        { text: 'FACTURA ELECTRÓNICA', style: 'header', margin: [0, 10, 0, 2.25] },
        { text: 'F001-000001', style: 'header', margin: [0, 2.25, 0, 0] },
    
        //DATOS CEBECERA FACTURAR
        {
          margin: [0, 10, 0, 0],
          table: {
            widths: ['25%', '35%', '15%', '25%'],
            body: [
              [
                { text: 'FECHA:', style: 'tHeaderLabel' },
                { text: '2023-09-30', style: 'tHeaderValue' },
                { text: 'HORA:', style: 'tHeaderLabel' },
                { text: '00:45:10', style: 'tHeaderValue' },
              ],
              [
                { text: 'PEDIDO:', style: 'tHeaderLabel' },
                { text: 'V001-000001', style: 'tHeaderValue', colSpan: 3 },
                {},
                {},
              ],
              [
                { text: 'PROYECTO:', style: 'tHeaderLabel' },
                { text: 'P001-000001', style: 'tHeaderValue', colSpan: 3 },
                {},
                {},
              ],
              [
                { text: 'CAJERO:', style: 'tHeaderLabel' },
                { text: 'RUTH JOIN', style: 'tHeaderValue', colSpan: 3 },
                {},
                {},
              ],
              [
                { text: 'VENDEDOR:', style: 'tHeaderLabel' },
                { text: 'MARK SAM', style: 'tHeaderValue', colSpan: 3 },
                {},
                {},
              ],
            ],
          },
          layout: 'noBorders',
        },
        //TABLA PRODUCTOS
        {
          margin: [0, 10, 0, 0],
          table: {
            widths: ['20%', '20%', '30%', '30%'],
            headerRows: 2,
            body: [
              [
                {
                  text: 'CÓDIGO - DESCRIPCIÓN',
                  colSpan: 4,
                  style: 'tProductsHeader',
                },
                {},
                {},
                {},
              ],
              [
                { text: 'CANT.', style: 'tProductsHeader' },
                { text: 'UM', style: 'tProductsHeader', alignment: 'center' },
                { text: 'PRECIO', style: 'tProductsHeader', alignment: 'right' },
                { text: 'TOTAL', style: 'tProductsHeader', alignment: 'right' },
              ],
              [
                {
                  text: 'PLK180024 - Pelikano Mel Bellota 18mm (2150x2440)',
                  style: 'tProductsBody',
                  colSpan: 4,
                },
                {},
                {},
                {},
              ],
              [
                { text: '0.50', style: 'tProductsBody', alignment: 'center' },
                { text: 'UND', style: 'tProductsBody', alignment: 'center' },
                { text: '295.00', style: 'tProductsBody', alignment: 'right' },
                { text: '147.50', style: 'tProductsBody', alignment: 'right' },
              ],
              [
                {
                  text: 'CANTOBELLOT01 - Canto Bellota 0.45x22mm',
                  style: 'tProductsBody',
                  colSpan: 4,
                },
                {},
                {},
                {},
              ],
              [
                { text: '40', style: 'tProductsBody', alignment: 'center' },
                { text: 'UND', style: 'tProductsBody', alignment: 'center' },
                { text: '0.90', style: 'tProductsBody', alignment: 'right' },
                { text: '36.00', style: 'tProductsBody', alignment: 'right' },
              ],
              [
                {
                  text: 'CANTOBELLOT01 - Canto Bellota 0.45x22mm',
                  style: 'tProductsBody',
                  colSpan: 4,
                },
                {},
                {},
                {},
              ],
              [
                { text: '40', style: 'tProductsBody', alignment: 'center' },
                { text: 'UND', style: 'tProductsBody', alignment: 'center' },
                { text: '0.90', style: 'tProductsBody', alignment: 'right' },
                { text: '36.00', style: 'tProductsBody', alignment: 'right' },
              ],
              [
                {
                  text: 'CANTOBELLOT01 - Canto Bellota 0.45x22mm',
                  style: 'tProductsBody',
                  colSpan: 4,
                },
                {},
                {},
                {},
              ],
              [
                { text: '40', style: 'tProductsBody', alignment: 'center' },
                { text: 'UND', style: 'tProductsBody', alignment: 'center' },
                { text: '0.90', style: 'tProductsBody', alignment: 'right' },
                { text: '36.00', style: 'tProductsBody', alignment: 'right' },
              ],
              [
                {
                  text: 'CANTOBELLOT01 - Canto Bellota 0.45x22mm',
                  style: 'tProductsBody',
                  colSpan: 4,
                },
                {},
                {},
                {},
              ],
              [
                { text: '40', style: 'tProductsBody', alignment: 'center' },
                { text: 'UND', style: 'tProductsBody', alignment: 'center' },
                { text: '0.90', style: 'tProductsBody', alignment: 'right' },
                { text: '36.00', style: 'tProductsBody', alignment: 'right' },
              ],
            ],
          },
         
        },
        {
          margin: [0, 10, 0, 0],
          table: {
            widths: ['25%', '35%', '15%', '25%'],
            body: [
              //TOTALES
              [
                { text: 'SUBTOTAL: S/', style: 'tTotals', colSpan: 2 },
                {},
                { text: '538.14', style: 'tTotals', colSpan: 2 },
                {},
              ],
              [
                { text: 'I.G.V: S/', style: 'tTotals', colSpan: 2 },
                {},
                { text: '96.86', style: 'tTotals', colSpan: 2 },
                {},
              ],
              [
                { text: 'TOTAL: S/', style: 'tTotals', colSpan: 2 },
                {},
                { text: '635.00', style: 'tTotals', colSpan: 2 },
                {},
              ],
              //TOTAL IMPORTE EN LETRAS
              [
                {
                  text: 'IMPORTE EN LETRAS:',
                  style: 'tTotals',
                  alignment: 'left',
                  colSpan: 4,
                  margin: [0, 4, 0, 0],
                },
                {},
                {},
                {},
              ],
              [
                {
                  text: 'SON: SEISCIENTOS TREINTA MIL QUINIENTOS CINCO Y CINCO CON 00/100 SOLES',
                  style: 'tProductsBody',
                  colSpan: 4,
                },
                {},
                {},
                {},
              ],
              //FORMAS PAGO
              [
                {
                  text: 'FORMA DE PAGO:',
                  style: 'tTotals',
                  alignment: 'left',
                  colSpan: 4,
                  margin: [0, 4, 0, 0],
                },
                {},
                {},
                {},
              ],
              [{ text: 'CONTADO', style: 'tProductsBody', colSpan: 4 }, {}, {}, {}],
              [
                { text: 'EFECTIVO: S/', style: 'tTotals', colSpan: 2 },
                {},
                { text: '635.00', style: 'tTotals', colSpan: 2 },
                {},
              ],
              [
                { text: 'VISA: S/', style: 'tTotals', colSpan: 2 },
                {},
                { text: '635.00', style: 'tTotals', colSpan: 2 },
                {},
              ],
              //DATOS CLIENTE
              [
                {
                  text: 'CLIENTE: ',
                  style: 'tTotals',
                  alignment: 'left',
                  colSpan: 4,
                  margin: [0, 6, 0, 0],
                },
                {},
                {},
                {},
              ],
              [
                { text: 'NOMBRES: ', style: 'tClientLabel' },
                { text: 'MADERAS CASTOREO S.A.', style: 'tClientValue', colSpan: 3 },
                {},
                {},
              ],
              [
                { text: 'DOC.ID: ', style: 'tClientLabel' },
                { text: '11155998822', style: 'tClientValue', colSpan: 3 },
                {},
                {},
              ],
              [
                { text: 'DIRECC.: ', style: 'tClientLabel' },
                {
                  text: '15Z INT. 7X6 URB. JARDIN - SAN ISIDRO - LIMA',
                  style: 'tClientValue',
                  colSpan: 3,
                },
                {},
                {},
              ],
            ],
          },
          layout: 'noBorders',
        },
        //NOTA DE PIE
        {
          text: 'ESTIMADO CLIENTE, TIENE COMO PLAZO MAXIMO DE 5 DIAS HABILES EN RECOGER SU MERCADERÍA, DICHO ESTO SE LE COBRARÍA PENALIDAD DE ALMACEN POR EL MONTO DE S/20.00 POR DIA, GRACIAS.',
          style: 'text',
          alignment: 'justify',
          margin: [0, 5],
        },
        //QR FACTURA
        {
          stack: [
            {
              qr: '20603831404|03|B002|000131|724.94|4,752.30|30/09/2023|1|70477554|v2Ez4sKStje4NiqcXiuTcmTtPwgbrqgnXpWPltJKEhk=|',
              fit: 115,
              alignment: 'center',
              eccLevel: 'Q',
              margin: [0, 10, 0, 3],
            },
            {
              text: 'Representación impresa del comprobante original. Consulta tu comprobante aquí:',
              style: 'text',
            },
            {
              text: 'https://x.microsoft.pse.pe/cpe/ace72300-0dfb-42d2-9ed7-0ba6e3cee01f',
              link: 'https://x.microsoft.pse.pe/cpe/ace72300-0dfb-42d2-9ed7-0ba6e3cee01f',
              style: 'link',
            },
          ],
        },
        //QR PROYECTO
        {
          stack: [
            {
              qr: '20603831404|03|B002|000131|724.94|4,752.30|30/09/2023|1|70477554|v2Ez4sKStje4NiqcXiuTcmTtPwgbrqgnXpWPltJKEhk=|',
              fit: 115,
              alignment: 'center',
              eccLevel: 'Q',
              margin: [0, 10, 0, 3],
            },
            {
              text: 'Consulta el estado de tu proyecto, escanea el QR o ingrese al siguiente link:',
              style: 'text',
            },
            {
              text: 'https://x.microsoft/ace72300-0dfb-42d2-9ed7-0ba6e3cee01f',
              link: 'https://x.microsoft/cpe/ace72300-0dfb-42d2-9ed7-0ba6e3cee01f',
              style: 'link',
            },
          ],
        },
      ]
    };

         pdfMake.createPdf(docDefinition).open();



    // const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    // pdfDocGenerator.getBlob(async (blob) => {
    //   // ...
    //   var pdfFile = new File([blob], 'doc_tmu.pdf', { type: 'application/pdf' });

    //   let resPrint: ResApiInterface = await this._printerService.postPrint(pdfFile, "MHT-POS80", 1);

    //   console.log(resPrint);


    // });





  }


}
