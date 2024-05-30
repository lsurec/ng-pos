import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { DataUserService } from 'src/app/displays/prc_documento_3/services/data-user.service';

@Pipe({
  name: 'currencyFormat'
})
export class CurrencyFormatPipe implements PipeTransform {

  constructor(
    private _dataUserService: DataUserService,
    private _currencyPipe: CurrencyPipe,
  ) {} // Inyecta el servicio compartido de configuración de moneda

  transform(value: number | undefined | null) {
    const symbol = this._dataUserService.simboloMoneda + " ";
    const integerDigits = this._dataUserService.integerDigits;
    const decimalPlaces = this._dataUserService.decimalPlaces;
  
    const format = `${integerDigits}.${decimalPlaces}-${decimalPlaces}`;
    const formattedValue = this._currencyPipe.transform(value ?? 0, symbol, 'symbol', format);
    return formattedValue;
  }
}
