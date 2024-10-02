import { Component } from '@angular/core';
import { components } from 'src/app/providers/componentes.provider';
import { EventService } from 'src/app/services/event.service';
import { GlobalRestaurantService } from '../../services/global-restaurant.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { LocationInterface } from '../../interfaces/location.interface';
import { TableInterface } from '../../interfaces/table.interface';

@Component({
  selector: 'app-location-table',
  templateUrl: './location-table.component.html',
  styleUrls: ['./location-table.component.scss']
})
export class LocationTableComponent {

  constructor(
    private _eventService: EventService,
    public restaurantService: GlobalRestaurantService,
    private notificationService: NotificationsService,
    private _translate: TranslateService,
  ) {

  }

  goBack() {
    components.forEach(element => {
      element.visible = false;
    });

    this._eventService.emitCustomEvent(false);
  }

  selectLocation(location: LocationInterface) {
    this.restaurantService.location = location;
    this.restaurantService.viewTables = true;
  }

  selectTable(table: TableInterface) {
    this.restaurantService.table = table;

    this.notificationService.pinMesero();

  }

  viewRestaurant() {

    if (!this.restaurantService.location ) {
      //TODO: traducir
      this.notificationService.openSnackbar(this._translate.instant('Seleccione una ubicacion'));
      return;
    }

    if (!this.restaurantService.table) {
      //TODO: traducir
      this.notificationService.openSnackbar(this._translate.instant('Seleccione una mesa'));
      return;
    }

    this.restaurantService.viewRestaurant = true;
    this.restaurantService.viewLocations = false;
  }
}
