import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FiltroInterface } from '../../interfaces/filtro.interface';
import { ImagenProductoInterface, ProductoInterface } from '../../interfaces/producto.interface';
import { MatDialog } from '@angular/material/dialog';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { ProductService } from '../../services/product.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { FacturaService } from '../../services/factura.service';
import { ProductoService } from '../../services/producto.service';
import { PrecioInterface } from '../../interfaces/precio.interface';
import { FactorConversionInterface } from '../../interfaces/factor-conversion.interface';
import { UnitarioInterface } from '../../interfaces/unitario.interface';
import { TraInternaInterface } from '../../interfaces/tra-interna.interface';
import { CargoDescuentoComponent } from '../cargo-descuento/cargo-descuento.component';
import { EventService } from 'src/app/services/event.service';
import { GlobalConvertService } from 'src/app/displays/listado_Documento_Pendiente_Convertir/services/global-convert.service';
import { ImagenComponent } from '../imagen/imagen.component';
import { ObjetoProductoInterface } from '../../interfaces/objeto-producto.interface';
import { DataUserService } from '../../services/data-user.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { ValidateProductInterface } from 'src/app/displays/listado_Documento_Pendiente_Convertir/interfaces/validate-product.interface';
import { PrecioDiaInterface } from '../../interfaces/precio-dia.interface';
import { TypeErrorInterface } from 'src/app/interfaces/type-error.interface';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.scss'],
  providers: [
    ProductService
  ]
})
export class DetalleComponent implements AfterViewInit {

  //para seleciconar el valor del texto del input
  @ViewChild('cantidadInput') cantidadInput?: ElementRef;

  //abirir y cerrar el mat expander
  desplegarCarDes: boolean = false;
  valueCargoDescuento: string = "";

  user: string = PreferencesService.user; //Usuario de la sesion
  token: string = PreferencesService.token; //token de la sesion
  empresa: number = PreferencesService.empresa.empresa; //empresa de la sesion
  estacion: number = PreferencesService.estacion.estacion_Trabajo; //estacion de la sesion
  documento: number = this.facturaService.tipoDocumento!; //Tipo docuemtno seleccioando (display)
  tipoDesCar: number = 1; //tipo de cargo o descuento (monto o porcentaje)
  tipoCambio: number = PreferencesService.tipoCambio;



  //opciones para cargos y descuetnos
  tipos: FiltroInterface[] = [
    {
      id: 1,
      nombre: this._translate.instant('pos.factura.porcentaje'),
    },
    {
      id: 2,
      nombre: this._translate.instant('pos.factura.monto'),
    },
  ];


  //filtros disponibles para bsuqueda de productos
  filtrosBusqueda: FiltroInterface[] = [
    {
      id: 1,
      nombre: this._translate.instant('pos.factura.descripcion'),
    },
    {
      id: 2,
      nombre: "SKU",
    },
  ];

  constructor(
    //intancias de los servicios
    private _dialog: MatDialog,
    private _notificationsService: NotificationsService,
    private _translate: TranslateService,
    private _productService: ProductService,
    public facturaService: FacturaService,
    public productoService: ProductoService,
    private _eventService: EventService,
    private _globalConvertService: GlobalConvertService,
    public dataUserService: DataUserService,
    private _dataUserService: DataUserService,

  ) {
    //filtro producto
    facturaService.filtrosProductos = PreferencesService.filtroProducto;
  }


