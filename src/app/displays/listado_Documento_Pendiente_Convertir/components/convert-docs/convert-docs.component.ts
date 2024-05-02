import { Component } from '@angular/core';
import { GlobalConvertService } from '../../services/global-convert.service';
import { DetailOriginDocInterInterface, DetailOriginDocInterface } from '../../interfaces/detail-origin-doc.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { ReceptionService } from '../../services/reception.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { NotificationsService } from 'src/app/services/notifications.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TranslateService } from '@ngx-translate/core';
import { ParamConvertDocInterface } from '../../interfaces/param-convert-doc.interface';
import { FacturaService } from 'src/app/displays/prc_documento_3/services/factura.service';
import { DataUserService } from 'src/app/displays/prc_documento_3/services/data-user.service';
import { SerieService } from 'src/app/displays/prc_documento_3/services/serie.service';
import { CuentaService } from 'src/app/displays/prc_documento_3/services/cuenta.service';
import { TipoTransaccionService } from 'src/app/displays/prc_documento_3/services/tipos-transaccion.service';
import { ParametroService } from 'src/app/displays/prc_documento_3/services/parametro.service';
import { PagoService } from 'src/app/displays/prc_documento_3/services/pago.service';
import { ReferenciaService } from 'src/app/displays/prc_documento_3/services/referencia.service';
import { ProductService } from 'src/app/displays/prc_documento_3/services/product.service';
import { TipoReferenciaInterface } from 'src/app/displays/prc_documento_3/interfaces/tipo-referencia';
import { TipoTransaccionInterface } from 'src/app/displays/prc_documento_3/interfaces/tipo-transaccion.interface';
import { ProductoInterface } from 'src/app/displays/prc_documento_3/interfaces/producto.interface';
import { PrecioInterface } from 'src/app/displays/prc_documento_3/interfaces/precio.interface';
import { UnitarioInterface } from 'src/app/displays/prc_documento_3/interfaces/unitario.interface';
import { ValidateProductInterface } from '../../interfaces/validate-product.interface';

@Component({
  selector: 'app-convert-docs',
  templateUrl: './convert-docs.component.html',
  styleUrls: ['./convert-docs.component.scss'],
  providers: [
    SerieService,
    CuentaService,
    TipoTransaccionService,
    ParametroService,
    PagoService,
    ReferenciaService,
    ProductService,
  ],
})
export class ConvertDocsComponent {
  selectAll: boolean = false; // seleccionar todas las trasnsacciones

  user: string = PreferencesService.user; //usjario de la seision  
  token: string = PreferencesService.token; //token del usuario


  constructor(
    //intancias para los serviicos
    public globalConvertSrevice: GlobalConvertService,
    private _receptionService: ReceptionService,
    private _notificationsService: NotificationsService,
    private _translate: TranslateService,
    private _facturaService: FacturaService,
    private _dataUserService: DataUserService,
    private _productService: ProductService,
    private _tipoTransaccionService: TipoTransaccionService,
  ) {

  }

  //Editar el documento que se está visualizando
  async editDoc() {

    //limpiar datos de la pantalla POS
    this._facturaService.clearData();

    //Asignar nuevo tipo de documento y descripcion
    this._dataUserService.nameDisplay = this.globalConvertSrevice.docOriginSelect!.documento_Descripcion;
    this._facturaService.tipoDocumento = this.globalConvertSrevice.docOriginSelect!.tipo_Documento;

    //Show pos screen
    this.globalConvertSrevice.editDoc = true;
  }

  //Buscar tipo transaccion
  private _resolveTipoTransaccion(tipo: number, tiposTra: TipoTransaccionInterface[]): number {

    //buscar tipo de trabsaccion dependientdo del tipo de producto
    for (let i = 0; i < tiposTra.length; i++) {
      const element = tiposTra[i];
      if (tipo == element.tipo) {
        //Devolver tipo de transaccion correspondiente al tipo de producto
        return element.tipo_Transaccion;
      }
    }

    //si no encontró el tipo de producto retorna 0
    return 0;
  }


