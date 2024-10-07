import { Component } from '@angular/core';
import { elementos } from '../../interfaces/send-order.interface';
import { GlobalRestaurantService } from '../../services/global-restaurant.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent {

  constructor(
    public restaurantService: GlobalRestaurantService,
  ) {
  }


  productos: elementos[] = [
    {
      url_Img: "https://cocinemosjuntos.com.co/media/mageplaza/blog/post/t/i/tips-para-preparar-pollo-al-horno-jugoso-y-perfecto_1_.jpg",
      descripcion: "Pollo asado",
      producto_Id: 1,
    },
    {
      url_Img: "https://pollocolombiano.com/wp-content/uploads/2023/09/tres-presas-de-pollo-frito-1.png",
      descripcion: "Pollo frito",
      producto_Id: 2,
    },
    {
      url_Img: "https://www.cnature.es/wp-content/uploads/2021/12/hamburguesa-con-guacamole.jpg",
      descripcion: "Hamburguesas",
      producto_Id: 3,
    },
    {
      url_Img: "https://www.cnature.es/wp-content/uploads/2021/12/hamburguesa-con-guacamole.jpg",
      descripcion: "Panqueque",
      producto_Id: 4,
    },
    {
      url_Img: "https://phantom-elmundo.unidadeditorial.es/cd362d3f024a86f1dc3c000fe620ad4f/crop/65x119/2910x2015/resize/700/f/webp/assets/multimedia/imagenes/2022/01/21/16427587773289.jpg",
      descripcion: "Huevos",
      producto_Id: 5,
    }
  ];


  selectProduct(product: elementos) {
    this.restaurantService.product = product;
    this.restaurantService.viewProducts = true;
  }

}
