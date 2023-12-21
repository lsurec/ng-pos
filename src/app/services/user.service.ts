export class UserService {

    static getToken(): string {
        let token;
        token = localStorage.getItem("token");
        if (token) return token;
        token = sessionStorage.getItem("token");
        return token!;

    }

    static getUser(): string {
        let user;
        user = localStorage.getItem("user");
        if (user) return user;
        user = sessionStorage.getItem("user");
        return user ?? "";
    }

}