  //Conversion de documento, trnasacciones seleccioandas
  async convertDoc() {

    //Buscar transaccionws seleccionadas
    let traCheks: DetailOriginDocInterInterface[] = this.globalConvertSrevice.detailsOrigin.filter((transaction) => transaction.checked);

    //Mostarr alerta si no hay transacciones selecconadas
    if (traCheks.length == 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.seleccionar'));
      return
    }


    //Mostrar dialogo de confirmacion antes de iniciar el proceso de conversions
    let verificador: boolean = await this._notificationsService.openDialogActions(
      {
        title: this._translate.instant('pos.documento.eliminar'),
        description: this._translate.instant('pos.documento.confirmar'),
        verdadero: this._translate.instant('pos.botones.aceptar'),
        falso: this._translate.instant('pos.botones.cancelar'),
      }
    );

    //opcion cancelar
    if (!verificador) return;

    //Iniciar carga
    this.globalConvertSrevice.isLoading = true;

    //buscar  informacion de la transacción


    let resTipoTransacciones: ResApiInterface = await this._tipoTransaccionService.getTipoTransaccion(
      this.user,
      this.token,
      this.globalConvertSrevice.docOriginSelect!.tipo_Documento,
      this.globalConvertSrevice.docOriginSelect!.serie_Documento,
      this.globalConvertSrevice.docOriginSelect!.empresa,
    );

    //si no se pudo actualziar mostrar alerta
    if (!resTipoTransacciones.status) {
      this.globalConvertSrevice.isLoading = false;
      this.showError(resTipoTransacciones);
      return;
    }

    let tiposTraDisponibles: TipoTransaccionInterface[] = resTipoTransacciones.response;


    let productsErr: ValidateProductInterface[] = [];

    //Validar que las transaccones por autorizar esten disponibles
    for (const tra of traCheks) {

      let resProduct = await this._productService.getProductId(
        this.token,
        tra.detalle.id,
      );



      if (!resProduct.status) {
        this.globalConvertSrevice.isLoading = false;
        this.showError(resProduct);
        return;
      }


      let productSearch: ProductoInterface[] = resProduct.response;


      let iProd: number = -1;

      for (let i = 0; i < productSearch.length; i++) {
        const element = productSearch[i];

        if (element.producto_Id = tra.detalle.id) {
          iProd = i;
          break;
        }

      }

      if (iProd == -1) {

        this.globalConvertSrevice.isLoading = false;


        resProduct.response = "Error al cargar las transacciones, no se encontró un producto";

        this.showError(resProduct);

        return;


      }


      //Detalled del producto encontrados
      let prod: ProductoInterface = productSearch[iProd];

      // /buscar precios
      let resPrecio = await this._productService.getPrecios(
        this.user,
        this.token,
        tra.detalle.bodega,
        prod.producto,
        prod.unidad_Medida,
      );


      if (!resPrecio.status) {
        this.globalConvertSrevice.isLoading = false;
        this.showError(resPrecio);
        return;
      }




      let precios: PrecioInterface[] = resPrecio.response;


      let existPrecio: number = -1;

      for (let i = 0; i < precios.length; i++) {
        const element = precios[i];
        if (element.tipo_Precio = tra.detalle.tipo_Precio) {
          existPrecio = i;
          break;
        }
      }

      let precioSelect: UnitarioInterface;

      if (existPrecio == -1) {
        //TODO:Seacrh factor de conversion
        precioSelect = {
          descripcion: "Precio",
          id: tra.detalle.tipo_Precio,
          moneda: 1,
          orden: 1,
          precio: true,
          precioU: tra.detalle.disponible ? 0 : tra.detalle.monto / tra.detalle.disponible
        }
      } else {
        precioSelect = {
          descripcion: precios[existPrecio].des_Tipo_Precio,
          id: precios[existPrecio].tipo_Precio,
          moneda: precios[existPrecio].moneda,
          orden: precios[existPrecio].precio_Orden,
          precio: true,
          precioU: precios[existPrecio].precio_Unidad
        }
      }


      //verifcar disponiobilidad del producto
      let resValidaDisponibilidad: ResApiInterface = await this._productService.getValidateProducts(
        this.user,
        this.globalConvertSrevice.docOriginSelect!.serie_Documento,
        this.globalConvertSrevice.docOriginSelect!.tipo_Documento,
        this.globalConvertSrevice.docOriginSelect!.estacion_Trabajo,
        this.globalConvertSrevice.docOriginSelect!.empresa,
        tra.detalle.bodega,
        this._resolveTipoTransaccion(prod.tipo_Producto, tiposTraDisponibles),
        prod.unidad_Medida,
        prod.producto,
        tra.disponibleMod,
        8,
        precioSelect.moneda,
        precioSelect.id,
        this.token,
      );


      if (!resValidaDisponibilidad.status) {
        this.globalConvertSrevice.isLoading = false;
        this.showError(resValidaDisponibilidad);
        return;
      }

      let mensajes: string[] = resValidaDisponibilidad.response;


      //si ha mensajes guaradar el prodcutco que genera  la validacion de disponiblidad
      if (mensajes.length != 0) {
        productsErr.push(
          {
            detalle: tra,
            mensajes: [...mensajes]
          }
        )

      }

    }

    //valiodar  si hay productos erroneos para mostrar

    if(productsErr.length > 0){
      //TODO:mostar diaologo y reporrte

      this._notificationsService.openSnackbar("Uno o mas productos no se ecnuentras disponoibles");
      return;
    }



    

    //Recorrer todas las transacciones seleccionadas
    for (const tra of traCheks) {


      //Actualizar transacciones que se vana a confirmar
      let resActualizar = await this._receptionService.postActualizar(
        this.user,
        this.token,
        tra.detalle.relacion_Consecutivo_Interno,
        tra.disponibleMod,
      );

      //si no se pudo actualziar mostrar alerta
      if (!resActualizar.status) {
        this.globalConvertSrevice.isLoading = false;
        this.showError(resActualizar);
        return;
      }

    }

    //Preparar docummento para convertirlo al documento destino
    let param: ParamConvertDocInterface = {
      pUserName: this.user,
      pO_Documento: this.globalConvertSrevice.docOriginSelect!.documento,
      pO_Tipo_Documento: this.globalConvertSrevice.docOriginSelect!.tipo_Documento,
      pO_Serie_Documento: this.globalConvertSrevice.docOriginSelect!.serie_Documento,
      pO_Empresa: this.globalConvertSrevice.docOriginSelect!.empresa,
      pO_Estacion_Trabajo: this.globalConvertSrevice.docOriginSelect!.estacion_Trabajo,
      pO_Fecha_Reg: this.globalConvertSrevice.docOriginSelect!.fecha_Reg,
      pD_Tipo_Documento: this.globalConvertSrevice.docDestinationSelect!.f_Tipo_Documento,
      pD_Serie_Documento: this.globalConvertSrevice.docDestinationSelect!.f_Serie_Documento,
      pD_Empresa: this.globalConvertSrevice.docOriginSelect!.empresa,
      pD_Estacion_Trabajo: this.globalConvertSrevice.docOriginSelect!.estacion_Trabajo,

    };


    //conversion de documento origen a documento destino
    let resConvert: ResApiInterface = await this._receptionService.postConvertir(
      this.token,
      param,
    );


    //si el srvicio de eejecuto incorrectaemnete
    if (!resConvert.status) {
      this.globalConvertSrevice.isLoading = false;
      this.showError(resConvert);
      return;
    }

    //Respuesta del servicio
    this.globalConvertSrevice.docDestinoSelect = resConvert.response;


    //Una vez actualizado el docuemnto cargar detalles del documneto destino
    await this.loadDetails();

    //Mostrar mantalla detalles documento destino

    //TODO: actualizar docuemmtos origen
    this.globalConvertSrevice.mostrarDetalleDocConversion()

    //finalizar carga
    this.globalConvertSrevice.isLoading = false;
  }

