import { AplicacionesInterface } from "./aplicaciones.interface";
import { DisplayInterface } from "./displays.interface";

export interface MenuInterface {
    name: string;
    id: number;
    route: string;
    idFather: any;
    idChild: any;
    children: MenuInterface[];
    display? :DisplayInterface;
    // colores 
    colorBackground?: string;    //Color de fonde de la app.
    colorFontNotSelect?: string; //Color de fuente no seleccionada.
    colorFontSelect?: string;   //Color de fuente seleccionada
    colorSelected?: string;      //Color de objeto seleccionado
    colorMargenSelect?: string;  //Color de barra laterel al seleccionar onjeto.
}

export interface MenuDataInterface {
    application: AplicacionesInterface;
    children: DisplayInterface[];
}