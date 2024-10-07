import { Component, OnInit, ViewChild } from '@angular/core';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ApiService } from 'src/app/services/api.service';
import { TranslateService } from '@ngx-translate/core';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { FacturaService } from 'src/app/displays/prc_documento_3/services/factura.service';
import { SerieService } from 'src/app/displays/prc_documento_3/services/serie.service';
import { LocationInterface } from '../../interfaces/location.interface';
import { TableInterface } from '../../interfaces/table.interface';
import { WaiterInterface } from '../../interfaces/waiter.interface';
import { ClassificationRestaurantInterface } from '../../interfaces/classification-restaurant.interface';
import { ProductRestaurantInterface } from '../../interfaces/product-restaurant';
import { GarnishInterface, GarnishTreeInterface } from '../../interfaces/garnish.interface';
import { ProductService } from 'src/app/displays/prc_documento_3/services/product.service';
import { BodegaProductoInterface } from 'src/app/displays/prc_documento_3/interfaces/bodega-produto.interface';
import { UnitarioInterface } from 'src/app/displays/prc_documento_3/interfaces/unitario.interface';
import { PrecioInterface } from 'src/app/displays/prc_documento_3/interfaces/precio.interface';
import { FactorConversionInterface } from 'src/app/displays/prc_documento_3/interfaces/factor-conversion.interface';
import { MatSidenav } from '@angular/material/sidenav';
import { GlobalRestaurantService } from '../../services/global-restaurant.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { SerieInterface } from 'src/app/displays/prc_documento_3/interfaces/serie.interface';
import { DataUserService } from 'src/app/displays/prc_documento_3/services/data-user.service';
import { RestaurantService } from '../../services/restaurant.service';
import { components } from 'src/app/providers/componentes.provider';
import { EventService } from 'src/app/services/event.service';
import { RetryService } from 'src/app/services/retry.service';

@Component({
  selector: 'app-home-restaurant',
  templateUrl: './home-restaurant.component.html',
  styleUrls: ['./home-restaurant.component.scss'],
  providers: [
    RestaurantService,
    ProductService,
    SerieService,
  ]
})
export class HomeRestaurantComponent implements OnInit {


  user: string = PreferencesService.user; //usuario de la sesion
  token: string = PreferencesService.token; //usuario de la sesion
  empresa: EmpresaInterface = PreferencesService.empresa; //empresa de la sesion0
  estacion: EstacionInterface = PreferencesService.estacion; //estacion de la sesion
  tipoCambio: number = PreferencesService.tipoCambio; ///tipo cambio disponioble
  tipoDocumento: number = this._facturaService.tipoDocumento!; //Tipo de documento del modulo

  series: SerieInterface[] = [];


  products: ProductRestaurantInterface[] = [];
  product?: ProductRestaurantInterface;
  bodegas: BodegaProductoInterface[] = [];
  bodega?: BodegaProductoInterface;
  unitarios: UnitarioInterface[] = [];
  unitario?: UnitarioInterface;
  garnishs: GarnishTreeInterface[] = [];


  //Abrir/Cerrar SideNav
  @ViewChild('sidenavend')
  sidenavend!: MatSidenav;

  readonly regresar: number = 21; //id de la pnatalla

  nombreDocumento: string = "1 ejemplo"; //Descripcion del tipo de documento
  documentoName: string = ""; //Descripcion tipo de documento

  constructor(
    private notificationService: NotificationsService,
    public restaurantService: GlobalRestaurantService,
    public dataUserService: DataUserService,
    private _restaurantService: RestaurantService,
    private _notificationService: NotificationsService,
    private _translate: TranslateService,
    private _facturaService: FacturaService,
    private _serieService: SerieService,
    private _productService: ProductService,
    private _eventService: EventService,
    private _retryService: RetryService,
  ) {

  }

  ngOnInit(): void {
    this.loadData();

    if (this.restaurantService.tabMenu && !this.restaurantService.viewProducts) {
      this.loadData();
    }
  }

