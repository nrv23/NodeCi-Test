const puppeteer = require("puppeteer");
const newSession = require("../factories/sessionFactory");
const newUser = require("../factories/userFactory");
class CustomePage {


    constructor(page) {
        this.page = page;
    }

    static async build() {
        const browser = await puppeteer.launch({
            headless: true, //ejecutar la instancia del navegador in interfaz grafica
            args: ['--no-sandbox']
        }); // iniciar instancia de navegador

        const page = await browser.newPage();
        const customePage = new CustomePage(page);

        // usar proxys para combinar el accesos a diferentes clases u objetos

        return new Proxy(customePage, {
            get: function (target, property) { // la propiedad target de la funcion get, es el parametro customePage, que va evaluar al leer una 
                //propiedad de la clase 

                return customePage[property] || browser[property] || page[property]; // va leer la propiedad de cada instancia y donde devuelve un 
                // valor verdadero, devuelve el resultado

            }
        })
    }

    async login() {
        const user = await newUser(); // devuelve una promesa

        console.log({ user });

        const { session, sessionSigned } = newSession(user)

        // agregar cookies a la pagina
        await this.page.setCookie({
            name: 'session',
            value: session
        });

        await this.page.setCookie({
            name: 'session.sig',
            value: sessionSigned
        });

        await this.page.goto('http://localhost:3000/blogs');
        await this.page.waitFor('a[href="/auth/logout"]'); // el test que corre trata de ejecutar la prueba antes de que la 
        // pagina cargue del todo, por lo que el waitfor se asegura de que la pagina cargue completamente para luego acceder al
        // elemento html
    }

    async getContentsOf(selector) {
        return this.page.$eval(selector, el => el.innerHTML);
    }

    get(path) {
        return this.page.evaluate( // sino se pasa el path como segundo argumento no va leer la variable.
            // page.evaluate se ejecuta como una funcion anonima que se llama así misma, por lo que no se pueden 
            // pasar variables de un scope global.
            async (_path) => { // aqui se obtiene el segundo argumento de la funcion page.evaluate
                const response = await fetch(_path, {
                    method: "GET",
                    credentials: "same-origin", // toma las cookies que existen en el nevagador
                    headers: {
                        'Content-Type': "application/json"
                    }
                })
                return await response.json();
            },
            path
        );
    }

    post(path, body) {

        return this.page.evaluate( // sino se pasa el path como segundo argumento no va leer la variable.
            // page.evaluate se ejecuta como una funcion anonima que se llama así misma, por lo que no se pueden 
            // pasar variables de un scope global.
            async ({ path: _path, body: _body }) => { // aqui se obtiene el segundo argumento de la funcion page.evaluate
                const response = await fetch(_path, {
                    method: "POST",
                    credentials: "same-origin", // toma las cookies que existen en el nevagador
                    headers: {
                        'Content-Type': "application/json"
                    },
                    body: JSON.stringify(_body)
                });
                return response.json();
            },
            { path, body }
        );
    }

    execRequests (actions) {
        //return actions.map(action => action.method === "GET" ?this.get(action.path):this.post(action.path, action.body));
        // this es la referencia de la clase y method llama la funcion que podría ser get o post, luego envia los parametrps.
        // En el caso de get, nop recibe como parametro body, entonces al enviar ese parametro, la funcion get lo omite
        return Promise.all(actions.map(({method, path, body}) => this[method](path,body)));
    }
}

module.exports = CustomePage;