  //editar transacciines que ay fueron agregadas
  async editTra(indexTra: number) {

    this.facturaService.isLoading = true;

    //Limpiar bodegas previas
    this.productoService.bodegas = [];
    //limpiar precios
    this.productoService.precios = [];

    //Asiganar cantidad de la transaccion
    this.productoService.cantidad = this.facturaService.traInternas[indexTra].cantidad.toString();


    let productTra: ProductoInterface = this.facturaService.traInternas[indexTra].producto; //producto de la transaccion
    let boddegaTra = this.facturaService.traInternas[indexTra].bodega; // bodega  de la transaccion
    let precioTra = this.facturaService.traInternas[indexTra].precio; //tipo precio de la transaccion

    //buscar bodegas del produxto
    let resBodega = await this._productService.getBodegaProducto(
      this.user,
      this.token,
      this.empresa,
      this.estacion,
      productTra.producto,
      productTra.unidad_Medida,
    );

    //Si bo se pudo obtener ls bodegas
    if (!resBodega.status) {

      this.facturaService.isLoading = false;


      let verificador = await this._notificationsService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );


      if (!verificador) return;

      this.verError(resBodega);

      return;

    }

    //bodegas encontradas
    this.productoService.bodegas = resBodega.response;


    //validar que existan bodegas
    if (this.productoService.bodegas.length == 0) {
      this.facturaService.isLoading = false;
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.sinBodegas'));
      return;
    }


    //Si solo hay una bodega
    if (this.productoService.bodegas.length == 1) {
      this.productoService.bodega = this.productoService.bodegas[0];
      let bodega: number = this.productoService.bodega.bodega;

      //buscar precios
      let resPrecio = await this._productService.getPrecios(
        this.user,
        this.token,
        bodega,
        productTra.producto,
        productTra.unidad_Medida,
        this.facturaService.cuenta?.cuenta_Correntista ?? 0,
        this.facturaService.cuenta?.cuenta_Cta ?? "0",
      );


      //Si no se pudo obtener precios
      if (!resPrecio.status) {

        this.facturaService.isLoading = false;


        let verificador = await this._notificationsService.openDialogActions(
          {
            title: this._translate.instant('pos.alertas.salioMal'),
            description: this._translate.instant('pos.alertas.error'),
            verdadero: this._translate.instant('pos.botones.informe'),
            falso: this._translate.instant('pos.botones.aceptar'),
          }
        );

        if (!verificador) return;

        this.verError(resPrecio);

        return;

      }

      //Precios encontrados
      let precios: PrecioInterface[] = resPrecio.response;


      //arammar nuevo objeo precio
      precios.forEach(element => {
        this.productoService.precios.push(
          {
            id: element.tipo_Precio,
            precioU: element.precio_Unidad,
            descripcion: element.des_Tipo_Precio,
            precio: true,
            moneda: element.moneda,
            orden: element.precio_Orden,
          }
        );
      });

      //si no hay precios buscar factor conversion
      if (this.productoService.precios.length == 0) {
        let resfactor = await this._productService.getFactorConversion(
          this.user,
          this.token,
          bodega,
          productTra.producto,
          productTra.unidad_Medida,
        );


        //si no sepudo obtener factores de conversion
        if (!resfactor.status) {

          this.facturaService.isLoading = false;

          let verificador = await this._notificationsService.openDialogActions(
            {
              title: this._translate.instant('pos.alertas.salioMal'),
              description: this._translate.instant('pos.alertas.error'),
              verdadero: this._translate.instant('pos.botones.informe'),
              falso: this._translate.instant('pos.botones.aceptar'),
            }
          );

          if (!verificador) return;

          this.verError(resfactor);

          return;

        }


        //factores de conversion enonytrados
        let factores: FactorConversionInterface[] = resfactor.response;


        //Armar objeto precios
        factores.forEach(element => {
          this.productoService.precios.push(
            {
              id: element.tipo_Precio,
              precioU: element.precio_Unidad,
              descripcion: element.des_Tipo_Precio,
              precio: false,
              moneda: element.moneda,
              orden: element.tipo_Precio_Orden,
            }
          );
        });

      }

      //Si solo ahy un precio seleccioarlo
      if (this.productoService.precios.length == 1) {

        let precioU: UnitarioInterface = this.productoService.precios[0];

        this.productoService.precio = precioU;
        this.productoService.total = precioU.precioU;
        this.productoService.precioU = precioU.precioU;
        this.productoService.precioText = precioU.precioU.toString();

        //si hay varios precios seleccionar uno por defeco segun campo orden
      } else if (this.productoService.precios.length > 1) {
        for (let i = 0; i < this.productoService.precios.length; i++) {
          const element = this.productoService.precios[i];
          if (element.orden) {
            this.productoService.precio = element;
            this.productoService.total = element.precioU;
            this.productoService.precioU = element.precioU;
            this.productoService.precioText = element.precioU.toString();

          }
          break;

        }
      }

    }