  //Abrir cerrar Sidenav
  close(reason: string) {
    this.sidenavend.close();
  }


  goBack(): void {
    this.restaurantService.viewLocations = true;
    this.restaurantService.viewRestaurant = false;
  }

  backHome() {
    components.forEach(element => {
      element.visible = false;
    });

    this._eventService.emitCustomEvent(false);
  }

  sendDoc() { }

  verHistorial() { }

  newDoc() { }

  printDoc() { }


  changeSerie() {


  }


  refresh() {

    if (this.restaurantService.tabMenu && !this.restaurantService.classification) {

      console.log("entyro");

      //lamar al evento
      this._retryService.classificationRetry();

      console.log("salio");


      return;
    }

    this.loadData();
  }


  async loadData() {



    this.restaurantService.isLoading = true;
    //cargar serie
    let resSerie: boolean = await this.loadSeries();

    //si algo salio mal
    if (!resSerie) {
      this.restaurantService.isLoading = false;
      return;
    };

    //Si no hay series mostrar mensaje
    if (this.series.length == 0) {

      this.restaurantService.isLoading = false;

      this._notificationService.openSnackbar("No existen series asignadas"); //TODO:Translate

      return;
    }

    //cargar ubicaciones
    let resLocation: boolean = await this.loadLocations();

    //Si algo salió mal
    if (!resLocation) {
      this.restaurantService.isLoading = false;
      return;
    };

    //Si solo hay una localizacion cargar mesas
    if (this.restaurantService.locations.length > 1) {
      this.restaurantService.isLoading = false;
      return;
    }

    //cargar mesa
    let resTable: boolean = await this.loadTables();

    //Si algo salió mal
    if (!resTable) {
      this.restaurantService.isLoading = false;
      return;
    };

  }

  async loadPrecioUnitario(): Promise<boolean> {
    this.unitario = undefined;
    this.unitarios = [];


    const apiPrecio = () => this._productService.getPrecios(
      this.user,
      this.token,
      this.bodega!.bodega,
      this.product!.producto,
      this.product!.unidad_Medida,
      1,
      "1",
    );

    let resPrecio: ResApiInterface = await ApiService.apiUse(apiPrecio);

    //si algo salio mal
    if (!resPrecio.status) {
      this.showError(resPrecio);

      return false;
    }

    let precios: PrecioInterface[] = resPrecio.response;


    precios.forEach(precio => {
      this.unitarios.push(
        {
          descripcion: precio.des_Tipo_Precio,
          id: precio.tipo_Precio,
          moneda: precio.moneda,
          orden: precio.precio_Orden,
          precio: true,
          precioU: precio.precio_Unidad,
        }
      )
    });


    if (this.unitarios.length > 0) {
      this.unitario = this.unitarios.reduce((prev, curr) => {
        // Si `prev.orden` o `curr.orden` son nulos, asignar un valor alto o bajo para que no interfieran
        const prevOrden = prev.orden ?? Infinity;  // Asignar Infinity si es nulo
        const currOrden = curr.orden ?? Infinity;
        return (currOrden < prevOrden) ? curr : prev;
      });

      return true;
    }


    const apiFactor = () => this._productService.getFactorConversion(
      this.user,
      this.token,
      this.bodega!.bodega,
      this.product!.producto,
      this.product!.unidad_Medida,
    )

    let resFactor: ResApiInterface = await ApiService.apiUse(apiFactor);

    //si algo salio mal
    if (!resFactor.status) {
      this.showError(resFactor);

      return false;
    }

    let factores: FactorConversionInterface[] = resFactor.response;

    factores.forEach(factor => {
      this.unitarios.push(
        {
          descripcion: factor.des_Tipo_Precio,
          id: factor.tipo_Precio,
          moneda: factor.moneda,
          orden: factor.tipo_Precio_Orden,
          precio: true,
          precioU: factor.precio_Unidad,
        }
      )
    });


    if (this.unitarios.length > 0) {
      this.unitario = this.unitarios.reduce((prev, curr) => {
        // Si `prev.orden` o `curr.orden` son nulos, asignar un valor alto o bajo para que no interfieran
        const prevOrden = prev.orden ?? Infinity;  // Asignar Infinity si es nulo
        const currOrden = curr.orden ?? Infinity;
        return (currOrden < prevOrden) ? curr : prev;
      });

    }

    return true;


  }

