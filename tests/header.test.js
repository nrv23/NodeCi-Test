// const puppeteer = require("puppeteer"); // funciona para crear una intancia de navegador virtual
const CustomePage = require("./helpers/page");

let page;

beforeEach(async () => { // antes de cada prueba abrir una instancia de cromium

    /*browser = await puppeteer.launch({ headless: false }); // levantar una instancia virtual del navegador
    // headless: false indica que el navegador se va abrir sin interfaz
    page = await browser.newPage(); // generar una nueva pagina de la instancia virtual del navegador */
    page = await CustomePage.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => { // despues de cada prueba, cerrar el navegador 
    //await browser.close();
    await page.close();
})

test('The header has the correct text ', async () => {

    // todas las operaciones que se hagan con puppeteer devuelven promesas
    const text = await page.getContentsOf('a.brand-logo'); // usa selectores de css o queryselector de javascritp
    expect(text).toEqual('Blogster');
});


test('clicking login starts oauth flow ', async () => {
    await page.click('.right a');
    // saber si se abrió la pagina de login con google
    const url = await page.url(); // obtener la url actual de la pagina
    expect(url).toMatch(/accounts\.google\.com/); // usa una expresion regular para saber si la url actual contiene el dominio
    // de login con oauth de google 
});

//test.only indica que solo ese test se va ejecutar y los demas seran ignorados
test('When sign in, shows logout button', async () => {

    //const id = "63afb468e4ea9ba770dc4802";  // ID de mongodb

    await page.login();
    // actualizar la pagina para que las cookies se vean reflejadas
    // esperar a que renderice del todo la pagina
    const text = await page.getContentsOf('a[href="/auth/logout"]');
    expect(text).toEqual("Logout");
});