  //cargar detalles del docuemnto destino
  async loadDetails() {

    //Limpiar datos anterirores que puedan existir
    this.globalConvertSrevice.detialsDocDestination = [];


    //Consumo del servico 
    let res: ResApiInterface = await this._receptionService.getDetallesDocDestino(
      this.token,
      this.user,
      this.globalConvertSrevice.docDestinoSelect!.documento,
      this.globalConvertSrevice.docDestinoSelect!.tipoDocumento,
      this.globalConvertSrevice.docDestinoSelect!.serieDocumento,
      this.globalConvertSrevice.docDestinoSelect!.empresa,
      this.globalConvertSrevice.docDestinoSelect!.localizacion,
      this.globalConvertSrevice.docDestinoSelect!.estacion,
      this.globalConvertSrevice.docDestinoSelect!.fechaReg,
    )


    //si el consumo el servic o salio mal
    if (!res.status) {
      this.globalConvertSrevice.isLoading = false;
      this.showError(res);
      return;
    }

    //Respuesta del servicio
    this.globalConvertSrevice.detialsDocDestination = res.response;
  }



  //Cargar datos inciales
  async loadData() {

    //inciiar carga
    this.globalConvertSrevice.isLoading = true;

    //Consumo para obtener detalles del docuemnto origen
    let res: ResApiInterface = await this._receptionService.getDetallesDocOrigen(
      this.token,
      this.user,
      this.globalConvertSrevice.docOriginSelect!.documento,
      this.globalConvertSrevice.docOriginSelect!.tipo_Documento,
      this.globalConvertSrevice.docOriginSelect!.serie_Documento,
      this.globalConvertSrevice.docOriginSelect!.empresa,
      this.globalConvertSrevice.docOriginSelect!.localizacion,
      this.globalConvertSrevice.docOriginSelect!.estacion_Trabajo,
      this.globalConvertSrevice.docOriginSelect!.fecha_Reg,

    )

    //finalizar carga
    this.globalConvertSrevice.isLoading = false;


    //Si algo salio mmal al consumir el servicio
    if (!res.status) {

      this.showError(res);
      return;
    }


    //Respuesta del servicio
    let deatlles: DetailOriginDocInterface[] = res.response;

    //ñimpiar detalles del documento origen que podrían esxistir
    this.globalConvertSrevice.detailsOrigin = [];

    //Crear nuevo objetro para los detalles para poder seleccionarlos
    deatlles.forEach(element => {
      this.globalConvertSrevice.detailsOrigin.push(
        {
          checked: false,
          detalle: element,
          disponibleMod: element.disponible,
        }
      );
    });

  }