  async laodBodegas(): Promise<boolean> {

    this.bodegas = [];
    const api = () => this._productService.getBodegaProducto(
      this.user,
      this.token,
      this.empresa.empresa,
      this.estacion.estacion_Trabajo,
      this.product!.producto,
      this.product!.unidad_Medida,
    );

    let res: ResApiInterface = await ApiService.apiUse(api);

    //si algo salio mal
    if (!res.status) {
      this.showError(res);

      return false;
    }

    this.bodegas = res.response;

    if (this.bodegas.length > 0) {

      //TODO:Implementar en POS
      this.bodega = this.bodegas.reduce((prev, curr) => {
        // Si `prev.orden` o `curr.orden` son nulos, asignar un valor alto o bajo para que no interfieran
        const prevOrden = prev.orden ?? Infinity;  // Asignar Infinity si es nulo
        const currOrden = curr.orden ?? Infinity;
        return (currOrden < prevOrden) ? curr : prev;
      });
    }


    return true;
  }

  async loadGarnishs(): Promise<boolean> {
    this.garnishs = [];
    const api = () => this._restaurantService.getGarnish(
      this.product!.producto,
      this.product!.unidad_Medida,
      this.user,
      this.token,
    );

    let res: ResApiInterface = await ApiService.apiUse(api);

    //si algo salio mal
    if (!res.status) {
      this.showError(res);

      return false;
    }

    let garnishs: GarnishInterface[] = res.response;

    //load tree Garnish
    this.orderGarnish(garnishs);

    return true;



  }

  orderGarnish(garnishs: GarnishInterface[]) {

    let padres: GarnishTreeInterface[] = [];
    let hijos: GarnishTreeInterface[] = [];


    garnishs.forEach(garnish => {

      let item: GarnishTreeInterface = {
        children: [],
        route: [],
        idChild: garnish.producto_Caracteristica,
        idFather: garnish.producto_Caracteristica_Padre,
        item: garnish,
        selected: null,
      }

      if (garnish.producto_Caracteristica_Padre == null) {
        padres.push(item);
      } else {
        hijos.push(item);
      }


    });


    this.garnishs = this.ordenarNodos(padres, hijos);

    this.loadFirstharnish();

  }


  loadFirstharnish() {
    this.garnishs.forEach(element => {
      element.route.push(element);
    });
  }

  // Función recursiva para ordenar nodos infinitos, recibe nodos principales y nodos a ordenar
  ordenarNodos(
    padres: GarnishTreeInterface[], hijos: GarnishTreeInterface[]): GarnishTreeInterface[] {
    // Recorrer los nodos principales
    for (var i = 0; i < padres.length; i++) {
      // Item padre de la iteración
      let padre: GarnishTreeInterface = padres[i];

      // Recorrer todos los hijos en orden inverso para evitar problemas al eliminar
      for (var j = hijos.length - 1; j >= 0; j--) {
        // Item hijo de la iteración
        let hijo: GarnishTreeInterface = hijos[j];

        // Si coinciden (padre > hijo), agregar ese hijo al padre
        if (padre.idChild == hijo.idFather) {
          padre.children.push(hijo); // Agregar hijo al padre
          // Eliminar al hijo que ya se usó para evitar repetirlo
          hijos.splice(j, 1);

          // Llamar a la misma función (recursividad) se detiene cuando ya no hay hijos
          this.ordenarNodos(padre.children, hijos);
        }
      }
    }

    // Retornar nodos ordenados
    return padres;
  }

