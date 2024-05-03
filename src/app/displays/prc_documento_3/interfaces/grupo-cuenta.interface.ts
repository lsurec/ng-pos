export interface GrupoCuentaInterface {
    grupo_Cuenta:       number;
    descripcion:        string;
    raiz:               number;
    nivel:              number;
    grupo_Cuenta_Padre: number | null;
    orden:              number;
}