  //Mmostrar error
  async showError(res: ResApiInterface) {

    //Dialogo de confirmacion
    let verificador = await this._notificationsService.openDialogActions(
      {
        title: this._translate.instant('pos.alertas.salioMal'),
        description: this._translate.instant('pos.alertas.error'),
        verdadero: this._translate.instant('pos.botones.informe'),
        falso: this._translate.instant('pos.botones.aceptar'),
      }
    );

    //No hacer nada
    if (!verificador) return;

    //Ver informe de error
    let dateNow: Date = new Date(); //fecha del error

    //Crear error
    let error: ErrorInterface = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,
    }

    //guardar error
    PreferencesService.error = error;

    //mmostrar pantalla de error
    this.globalConvertSrevice.mostrarError(12);

    return;
  }

  //Seleccionar todas las transacciones
  seleccionar() {

    //contador de tareas 
    let count = 0;

    //Recorrer todas las transacciones
    this.globalConvertSrevice.detailsOrigin.forEach(element => {
      if (element.detalle.disponible == 0) {
        //Contar cuantas  transacciones tienen cantidad 0 disponoiles
        count++;
      } else {
        //seleccioanr  la que tiene disponible mas de cero
        element.checked = this.selectAll;
      }
    });


    //si hubo alguna transaccion con cantidad 0, mmostrar alerta de que no se seleccionó 
    if (count > 0 && this.selectAll) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.enCero'));
    }

  }

  //Seleccionar una transaccion
  selectTra(index: number) {


    //Si ya estpá seleccionada no hacer nada
    if (!this.globalConvertSrevice.detailsOrigin[index].checked) return;

    //verificar que la cantidad sea numerica
    if (UtilitiesService.convertirTextoANumero(this.globalConvertSrevice.detailsOrigin[index].disponibleMod.toString()) == null) {
      this.globalConvertSrevice.detailsOrigin[index].checked = false;
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.enCero'));
      return;
    }

    //SI la cantidad disponible es  no seleccioanr la transaccion y mostrra alerta
    if (this.globalConvertSrevice.detailsOrigin[index].disponibleMod <= 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.enCero'));

      this.globalConvertSrevice.detailsOrigin[index].checked = false;
      return;
    }

    //no se puede agregar una cantodad mayor a la que hay dispoible
    if (this.globalConvertSrevice.detailsOrigin[index].disponibleMod > this.globalConvertSrevice.detailsOrigin[index].detalle.disponible) {

      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.noMayor'));
      this.globalConvertSrevice.detailsOrigin[index].checked = false;

      return;
    }

    //Si la cantidad es  no hacer nada
    if (this.globalConvertSrevice.detailsOrigin[index].detalle.disponible == 0) {
      this.globalConvertSrevice.detailsOrigin[index].checked = false;
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.enCero'));
    }

  }

  //salir de la pagina
  backPage() {
    if (this.globalConvertSrevice.docDestino == 0) {
      //Regresar a pantala con documentos pe
      this.globalConvertSrevice.mostrarDocOrigen();
      return;
    }
    //mmostrar documento destino
    this.globalConvertSrevice.mostrarDocDestino()
  }

  //cambiar cantidad de una transaccion
  changeCantidad(detalle: DetailOriginDocInterInterface) {

    //verificar que la cantidad sea numerica
    if (UtilitiesService.convertirTextoANumero(detalle.disponibleMod.toString()) == null) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.cantidadPositiva'));
      detalle.checked = false;
      return;
    }

    //La cantidad no puede ser 0
    if (detalle.disponibleMod <= 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.noCero'));
      detalle.checked = false;
      return;
    }

    //La cantidad no puede ser mayor a ladisponible
    if (detalle.disponibleMod > detalle.detalle.disponible) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.noMayor'));
      detalle.checked = false;

      return;
    }

    //seleccioanr transaccion
    detalle.checked = true;
  }
}
