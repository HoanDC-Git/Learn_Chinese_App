use chrono::{Local, Utc};
fn main() {
    let midnight_local = Local::now()
        .date_naive()
        .and_hms_opt(0, 0, 0)
        .unwrap()
        .and_local_timezone(Local)
        .unwrap()
        .with_timezone(&Utc);
    println!("{}", midnight_local);
}
