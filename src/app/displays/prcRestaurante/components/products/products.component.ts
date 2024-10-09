import { Component, OnInit } from '@angular/core';
import { elementos } from '../../interfaces/send-order.interface';
import { GlobalRestaurantService } from '../../services/global-restaurant.service';
import { ProductRestaurantInterface } from '../../interfaces/product-restaurant';
import { RestaurantService } from '../../services/restaurant.service';
import { FactorConversionInterface } from 'src/app/displays/prc_documento_3/interfaces/factor-conversion.interface';
import { PrecioInterface } from 'src/app/displays/prc_documento_3/interfaces/precio.interface';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ApiService } from 'src/app/services/api.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { GarnishInterface, GarnishTreeInterface } from '../../interfaces/garnish.interface';
import { FacturaService } from 'src/app/displays/prc_documento_3/services/factura.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { BodegaProductoInterface } from 'src/app/displays/prc_documento_3/interfaces/bodega-produto.interface';
import { UnitarioInterface } from 'src/app/displays/prc_documento_3/interfaces/unitario.interface';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { ProductService } from 'src/app/displays/prc_documento_3/services/product.service';
import { TranslateService } from '@ngx-translate/core';
import { LoadRestaurantService } from '../../services/load.restaurant.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  providers: [RestaurantService]
})
export class ProductsComponent implements OnInit {


  user: string = PreferencesService.user; //usuario de la sesion
  token: string = PreferencesService.token; //usuario de la sesion
  empresa: EmpresaInterface = PreferencesService.empresa; //empresa de la sesion0
  estacion: EstacionInterface = PreferencesService.estacion; //estacion de la sesion
  tipoCambio: number = PreferencesService.tipoCambio; ///tipo cambio disponioble
  tipoDocumento: number = this._facturaService.tipoDocumento!; //Tipo de documento del modulo



  products: ProductRestaurantInterface[] = [];


  constructor(
    public restaurantService: GlobalRestaurantService,
    private _restaurantService: RestaurantService,
    private _facturaService: FacturaService,
    private _notificationService: NotificationsService,
    private _translate: TranslateService,
    private _loadRestaurantService: LoadRestaurantService,

  ) {
  }
  ngOnInit(): void {
    this.loadData();

    this._loadRestaurantService.products$.subscribe(() => {
      this.loadData();
    });
  }


  async loadData() {
    this.restaurantService.isLoading = true;
    await this.loadProducts();
    this.restaurantService.isLoading = false;
  }

  async loadProducts(): Promise<boolean> {

    this.products = [];
    this.restaurantService.product = undefined;

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

      this.restaurantService.idPantalla = 1; //Clasificaciones
      return false;
    }

    if (this.products.length == 1)
      this.restaurantService.product = this.products[0];

    return true;

  }


  async selectProduct(product: ProductRestaurantInterface) {
    this.restaurantService.product = product;

   

    let resDialogProd = await this._notificationService.openProductRestaurant();

    if (!resDialogProd) {
      console.log("NO RECIBIÓ NADA");
    }

    console.log("SE AGREGA EL PRODUCTO");

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


}
