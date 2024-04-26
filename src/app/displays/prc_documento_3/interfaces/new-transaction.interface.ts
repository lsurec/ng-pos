export interface NewTransactionInterface {
    empresa:                       number;
    localizacion:                  number;
    estacionTrabajo:               number;
    tipoTransaccion:               number;
    usuario:                       string;
    bodega:                        number;
    producto:                      number;
    unidadMedida:                  number;
    cantidad:                      number;
    monto:                         number;
    tipoCambio:                    number;
    moneda:                        number;
    montoMoneda:                   number;
    tipoPrecio:                    number;
    documentoConsecutivoInterno:   number;
    transaccionConsecutivoInterno: number;
}
