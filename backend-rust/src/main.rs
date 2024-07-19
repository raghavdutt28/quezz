mod routers;

use actix_cors::Cors;
use routers::{user_scope, worker_scope};
use std::io::Result;

use actix_web::{App, HttpServer};

#[actix_web::main]
async fn main() -> Result<()> {
    HttpServer::new(|| {
        App::new()
        .wrap(Cors::default())
        .service(user_scope::get_user_scope())
        .service(worker_scope::get_worker_scope())
    })
    .bind(("127.0.0.1", 3000))?
    .run()
    .await
}
