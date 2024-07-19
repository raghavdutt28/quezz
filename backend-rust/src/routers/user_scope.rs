use actix_web::HttpResponse;

use actix_web::{web, HttpMessage, HttpRequest, Scope};

pub fn get_user_scope() -> Scope {
    web::scope("/v1/user")
        .route("/signin", web::post().to(sign_in))
        .route("/preSignedUrl", web::get().to(pre_signed_url))
        .route("/task", web::post().to(post_task))
        .route("/task", web::get().to(task))
}
async fn post_task() -> HttpResponse {
    HttpResponse::Ok().body("Task List")
}
async fn task(req: HttpRequest) -> HttpResponse {
    if let Some(user_id)= req.extensions().get::<String>() {
        println!("inside");
        return HttpResponse::Ok().body(format!("user Id: {}", user_id))
    }
    HttpResponse::Ok().body("Not Authorized")
}
async fn sign_in() -> HttpResponse {
    HttpResponse::Ok().body("Task List")
}
async fn pre_signed_url() -> HttpResponse {
    HttpResponse::Ok().body("Task List")
}
