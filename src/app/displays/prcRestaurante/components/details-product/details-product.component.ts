import { Component } from '@angular/core';
import { NotificationsService } from 'src/app/services/notifications.service';
import { GlobalRestaurantService } from '../../services/global-restaurant.service';
import { SerieInterface } from 'src/app/displays/prc_documento_3/interfaces/serie.interface';

@Component({
  selector: 'app-details-product',
  templateUrl: './details-product.component.html',
  styleUrls: ['./details-product.component.scss']
})
export class DetailsProductComponent {

  series: SerieInterface[] = [];

  constructor(
    private notificationService: NotificationsService,
    public restaurantService: GlobalRestaurantService,
  ) {

  }

  changeSerie() { }

}