    //filizar cargfa
    this.facturaService.isLoading = false;


    //bsucar bodega de la transaccion
    let existBodega: number = -1;

    for (let i = 0; i < this.productoService.bodegas.length; i++) {
      const element = this.productoService.bodegas[i];
      if (element.bodega == boddegaTra!.bodega) {
        existBodega = i;
        break;
      }
    }

    //s i no se ecnotro la bodega crearla internamente y asiganrla
    if (existBodega == -1) {
      this.productoService.bodegas.push(boddegaTra!);

      this.productoService.bodega = this.productoService.bodegas[this.productoService.bodegas.length - 1];

    } else {
      //asiganr bodega de la transaccon 
      this.productoService.bodega = this.productoService.bodegas[existBodega];
    }


    //bsuacr p´roducto de la transaccion
    let existPrecio: number = -1;

    //si no se encontro el procuto crearlo unetnamente
    if (existPrecio == -1) {
      this.productoService.precios.push(precioTra!);

      this.productoService.precio = this.productoService.precios[this.productoService.precios.length - 1];

    } else {
      //asigar producto encontradp
      this.productoService.precio = this.productoService.precios[existPrecio];
    }

    //enviar indice de la transaccion para poder editarla despues
    this.productoService.indexEdit = indexTra;

    //abrir dialogo producto con lo datos cargados

    let resDialogProd: TypeErrorInterface = await this._notificationsService.openDetalleporoduct(productTra);

    this.productoService.cantidad = "1";

