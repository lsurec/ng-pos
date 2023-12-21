import { LanguageInterface, MensajesInterface } from "../interfaces/language.interface";

export class MensajesService {

    static findValueLrCode(values: MensajesInterface[], activeLang: LanguageInterface) {
        let lrCode = `${activeLang.lang}-${activeLang.reg}`;

        const value = values.find((item) => item.lrCode === lrCode);
        return value ? value.value : '';
    }

}