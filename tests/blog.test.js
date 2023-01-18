const Page = require("./helpers/page");
let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto("http://localhost:3000")
});

afterEach(async () => {

    await page.close();
});



describe("while logged in", async () => {
    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating');
    });

    test('can see blog create form ', async () => {
        const text = await page.getContentsOf('form label');
        expect(text).toEqual("Blog Title");

    });

    describe('When logged in and using invalid inputs', async () => {
        beforeEach(async () => { // aqui va enviar una prueba de registro d blogs con informacion vacía porque lo 
            // que va devolver mensajes de errror

            await page.click('button[type="submit"]');

        })
        test("The form shows an error message", async () => {

            const titulo = await page.getContentsOf('.title .red-text');
            const contenido = await page.getContentsOf('.content .red-text');
            const errMessage = "You must provide a value";
            expect(titulo).toEqual(errMessage);
            expect(contenido).toEqual(errMessage);
        })
    });


    describe('When logged in and using valid inputs', async () => {

        beforeEach(async () => {
            // escribir datos en los inputs

            await page.type('.title input', 'My Title');
            await page.type('.content input', 'My Content');

            await page.click('button[type="submit"]');
        })

        test("Submitting takes user to review screen", async () => {

            const text = await page.getContentsOf("form h5");

            expect(text).toEqual("Please confirm your entries");

        })

        test("Submitting then saving add blog to index page", async () => {

            // click para guardar el blog 


            await page.click("div .green");
            await page.waitFor('.card');

            const title = await page.getContentsOf(".card-title");
            const p = await page.getContentsOf("p");


            expect(title).toEqual('My Title');
            expect(p).toEqual('My Content');

        })
    });
})

describe("User is not logged in", async () => {

    const actions = [
        {
            method: "get",
            path: "/api/blogs"
        },
        {
            method: "post",
            path: "/api/blogs",
            body: { title: "My Title", content: "My Content" }
        }
    ];

    test('Blog related actions are prohibited', async () => {

        const result = await page.execRequests(actions);

        for (const res of result) {
            expect(typeof res.error).toEqual("string"); // toEqual tambien puede comparar resultados esperados como objetos
            expect(res.error).toEqual("You must log in!");
        }

        /*

            for (const action of action) {

            test("User can not create blog post", async () => {
                const result = await page.post('/api/blogs', { title: "My Title", content: "My Content" });
                expect(typeof result.error).toEqual("string"); // toEqual tambien puede comparar resultados esperados como objetos
                expect(result.error).toEqual("You must log in!");
            });

            test("User can not get blog list", async () => {
                const result = await page.get('/api/blogs');
                expect(typeof result.error).toEqual("string"); // toEqual tambien puede comparar resultados esperados como objetos
                expect(result.error).toEqual("You must log in!");
            });
        }
        */
    })
})