    if (resDialogProd) {
      //1 api /2 validaciones //para productos

      if (resDialogProd.type == 1) {


        let verificador = await this._notificationsService.openDialogActions(
          {
            title: this._translate.instant('pos.alertas.salioMal'),
            description: this._translate.instant('pos.alertas.error'),
            verdadero: this._translate.instant('pos.botones.informe'),
            falso: this._translate.instant('pos.botones.aceptar'),
          }
        );

        if (!verificador) return;

        this.verError(resDialogProd.error);

        return;
      }



      if (resDialogProd.type == 2) {
        this._notificationsService.openDialogValidations(resDialogProd.error);

      }
    }
  }
  

  addLeadingZero(number: number): string {
    return number.toString().padStart(2, '0');
  }

  //bsuqueda de productos
  async performanSearch() {

    this.facturaService.rangoIni = 1;
    this.facturaService.rangoFin = 20;

    let productos: ProductoInterface[] = [];

    //verificar que la cantidad sea numerica
    if (UtilitiesService.convertirTextoANumero(this.productoService.cantidad) == null) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.cantidadNumerica'));
      return;
    }

    //verificar que la cantidad sea mayor a 0
    if (UtilitiesService.convertirTextoANumero(this.productoService.cantidad)! <= 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.cantidadMayor'));
      return;
    }

    //Verificar que no hyaa formas de pago previamente asignadas al documento
    if (this.facturaService.montos.length > 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.eliminarPagos'));
      return;
    }


    //validar que siempre hay nun texto para buscar
    if (!this.facturaService.searchProduct) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.ingreseCaracter'));
      return;
    }

    //validar que exista una serie
    if (!this.facturaService.serie) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.sinSerie'));
      return;
    }


    //eliminar espacios al final de la cadena
    this.facturaService.searchProduct = this.facturaService.searchProduct.trim();


    //consumo api busqueda id

    this.facturaService.isLoading = true;



    let resproductoDesc = await this._productService.getProduct(
      this.token,
      this.user,
      this.estacion,
      this.facturaService.searchProduct,
      this.facturaService.rangoIni,
      this.facturaService.rangoFin,

    );


    if (!resproductoDesc.status) {

      this.facturaService.isLoading = false;

      let verificador = await this._notificationsService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.verError(resproductoDesc);

      return;

    };


    productos = resproductoDesc.response;


    //Modificar: se han aumentado los rangos
    if (productos.length < this.facturaService.intervaloRegistros) {
      this.facturaService.rangoIni = productos.length + 1;
      this.facturaService.rangoFin = this.facturaService.rangoIni + this.facturaService.intervaloRegistros;
    } else {
      this.facturaService.rangoIni += this.facturaService.intervaloRegistros;
      this.facturaService.rangoFin += this.facturaService.intervaloRegistros;
    }

    //si no hay coincie¿dencias mostrar alerta
    if (productos.length == 0) {
      this.facturaService.isLoading = false;

      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.sinCoincidencias'));
      return;
    }

    //reiniciar valores 
    this.productoService.total = 0;
    this.productoService.precios = [];
    this.productoService.precio = undefined;
    this.productoService.bodegas = [];
    this.productoService.bodega = undefined;
    // this.productoService.cantidad = "1";
    this.productoService.precioU = 0;
    this.productoService.precioText = "0";

    //si solo hay un producto seleccioanrlo por defecto

    let product: ProductoInterface;

    if (productos.length == 1) {

      product = productos[0];
    } else {
      this.facturaService.isLoading = false;

      let resDialogProd = await this._notificationsService.openProducts(productos);

      if (!resDialogProd) return;

      product = resDialogProd;

    }


    this.facturaService.isLoading = true;

    //buscar bodegas del produxto
    let resBodega = await this._productService.getBodegaProducto(
      this.user,
      this.token,
      this.empresa,
      this.estacion,
      product.producto,
      product.unidad_Medida,
    );

    //si fallo la busquea¿da de bodegas
    if (!resBodega.status) {

      this.facturaService.isLoading = false;


      let verificador = await this._notificationsService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.verError(resBodega);

      return;

    }

    //bodegas encontradas
    this.productoService.bodegas = resBodega.response;


    //validar que existan bodegas
    if (this.productoService.bodegas.length == 0) {
      this.facturaService.isLoading = false;
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.sinBodegas'));
      return;
    }


    this.productoService.bodega = this.productoService.bodegas.reduce((prev, curr) => {
      return (curr.orden < prev.orden) ? curr : prev;
    });

    //Si solo hay una bodega
    let bodega: number = this.productoService.bodega.bodega;

    //buscar precios
    let resPrecio = await this._productService.getPrecios(
      this.user,
      this.token,
      bodega,
      product.producto,
      product.unidad_Medida,
      this.facturaService.cuenta?.cuenta_Correntista ?? 0,
      this.facturaService.cuenta?.cuenta_Cta ?? "0",
    );


    //si no fiue pocible obtener los precios mmostrar error 
    if (!resPrecio.status) {

      //finalziuar proceso
      this.facturaService.isLoading = false;


      let verificador = await this._notificationsService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.verError(resPrecio);

      return;

    }

    //precios encontrados
    let precios: PrecioInterface[] = resPrecio.response;

    precios.forEach(element => {
      this.productoService.precios.push(
        {
          id: element.tipo_Precio,
          precioU: element.precio_Unidad,
          descripcion: element.des_Tipo_Precio,
          precio: true,
          moneda: element.moneda,
          orden: element.precio_Orden,
        }
      );
    });

    //si no hay precios buscar factor conversion
    if (this.productoService.precios.length == 0) {
      let resfactor = await this._productService.getFactorConversion(
        this.user,
        this.token,
        bodega,
        product.producto,
        product.unidad_Medida,
      );

      //si no feue posible controrar los factores de conversion mostrar error
      if (!resfactor.status) {

        this.facturaService.isLoading = false;

        let verificador = await this._notificationsService.openDialogActions(
          {
            title: this._translate.instant('pos.alertas.salioMal'),
            description: this._translate.instant('pos.alertas.error'),
            verdadero: this._translate.instant('pos.botones.informe'),
            falso: this._translate.instant('pos.botones.aceptar'),
          }
        );

        if (!verificador) return;

        this.verError(resfactor);

        return;

      }

      //factores de convrsion encontradposa
      let factores: FactorConversionInterface[] = resfactor.response;

      //nneyvo onbheoto precio interno
      factores.forEach(element => {
        this.productoService.precios.push(
          {
            id: element.tipo_Precio,
            precioU: element.precio_Unidad,
            descripcion: element.des_Tipo_Precio,
            precio: false,
            moneda: element.moneda,
            orden: element.tipo_Precio_Orden,
          }
        );
      });

    }


    if (this.productoService.precios.length > 0) {

      this.productoService.precio = this.productoService.precios.reduce((prev, curr) => {
        return (curr.orden < prev.orden) ? curr : prev;
      });

      if(!this.productoService.precio){
        this.productoService.precio = this.productoService.precios[0];
      }

      
      
      this.productoService.total = this.productoService.precio.precioU;
      this.productoService.precioU = this.productoService.precio.precioU;
      this.productoService.precioText = this.productoService.precio.precioU.toString();
      
    }

    


    if (this.productoService.bodegas.length > 1 || this.productoService.precios.length > 1 || this.facturaService.valueParametro(351)) {
      this.facturaService.isLoading = false;

      this.productoService.indexEdit = -1;

      let resDialogProd = await this._notificationsService.openDetalleporoduct(product);

      if (!resDialogProd) return;
      //1 api /2 validaciones //para productos
      if (resDialogProd.type == 1) {

        this.facturaService.isLoading = false;


        let verificador = await this._notificationsService.openDialogActions(
          {
            title: this._translate.instant('pos.alertas.salioMal'),
            description: this._translate.instant('pos.alertas.error'),
            verdadero: this._translate.instant('pos.botones.informe'),
            falso: this._translate.instant('pos.botones.aceptar'),
          }
        );

        if (!verificador) return;

        this.verError(resDialogProd.error);

        return;
      }

      if (resDialogProd.type == 2) {
        this.facturaService.isLoading = false;

        this._notificationsService.openDialogValidations(resDialogProd.error);
        return;
      }

      return;
    }

    //si no se abre el dialogo agregar ka transaccon directammente

    if (!this.productoService.bodega!.posee_Componente) {
      let resDisponibiladProducto: ResApiInterface = await this._productService.getValidateProducts(
        this.user,
        this.facturaService.serie!.serie_Documento,
        this.facturaService.tipoDocumento!,
        this.estacion,
        this.empresa,
        this.productoService.bodega!.bodega,
        this.facturaService.resolveTipoTransaccion(product.tipo_Producto),
        product.unidad_Medida,
        product.producto,
        UtilitiesService.convertirTextoANumero(this.productoService.cantidad)!,
        this.tipoCambio,
        this.productoService.precio!.moneda,
        this.productoService.precio!.id,
        this.token,

      );


      if (!resDisponibiladProducto.status) {

        this.facturaService.isLoading = false;

        let verificador = await this._notificationsService.openDialogActions(
          {
            title: this._translate.instant('pos.alertas.salioMal'),
            description: this._translate.instant('pos.alertas.error'),
            verdadero: this._translate.instant('pos.botones.informe'),
            falso: this._translate.instant('pos.botones.aceptar'),
          }
        );

        if (!verificador) return;

        this.verError(resDisponibiladProducto);

        return;

      };


      let mensajes: string[] = resDisponibiladProducto.response;

      if (mensajes.length > 0) {

        this.facturaService.isLoading = false;

        let validaciones: ValidateProductInterface[] = [
          {
            bodega: `${this.productoService.bodega!.nombre} (${this.productoService.bodega!.bodega})`,
            mensajes: mensajes,
            productoDesc: product.des_Producto,
            serie: `${this.facturaService.serie!.descripcion} (${this.facturaService.serie!.serie_Documento})`,
            sku: product.producto_Id,
            tipoDoc: `${this._dataUserService.nameDisplay} (${this.facturaService.tipoDocumento!})`,
          }
        ];

        this._notificationsService.openDialogValidations(validaciones);

        return;
      }
    }


    //Calcular totral de la transaccion
    //SI no hau precio seleccionado no calcular
    if (!this.productoService.precio) {
      this.productoService.total = 0;
      return;
    }

    //convertir cantidad de texto a numerica
    let cantidad = UtilitiesService.convertirTextoANumero(this.productoService.cantidad);

    //Calcular el total (cantidad * precio seleccionado)
    this.productoService.total = cantidad! * this.productoService.precio.precioU;

    //calcular precio dia si se necesita

    let precioDias: number = 0;
    let cantidadDias: number = 0;


    //Si el docuemnto tiene fecha inicio y fecha fin, parametro 44, calcular el precio por dias

  
    if (this.facturaService.valueParametro(44) && product.tipo_Producto != 2) {


      // let strFechaIni: string = this.facturaService.formatstrDateForPriceU(this.facturaService.fechaIni!);


      if (UtilitiesService.majorOrEqualDateWithoutSeconds(this.facturaService.fechaFin!, this.facturaService.fechaIni!)) {


        let startDate = this.addLeadingZero(this.facturaService.fechaIni!.getDate());
        let startMont = this.addLeadingZero(this.facturaService.fechaIni!.getMonth() + 1);
        let endDate = this.addLeadingZero(this.facturaService.fechaFin!.getDate());
        let endMont = this.addLeadingZero(this.facturaService.fechaFin!.getMonth() + 1);

        let dateStart: string = `${this.facturaService.fechaIni!.getFullYear()}${startMont}${startDate} ${this.addLeadingZero(this.facturaService.fechaIni!.getHours())}:${this.addLeadingZero(this.facturaService.fechaIni!.getMinutes())}:${this.addLeadingZero(this.facturaService.fechaIni!.getSeconds())}`;
        let dateEnd: string = `${this.facturaService.fechaFin!.getFullYear()}${endMont}${endDate} ${this.addLeadingZero(this.facturaService.fechaFin!.getHours())}:${this.addLeadingZero(this.facturaService.fechaFin!.getMinutes())}:${this.addLeadingZero(this.facturaService.fechaFin!.getSeconds())}`;


        let res: ResApiInterface = await this._productService.getFormulaPrecioU(
          this.token,
          dateEnd,
          dateStart,
          this.productoService.total.toString(),
        );



        if (!res.status) {

          this.facturaService.isLoading = false;

          let verificador = await this._notificationsService.openDialogActions(
            {
              title: this._translate.instant('pos.alertas.salioMal'),
              description: this._translate.instant('pos.alertas.error'),
              verdadero: this._translate.instant('pos.botones.informe'),
              falso: this._translate.instant('pos.botones.aceptar'),
            }
          );

          if (!verificador) return;

          this.verError(res);

          return;

        };


        let preciosDia: PrecioDiaInterface[] = res.response;



        if (preciosDia.length == 0) {

          this.facturaService.isLoading = false;

          res.response = 'No fue posible obtner los valores calculados para el precio dia'


          let verificador = await this._notificationsService.openDialogActions(
            {
              title: this._translate.instant('pos.alertas.salioMal'),
              description: this._translate.instant('pos.alertas.error'),
              verdadero: this._translate.instant('pos.botones.informe'),
              falso: this._translate.instant('pos.botones.aceptar'),
            }
          );

          if (!verificador) return;

          this.verError(res);

          return;

        };

        precioDias = preciosDia[0].monto_Calculado;
        cantidadDias = preciosDia[0].catidad_Dia;

      } else {

        this.facturaService.isLoading = false;

        precioDias = this.productoService.total;
        cantidadDias = 1;
        this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.precioDiasNoCalculado'));
        return;
      }
    }

    


    // /7agregar transaccion
    this.facturaService.addTransaction(
      {
        bodega: this.productoService.bodega,
        cantidad: UtilitiesService.convertirTextoANumero(this.productoService.cantidad)!,
        cantidadDias: this.facturaService.valueParametro(44) && product.tipo_Producto != 2 ? cantidadDias : 0,
        cargo: 0,
        consecutivo: 0,
        descuento: 0,
        estadoTra: 1,
        isChecked: false,
        operaciones: [],
        precio: this.productoService.precio!,
        precioCantidad: this.facturaService.valueParametro(44) && product.tipo_Producto != 2? this.productoService.total : null,
        precioDia: this.facturaService.valueParametro(44) && product.tipo_Producto != 2 ? precioDias : null,
        producto: product,
        total: this.facturaService.valueParametro(44) && product.tipo_Producto != 2 ? precioDias : this.productoService.total,
      }
    );


    this.productoService.cantidad = "1";
    //Transacion agregada
    this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.transaccionAgregada'));

    //finalzir proceso
    this.facturaService.isLoading = false;
  }

  //ver cargos y descuentos de una transccion
  verTansacciones(index: number) {

    if (this.facturaService.traInternas[index].operaciones.length == 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.sinCarDes'));
      return;
    }
    this._dialog.open(CargoDescuentoComponent, { data: index })
  }

  //Cambiar fdilto 
  onOptionChange(optionId: number) {
    this.facturaService.filtrosProductos = optionId;
  }

  //Cambiar ocpion para cargo y decuento
  onOptionCarDes(optionId: number) {
    this.tipoDesCar = optionId;
  }


  //Convertir un numero en texto a un dato numerico valido
  convertirTextoANumero(texto: string): number | null {
    // Verificar si la cadena es un número
    const esNumero = /^\d+(\.\d+)?$/.test(texto);

    if (esNumero) {
      // Realizar la conversión a número
      return parseFloat(texto);
      // Si quieres convertir a un número entero, puedes usar parseInt(texto) en lugar de parseFloat.
    } else {
      // Retornar null si la cadena no es un número
      return null;
    }
  }

  //Agregar cargo o descuebto
  cargoDescuento(operacion: number) {

    // operacion 1: cargo; 2: descuento

    //1:porcentaje
    //2:monto fijo


    if (this.convertirTextoANumero(this.valueCargoDescuento) == null) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.valorNumerico'));
      return;
    }

    let monto = this.convertirTextoANumero(this.valueCargoDescuento);

    if (monto! <= 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.mayorCero'));
      return;
    }

    if (this.facturaService.montos.length > 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.eliminarPagos'));
      return;
    }

    let prorrateo: number = 0;
    let totalTransactions: number = 0;


    let traCheks: TraInternaInterface[] = this.facturaService.traInternas.filter((transaction) => transaction.isChecked);

    if (traCheks.length == 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.seleccionar'));
      return
    }

    //total de las transacciones seleccionadas
    traCheks.forEach(element => {
      totalTransactions += element.total;
    });

    //si es por monto 
    if (this.tipoDesCar == 2) prorrateo = monto! / totalTransactions;

    //si es por porcentaje
    if (this.tipoDesCar == 1) {

      let porcentaje = 0;
      porcentaje = totalTransactions * monto!;
      porcentaje = porcentaje / 100;
      prorrateo = porcentaje / totalTransactions;
    }

    //multiplicar valores
    this.facturaService.traInternas.forEach(element => {


      let cargoDescuento = prorrateo * element.total;


      //elemento que se va a agregar
      if (element.isChecked) {
        element.operaciones.push(
          {
            cantidadDias: 0,
            consecutivo: 0,
            estadoTra: 0,
            precioCantidad: null,
            precioDia: null, //TODO:Usar precio dia
            isChecked: false,
            producto: element.producto,
            cantidad: 0,
            total: 0,
            cargo: operacion == 1 ? cargoDescuento : 0,
            descuento: operacion == 2 ? cargoDescuento * -1 : 0,
            operaciones: []
          }
        );
      }

    });

    this.facturaService.calculateTotales();
    this._notificationsService.openSnackbar(operacion == 1 ? this._translate.instant('pos.alertas.cargo') : this._translate.instant('pos.alertas.descuento'));
  }



  seleccionar() {
    this.facturaService.traInternas.forEach(element => {
      element.isChecked = this.facturaService.selectAllTra;
    });

  }

  // Función para manejar la eliminación de pagos seleccionados
  async eliminarProducto() {

    let traCheks: TraInternaInterface[] = this.facturaService.traInternas.filter((transaction) => transaction.isChecked);

    if (traCheks.length == 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.seleccionar'));
      return
    }

    let verificador: boolean = await this._notificationsService.openDialogActions(
      {
        title: this._translate.instant('pos.alertas.eliminar'),
        description: this._translate.instant('pos.alertas.perderDatos'),
        verdadero: this._translate.instant('pos.botones.aceptar'),
        falso: this._translate.instant('pos.botones.cancelar'),
      }
    );

    if (!verificador) return;
    // Realiza la lógica para eliminar los pagos seleccionados, por ejemplo:

    //guadar tr5ansaccione que se van a eliminar 
    if (this._globalConvertService.editDoc) {
      this.facturaService.traInternas.filter((transactions) => transactions.isChecked).forEach(element => {

        if (element.consecutivo != 0) {
          this.facturaService.transaccionesPorEliminar.push(element);
        }
      });
    }


    this.facturaService.traInternas = this.facturaService.traInternas.filter((transactions) => !transactions.isChecked);

    this.facturaService.calculateTotales();

    this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.transaccionesEliminadas'));

  }

  verError(res: ResApiInterface) {

    let dateNow: Date = new Date();

    let error = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,

    }


    PreferencesService.error = error;
    this._eventService.verInformeErrorEvent(true);
  }




  async imagen(producto: ProductoInterface) {

    this.facturaService.isLoading = true;

    //seacrh image in products 
    let resObjProduct: ResApiInterface = await this._productService.getObjetosProducto(
      this.token,
      producto.producto,
      producto.unidad_Medida,
      this.empresa,
    )
    this.facturaService.isLoading = false;


    //si no feue posible controrar los factores de conversion mostrar error
    if (!resObjProduct.status) {


      let verificador = await this._notificationsService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.verError(resObjProduct);

      return;

    }

    let imagenesObj: ObjetoProductoInterface[] = resObjProduct.response;


    if (imagenesObj.length == 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.sinImagenes'));
      return;
    }



    let imagenes: string[] = [];


    imagenesObj.forEach(element => {
      imagenes.push(element.url_Img);
    });


    let imagenesProducto: ImagenProductoInterface = {
      producto: producto,
      imagenesUrl: imagenes,
    }

    this._dialog.open(ImagenComponent, { data: imagenesProducto })
  }

  selectText() {
    this.focusAndSelectText();
  }


  ngAfterViewInit() {
    this.focusAndSelectText();
  }

  focusAndSelectText() {
    const inputElement = this.cantidadInput!.nativeElement;
    inputElement.focus();

    // Añade un pequeño retraso antes de seleccionar el texto
    setTimeout(() => {
      inputElement.setSelectionRange(0, inputElement.value.length);
    }, 0);
  }

}
