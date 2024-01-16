import { Component, Input, OnInit } from '@angular/core';
import { CompraInterface, ProductoInterface } from '../../interfaces/producto.interface';
import { EventService } from 'src/app/services/event.service';
import { DocumentoResumenInterface } from '../../interfaces/documento-resumen.interface';
import { Documento } from '../../interfaces/doc-estructura.interface';
import { LocalSettingsService } from 'src/app/services/local-settings.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { SerieInterface } from '../../interfaces/serie.interface';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { SerieService } from '../../services/serie.service';
import { CuentaService } from '../../services/cuenta.service';
import { ResponseInterface } from 'src/app/interfaces/response.interface';

@Component({
  selector: 'app-detalle-documento',
  templateUrl: './detalle-documento.component.html',
  styleUrls: ['./detalle-documento.component.scss'],
  providers: [
    LocalSettingsService,
    SerieService,
    CuentaService,
  ]
})
export class DetalleDocumentoComponent implements OnInit {

  @Input()
  estructura!: DocumentoResumenInterface;
  regresar: number = 6;
  verError: boolean = false;
  isLoading: boolean = false;

  valueCargoDescuento: string = "";

  user: string = PreferencesService.user;
  token: string = PreferencesService.token;

  empresa?: string ;
  estacion?: string ;
  serie?: string ;
  documento?:string ;

  constructor(
    private _eventService: EventService,
    private _localSettingService: LocalSettingsService,
    private _notificationsServie: NotificationsService,
    private _translate: TranslateService,
    private _serieService: SerieService,
    private _cuentaService:CuentaService,
  ) {

    this._eventService.regresarResumenDocHistorial$.subscribe((eventData) => {
      this.verError = false;
    });
  }
  ngOnInit(): void {
    this.loadData()

  }


  async loadData() {


    let objDoc: Documento = this.estructura!.estructura;

    let empresaId: number = objDoc.Doc_Empresa;
    let estacionId: number = objDoc.Doc_Estacion_Trabajo;
    let tipoDoc: number = objDoc.Doc_Tipo_Documento;
    let serieDoc: string = objDoc.Doc_Serie_Documento;
    let idCuenta: number = objDoc.Doc_Cuenta_Correntista;

    this.isLoading = true;

    let resEmpresa: ResApiInterface = await this._localSettingService.getEmpresas(
      this.user,
      this.token,
    );

    if (!resEmpresa.status) {

      this.isLoading = false;

      let verificador = await this._notificationsServie.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.aceptar'),
          falso: this._translate.instant('pos.botones.informe'),
        }
      );

      if (verificador) return;

      this.mostrarError(resEmpresa);

      return;

    }

    let empresas: EmpresaInterface[] = resEmpresa.response;

    for (let i = 0; i < empresas.length; i++) {
      const element = empresas[i];
      if (element.empresa == empresaId) {
        this.empresa = `${element.empresa_Nombre} (${empresaId})`;
        break;
      }
    }

    let resEstacion: ResApiInterface = await this._localSettingService.getEstaciones(
      this.user,
      this.token
    );


    if (!resEstacion.status) {

      this.isLoading = false;


      let verificador = await this._notificationsServie.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.aceptar'),
          falso: this._translate.instant('pos.botones.informe'),
        }
      );

      if (verificador) return;

      this.mostrarError(resEstacion);

      return;

    }


    let estaciones: EstacionInterface[] = resEstacion.response;

    for (let i = 0; i < estaciones.length; i++) {
      const element = estaciones[i];
      if (element.estacion_Trabajo == estacionId) {
        this.estacion = `${element.descripcion} (${estacionId})`;
        break;
      }
    }


    let resSerie: ResApiInterface = await this._serieService.getSerie(
      this.user,
      this.token,
      tipoDoc,
      empresaId,
      estacionId,
    );


    if (!resSerie.status) {

      this.isLoading = false;


      let verificador = await this._notificationsServie.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.aceptar'),
          falso: this._translate.instant('pos.botones.informe'),
        }
      );

      if (verificador) return;

      this.mostrarError(resSerie);

      return;

    }


    
    let series: SerieInterface[] = resSerie.response;

    for (let i = 0; i < series.length; i++) {
      const element = series[i];
      if (element.serie_Documento == serieDoc) {
        this.documento = `${element.des_Tipo_Documento} (${tipoDoc})`
        this.serie = `${element.descripcion} (${serieDoc})`;
        break;
      }
    }


    let resName:ResApiInterface = await  this._cuentaService.getNombreCuenta(
      this.token,
      idCuenta,
    ); 


    
    if (!resName.status) {

      this.isLoading = false;


      let verificador = await this._notificationsServie.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.aceptar'),
          falso: this._translate.instant('pos.botones.informe'),
        }
      );

      if (verificador) return;

      this.mostrarError(resName);

      return;

    }

    let name:ResponseInterface = resName.response;

    


    this.isLoading = false;




  }

  productos: ProductoInterface[] = [
    {
      producto: 26,
      unidad_Medida: 1,
      producto_Id: "ALM03",
      des_Producto: "VIUDA Y ADOBADO",
      des_Unidad_Medida: "Unidad",
      tipo_Producto: 1
    },
    {
      producto: 33,
      unidad_Medida: 1,
      producto_Id: "ALM10",
      des_Producto: "ADOBADO A LA PARRILLA",
      des_Unidad_Medida: "Unidad",
      tipo_Producto: 1
    },
  ]

  compras: CompraInterface[] = [
    {
      producto: this.productos[0],
      cantidad: 3,
      precioUnitario: 55.00,
      total: 165.00,
    },
    {
      producto: this.productos[1],
      cantidad: 4,
      precioUnitario: 20.00,
      total: 80.00,
    }
  ]

  pagos: any[] = [
    {
      id: 1,
      nombre: "EFECTIVO",
      monto: 80,
    },
    {
      id: 1,
      nombre: "CHEQUE",
      monto: 165.00,
      autorizacion: "30393650",
      referencia: "",
      banco: "Banco Industrial"
    }
  ]

  goBack() {
    // this._eventService.emitCustomEvent(true);
    this._eventService.verHistorialEvent(true);
  }

  mostrarError(res: ResApiInterface) {

    let dateNow: Date = new Date();

    let error = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,

    }

    PreferencesService.error = error;
    this.verError = true;
  }

}
