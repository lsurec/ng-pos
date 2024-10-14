import { Component, OnInit, ViewChild } from '@angular/core';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ApiService } from 'src/app/services/api.service';
import { TranslateService } from '@ngx-translate/core';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { FacturaService } from 'src/app/displays/prc_documento_3/services/factura.service';
import { SerieService } from 'src/app/displays/prc_documento_3/services/serie.service';
import { LocationInterface } from '../../interfaces/location.interface';
import { TableInterface } from '../../interfaces/table.interface';
import { ProductService } from 'src/app/displays/prc_documento_3/services/product.service';
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
import { LoadRestaurantService } from '../../services/load.restaurant.service';
import { RenameCheckComponent } from '../rename-check/rename-check.component';
import { MatDialog } from '@angular/material/dialog';
import { ImageRestaurantComponent } from '../image-restaurant/image-restaurant.component';
import { ProductRestaurantInterface } from '../../interfaces/product-restaurant';
import { OrderInterface } from '../../interfaces/order.interface';
import { GarnishTraInteface } from '../../interfaces/garnish.interface';

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
  indexCheck: number = 0;
  indexMoveCheck: number = 0;

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
    private _loadRestaurantService: LoadRestaurantService,
    private _dialog: MatDialog,
  ) {

  }

  verDetalleOrden: boolean = false;


  ngOnInit(): void {




    this.loadData();


  }

  //Abrir cerrar Sidenav
  close(reason: string) {
    this.sidenavend.close();
  }


  viewLocationTable() {
    this.restaurantService.viewLocations = true;
    this.restaurantService.viewRestaurant = false;
    this.restaurantService.viewMoveCheckTable = false;
  }

  viewRestaurant() {
    this.restaurantService.viewRestaurant = true;
    this.restaurantService.viewLocations = false;
    this.restaurantService.viewMoveCheckTable = false;
  }

  viewMoveCheckTable() {

    // if (this.restaurantService.orders.length == 0) {
    //   this._notificationService.openSnackbar("No hay cuentas para trasladar"); //TODO:Translate
    //   return;
    // }

    this.restaurantService.viewMoveCheckTable = true;
    this.restaurantService.viewLocations = false;
    this.restaurantService.viewRestaurant = false;
  }

  selectCheckAll() {

    this.restaurantService.selectAllChecks = !this.restaurantService.selectAllChecks;

    this.restaurantService.orders.forEach(element => {
      element.selected = this.restaurantService.selectAllChecks;
    });
  }

  selectTranCheckAll() {

    this.restaurantService.selectTranAllChecks = !this.restaurantService.selectTranAllChecks;

    this.restaurantService.orders[this.restaurantService.indexMoveCheck].transacciones.forEach(element => {
      element.selected = this.restaurantService.selectTranAllChecks;
    });
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

  goChecks() {
    // this.restaurantService.nameCheck = "";
    this.restaurantService.viewTranCheck = false;
    this.restaurantService.viewCheck = true;
  }

  verDetalles() {

    if (this.restaurantService.orders.length == 0) {
      this._notificationService.openSnackbar("No hay detalles para visualizar"); //TODO:Translate
      return
    }

    if (this.restaurantService.orders.length == 1) {
      this.restaurantService.viewCheck = false;
      this.restaurantService.viewTranCheck = true;
    }

    if (this.restaurantService.orders.length > 1) {
      this.restaurantService.viewCheck = true;
    }

    this.verDetalleOrden = !this.verDetalleOrden;
  }


  async refresh() {

    switch (this.restaurantService.idPantalla) {
      case 1: //carga clasiificaciones
        this._loadRestaurantService.loadClassifications();
        break;
      case 2: //carga productos
        this._loadRestaurantService.loadProducts();

        break;

      default:
        this.loadData();
        break;
    }

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

    // //cargar serie
    // let resClasifications: boolean = await this.loadClassifications();

    // //si algo salio mal
    // if (!resClasifications) {
    //   this.restaurantService.isLoading = false;
    //   return;
    // };

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

    this.restaurantService.updateOrdersTable();

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

    if (location == this.restaurantService.location) {
      return;
    }

    this.restaurantService.location = location;

    this.restaurantService.isLoading = true;
    await this.loadTables();
    this.restaurantService.isLoading = false;

  }

  selectTable(table: TableInterface) {
    this.restaurantService.table = table;

    this.notificationService.pinMesero();

  }

  backClassifications() {
    this.restaurantService.idPantalla = 1; //Clasificaciones
  }

  selectCheck(index: number) {

    this.indexCheck = index;

    this.restaurantService.nameCheck = this.restaurantService.orders[index].nombre;

    this.restaurantService.viewTranCheck = true;
    this.restaurantService.viewCheck = false;
  }

  renombrar(index: number): Promise<any> {
    return new Promise((resolve, reject) => {

      let dialogRef = this._dialog.open(RenameCheckComponent, { data: index })

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  restar(indexTra: number) {


    if (this.restaurantService.orders[this.indexCheck].transacciones[indexTra].cantidad == 1) {
      this.restaurantService.orders[this.indexCheck].transacciones[indexTra].cantidad == 1;
      //TODO: mostrar iconp de basura y dialogo para eliminar transaccion
      return;
    }

    //disminuir cantidad en 1
    this.restaurantService.orders[this.indexCheck].transacciones[indexTra].cantidad--;

    this.calcTotal();
  }


  sumar(indexTran: number) {
    this.restaurantService.orders[this.indexCheck].transacciones[indexTran].cantidad++;
    this.calcTotal();
  }

  calcTotal() {

  }

  cantidad: number = 1;


  validarNumeros(event: any) {
    // Obtener el código de la tecla presionada
    let codigoTecla = event.which ? event.which : event.keyCode;

    // Permitir solo números (códigos de tecla entre 48 y 57 son números en el teclado)
    if (codigoTecla < 48 || codigoTecla > 57) {
      event.preventDefault();
    }
  }


  imagen(producto: ProductRestaurantInterface) {

    //TODO: borrar la imagen
    producto.objeto_Imagen = "https://aprende.guatemala.com/wp-content/uploads/2016/10/Receta-para-preparar-un-desayuno-chapin.jpg";

    if (producto.objeto_Imagen) {
      this._dialog.open(ImageRestaurantComponent, { data: producto })
      return;
    }

    this._notificationService.openSnackbar("No hay imagen asociada a este producto"); //TODO:Translate

  }

  // getGuarniciones(indexTra: number) {
  //   return this.restaurantService.orders[this.indexCheck]
  //     .transacciones[indexTra]
  //     .guarniciones
  //     .map((e) =>
  //       `${e.garnishs.map((guarnicion) => guarnicion.descripcion).join(" ")} ${e.selected.descripcion}`)
  //     .join(", ");
  // }

  getGuarniciones(indexTra: number): string {
    let order: OrderInterface = this.restaurantService.orders[this.indexCheck];

    // Verificar si order, transacciones, guarniciones existen
    if (!order || !order.transacciones || !order.transacciones[indexTra] || !order.transacciones[indexTra].guarniciones) {
      return '';
    }

    let guarniciones: GarnishTraInteface[] = order.transacciones[indexTra].guarniciones;

    return guarniciones
      .map((garnish) => {
        const garnishDescriptions = garnish.garnishs
          .map((guarnicion) => guarnicion.descripcion)
          .join(' ');

        // Verificar si garnish.selected existe y tiene descripcion
        const selectedDescription = garnish.selected?.descripcion || '';

        return `${garnishDescriptions} ${selectedDescription}`;
      })
      .join(', ');
  }

  viewChecks() {
    this.restaurantService.viewChecksMove = true;
    this.restaurantService.viewTranCheckMove = false;
  }


}
