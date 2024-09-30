import { Component, OnInit } from '@angular/core';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ApiService } from 'src/app/services/api.service';
import { RestaurantService } from '../../services/restaurant.service';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-home-restaurant',
  templateUrl: './home-restaurant.component.html',
  styleUrls: ['./home-restaurant.component.scss'],
  providers: [RestaurantService]
})
export class HomeRestaurantComponent implements OnInit {


  user: string = PreferencesService.user; //usuario de la sesion
  token: string = PreferencesService.token; //usuario de la sesion
  empresa: EmpresaInterface = PreferencesService.empresa; //empresa de la sesion0
  estacion: EstacionInterface = PreferencesService.estacion; //estacion de la sesion
  tipoCambio: number = PreferencesService.tipoCambio; ///tipo cambio disponioble

  /**
   *
   */
  constructor(private _restaurantService: RestaurantService) {

  }

  ngOnInit(): void {
    this.laodData();
  }


  async getApi(){
    const res = await firstValueFrom(this._restaurantService.getEmpresas(
      14,
      1,
      7,
      "1",
      "admin",
      this.token,
    ));

    console.log(res);
    

  }


  async laodData() {





    let apiLocations = () => this._restaurantService.getEmpresas(
      14,
      1,
      7,
      "1",
      "admin",
      this.token,
    );

    let res: ResApiInterface = await ApiService.apiUse(apiLocations);

    console.log(res);

  }



}
