import { Component } from '@angular/core';
import { elementos } from '../../interfaces/send-order.interface';

@Component({
  selector: 'app-product-classifications',
  templateUrl: './product-classifications.component.html',
  styleUrls: ['./product-classifications.component.scss']
})
export class ProductClassificationsComponent {

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
    }
  ];

}
