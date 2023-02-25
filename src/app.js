const { log } = require("console");
const fs = require("fs/promises");
const path = require("path");


const productoManager = require("./productManager");
const carritoCompleto = require("./cart");
// ----
const archivo = __dirname;
instancia = new productoManager.ProductManager(archivo + "/db.json");
instanciaCarrito = new carritoCompleto.CarritoCompleto(archivo + "/dbCart.json");

const express = require("express");
const handlebars = require("express-handlebars");
const { Server } = require("socket.io");

const productRouter = require("../routes/productsRoutes");
const cartRouter = require("../routes/cartRoutes");

const { request } = require("https");
const { send } = require("process");
const PORT = 8080;


const app = express()
const prefix = "api";



// const index = archivo.indexOf("src")
// const archivoII = archivo.slice(0,index);


// SERVIDOR
app.use(express.urlencoded({extended : true}))
app.use(express.json());

// app.use("/static",express.static(`${archivoII}public`));
app.use(express.static("public"))
app.use(`/${prefix}/products`, productRouter);
app.use(`${prefix}/cart`, cartRouter)

//SOCKET.IO
const server = app.listen(PORT, () => {
    console.log(`Corriendo por el puerto ${PORT}`);
})
const io = new Server(server)
let bbdd;
const longBBDD = async () => {
    let info = await instancia.getProducts();
    const long = info.legth;
    // console.log(info);
    if(bbdd != long){
        bbdd = long
        return info  
    }
    return 0;
}
io.on("connection", async (socket) => {
    console.log("New client is connect");
    socket.on("add-product",(data) => {
        console.log(data);
        const info = longBBDD();
        if(info == 0){
            console.log("no hubo cambio");
            io.emit("mandamosInfo", 0)
        }
        io.emit("mandamosInfo", data)


    })



})

//CONFIGURACION DE HANDLEBARS
app.engine("handlebars", handlebars.engine());
app.set("views", path.join(`${__dirname}/views`));
app.set("view engine", "handlebars");

// app.listen(PORT, () => {
//     // console.log("El arhcivo es", archivoII); b 
//     console.log("API RUNNING ON PORT " + PORT);
// })

app.get("/", async (request, response) => {
    let productos = await instancia.getProducts()
    return response.render("home", {productos})
})

