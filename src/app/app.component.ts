import { Component } from '@angular/core';
import { HelloService } from './services/hello.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers:[HelloService]
})
export class AppComponent {
  title = 'ng-pos';

  constructor(private _helloService:HelloService){
    _helloService.getHello("https://localhost:7077/api/Hello");
  }
}
