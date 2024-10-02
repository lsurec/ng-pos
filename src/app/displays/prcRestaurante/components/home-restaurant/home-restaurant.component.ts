import { Component, OnInit } from '@angular/core';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ApiService } from 'src/app/services/api.service';
import { RestaurantService } from '../../services/restaurant.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { FacturaService } from 'src/app/displays/prc_documento_3/services/factura.service';
import { SerieService } from 'src/app/displays/prc_documento_3/services/serie.service';
import { SerieInterface } from 'src/app/displays/prc_documento_3/interfaces/serie.interface';
import { LocationInterface } from '../../interfaces/locations.interface';
import { TableInterface } from '../../interfaces/table.interface';
import { WaiterInterface } from '../../interfaces/waiter.interface';
import { ClassificationRestaurantInterface } from '../../interfaces/classification-restaurant.interface';
import { ProductRestaurantInterface } from '../../interfaces/product-restaurant';
import { GarnishInterface, GarnishTreeInterface } from '../../interfaces/garnish.interface';
import { ProductService } from 'src/app/displays/prc_documento_3/services/product.service';

@Component({
  selector: 'app-home-restaurant',
  templateUrl: './home-restaurant.component.html',
  styleUrls: ['./home-restaurant.component.scss'],
  providers: [
    RestaurantService,
    ProductService,
  ]
})
export class HomeRestaurantComponent implements OnInit {


  isLoading: boolean = false;

  user: string = PreferencesService.user; //usuario de la sesion
  token: string = PreferencesService.token; //usuario de la sesion
  empresa: number = PreferencesService.empresa.empresa; //empresa de la sesion0
  estacion: number = PreferencesService.estacion.estacion_Trabajo; //estacion de la sesion
  tipoCambio: number = PreferencesService.tipoCambio; ///tipo cambio disponioble
  tipoDocumento: number = this._facturaService.tipoDocumento!; //Tipo de documento del modulo

  series: SerieInterface[] = [];
  serie?: SerieInterface;
  locations: LocationInterface[] = [];
  location?: LocationInterface;
  tables: TableInterface[] = [];
  table?: TableInterface;
  waiter?: WaiterInterface;
  classifications: ClassificationRestaurantInterface[] = [];
  classification?: ClassificationRestaurantInterface;
  products: ProductRestaurantInterface[] = [];
  product?: ProductRestaurantInterface;

  garnishs: GarnishTreeInterface[] = [];

  constructor(
    private _restaurantService: RestaurantService,
    private _notificationService: NotificationsService,
    private _translate: TranslateService,
    private _facturaService: FacturaService,
    private _serieService: SerieService,
    private _productService:ProductService,
  ) {

  }

  ngOnInit(): void {
    this.laodData();
  }


  async laodData() {

    this.isLoading = true;
    //cargar serie
    let resSerie: boolean = await this.loadSeries();

    //si algo salio mal
    if (!resSerie) {
      this.isLoading = false;
      return;
    };

    //Si no hay series mostrar mensaje
    if (this.series.length == 0) {

      this.isLoading = false;

      this._notificationService.openSnackbar("No existen series asignadas"); //TODO:Translate

      return;
    }

    //cargar ubicaciones
    let resLocation: boolean = await this.loadLocations();

    //Si algo salió mal
    if (!resLocation) {
      this.isLoading = false;
      return;
    };

    //Si solo hay una localizacion cargar mesas
    if (this.locations.length > 1) {
      this.isLoading = false;
      return;
    }

    //cargar mesa
    let resTable: boolean = await this.loadTables();

    //Si algo salió mal
    if (!resTable) {
      this.isLoading = false;
      return;
    };

  }

  async laodBodegas():Promise<boolean>{

    const api = () => this._productService.getBodegaProducto(
      this.user,
      this.token,
      this.empresa,
      this.estacion,
      this.product!.producto,
      this.product!.unidad_Medida,
    );

    let res: ResApiInterface = await ApiService.apiUse(api);

    //si algo salio mal
    if (!res.status) {
      this.showError(res);

      return false;
    }
    return true;
  }

  async loadGarnishs(): Promise<boolean> {
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

    const api = () => this._restaurantService.getProducts(
      this.classification!.clasificacion,
      this.estacion,
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


  async loadClassifications(): Promise<boolean> {

    const api = () => this._restaurantService.getClassifications(
      this.tipoDocumento,
      this.empresa,
      this.estacion,
      this.serie!.serie_Documento,
      this.user,
      this.token,
    );

    let res: ResApiInterface = await ApiService.apiUse(api);

    //si algo salio mal
    if (!res.status) {
      this.showError(res);

      return false;
    }


    this.classifications = res.response;

    if (this.classifications.length == 1)
      this.classification = this.classifications[0];


    return true;
  }

  async loadPin(): Promise<boolean> {

    this.waiter = undefined;

    const api = () => this._restaurantService.getAccountPin(
      this.token,
      this.empresa,
      "123" //TODO:Parametrizar pin
    );

    let res: ResApiInterface = await ApiService.apiUse(api);

    //si algo salio mal
    if (!res.status) {
      this.showError(res);

      return false;
    }

    let waiters: WaiterInterface[] = res.response;


    if (waiters.length == 0) {

      this._notificationService.openSnackbar("Pin invalido"); //TODO:Translate

      return false;
    }

    this.waiter = waiters[0];

    return true;
  }

  //TODO:Implementar Try Catch
  async loadSeries(): Promise<boolean> {

    this.series = [];

    const api = () => this._serieService.getSerie(
      this.user,
      this.token,
      this.tipoDocumento,
      this.empresa,
      this.estacion,
    );

    let res: ResApiInterface = await ApiService.apiUse(api);

    //si algo salio mal
    if (!res.status) {
      this.showError(res);

      return false;
    }

    this.series = res.response;

    //TODO:Implementar en POS
    this.serie = this.series.reduce((prev, curr) => {
      // Si `prev.orden` o `curr.orden` son nulos, asignar un valor alto o bajo para que no interfieran
      const prevOrden = prev.orden ?? Infinity;  // Asignar Infinity si es nulo
      const currOrden = curr.orden ?? Infinity;
      return (currOrden < prevOrden) ? curr : prev;
    });

    return true;

  }


  async loadLocations(): Promise<boolean> {
    const api = () => this._restaurantService.getLocations(
      this.tipoDocumento,
      this.empresa,
      this.estacion,
      this.serie!.serie_Documento,
      this.user,
      this.token,
    );


    let res: ResApiInterface = await ApiService.apiUse(api);

    //si algo salio mal
    if (!res.status) {

      this.showError(res);

      return false;
    }

    this.locations = res.response;

    if (this.locations.length == 1)
      this.location = this.locations[0];

    return true;
  }

  async loadTables(): Promise<boolean> {
    const api = () => this._restaurantService.getTables(
      this.tipoDocumento,
      this.empresa,
      this.estacion,
      this.serie!.serie_Documento,
      this.location!.elemento_Asignado,
      this.user,
      this.token,
    );


    let res: ResApiInterface = await ApiService.apiUse(api);

    //si algo salio mal
    if (!res.status) {

      this.showError(res);

      return false;
    }

    this.tables = res.response;

    if (this.tables.length == 1)
      this.table = this.tables[0];

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

    return;
  }



}
