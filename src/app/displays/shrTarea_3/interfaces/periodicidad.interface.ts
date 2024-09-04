export interface TiemposInterface {
    tipo_Periodicidad: number;
    descripcion: string;
}

export interface TiempoEstimadoInterface {
    duracion: number;
    descripcion: TiemposInterface;
}