  async loadProducts(): Promise<boolean> {

    this.products = [];
    this.product = undefined;

    const api = () => this._restaurantService.getProducts(
      this.restaurantService.classification!.clasificacion,
      this.estacion.estacion_Trabajo,
      this.user,
      this.token,
    );

    let res: ResApiInterface = await ApiService.apiUse(api);

    //si algo salio mal
    if (!res.status) {
      this.showError(res);

      return false;
    }

    this.products = res.response;

    if (this.products.length == 0) {
      this._notificationService.openSnackbar("No hay productos paar esta clasificacion"); //TODO:Translate
      return false;
    }

    if (this.products.length == 1)
      this.product = this.products[0];

    return true;

  }

  //TODO:Implementar Try Catch
  async loadSeries(): Promise<boolean> {

    this.series = [];
    this.restaurantService.serie = undefined;

    const api = () => this._serieService.getSerie(
      this.user,
      this.token,
      this.tipoDocumento,
      this.empresa.empresa,
      this.estacion.estacion_Trabajo,
    );

    let res: ResApiInterface = await ApiService.apiUse(api);

    //si algo salio mal
    if (!res.status) {
      this.showError(res);

      return false;
    }

    this.series = res.response;

    if (this.series.length > 0) {
      //TODO:Implementar en POS
      this.restaurantService.serie = this.series.reduce((prev, curr) => {
        // Si `prev.orden` o `curr.orden` son nulos, asignar un valor alto o bajo para que no interfieran
        const prevOrden = prev.orden ?? Infinity;  // Asignar Infinity si es nulo
        const currOrden = curr.orden ?? Infinity;
        return (currOrden < prevOrden) ? curr : prev;
      });
    }

    return true;

  }


  async loadLocations(): Promise<boolean> {

    this.restaurantService.locations = [];
    this.restaurantService.location = undefined;

    const api = () => this._restaurantService.getLocations(
      this.tipoDocumento,
      this.empresa.empresa,
      this.estacion.estacion_Trabajo,
      this.restaurantService.serie!.serie_Documento,
      this.user,
      this.token,
    );


    let res: ResApiInterface = await ApiService.apiUse(api);

    //si algo salio mal
    if (!res.status) {

      this.showError(res);

      return false;
    }

    this.restaurantService.locations = res.response;

    if (this.restaurantService.locations.length == 1)
      this.restaurantService.location = this.restaurantService.locations[0];

    return true;
  }

  async loadTables(): Promise<boolean> {

    this.restaurantService.tables = [];
    this.restaurantService.table = undefined;

    const api = () => this._restaurantService.getTables(
      this.tipoDocumento,
      this.empresa.empresa,
      this.estacion.estacion_Trabajo,
      this.restaurantService.serie!.serie_Documento,
      this.restaurantService.location!.elemento_Asignado,
      this.user,
      this.token,
    );


    let res: ResApiInterface = await ApiService.apiUse(api);

    //si algo salio mal
    if (!res.status) {

      this.showError(res);

      return false;
    }

    this.restaurantService.tables = res.response;

    if (this.restaurantService.tables.length == 1)
      this.restaurantService.table = this.restaurantService.tables[0];

    return true;


  }

  async showError(res: ResApiInterface) {

    //Diaogo de confirmacion
    let verificador = await this._notificationService.openDialogActions(
      {
        title: this._translate.instant('pos.alertas.salioMal'),
        description: this._translate.instant('pos.alertas.error'),
        verdadero: this._translate.instant('pos.botones.informe'),
        falso: this._translate.instant('pos.botones.aceptar'),
      }
    );

    //Cancelar
    if (!verificador) return;

    let dateNow: Date = new Date(); //fecha del error

    //Crear error
    let error: ErrorInterface = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,
    }

    //Guardar error
    PreferencesService.error = error;

    //TODO:mostrar pantalla de error

    this.restaurantService.verError = true;

    return;
  }


  async selectLocation(location: LocationInterface) {
    this.restaurantService.location = location;

    this.restaurantService.isLoading = true;
    await this.loadTables();
    this.restaurantService.isLoading = false;

  }

  selectTable(table: TableInterface) {
    this.restaurantService.table = table;

    this.notificationService.pinMesero();

  }






}
