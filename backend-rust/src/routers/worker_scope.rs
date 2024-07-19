use std::sync::Mutex;

use actix_web::{web, HttpResponse, Scope};


struct AppStateWithCounter {
    counter: Mutex<i32>,
}

pub fn get_worker_scope() -> Scope {
    let counter = web::Data::new(AppStateWithCounter {counter: Mutex::new(0)});
    web::scope("/v1/worker").app_data(counter.clone())
    .route("/signin", web::post().to(sign_in))
    .route("/nextTask", web::get().to(next_task))
    .route("/submission", web::post().to(submission))
    .route("/payout", web::post().to(payout))
    
}
async fn sign_in(data: web::Data<AppStateWithCounter>) -> HttpResponse{
    let mut counter = data.counter.lock().unwrap();
    *counter += 1;
    HttpResponse::Ok().body(format!("Sign in to {counter}!"))
}
async fn next_task() -> HttpResponse{
    HttpResponse::Ok().body("Task List")
}
async fn submission() -> HttpResponse{
    HttpResponse::Ok().body("Task List")
}
async fn payout() -> HttpResponse{
    HttpResponse::Ok().body("Task List")
}