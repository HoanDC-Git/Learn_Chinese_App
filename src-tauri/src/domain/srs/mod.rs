use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};

const MAX_LEVEL: i32 = 8;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SrsResult {
    pub new_level: i32,
    pub next_review: DateTime<Utc>,
    pub days_interval: i64,
}

pub fn calculate_next_review(current_level: i32, remembered: bool) -> SrsResult {
    let new_level = if remembered {
        (current_level + 1).min(MAX_LEVEL)
    } else {
        (current_level - 1).max(0)
    };

    let days_interval = match new_level {
        0 => 0,
        1 | 2 => 1,
        3 => 3,
        4 => 7,
        5 => 14,
        6 => 30,
        7 => 60,
        _ => 120,
    };

    let next_review = if new_level == 0 {
        Utc::now()
    } else {
        chrono::Local::now()
            .date_naive()
            .and_hms_opt(0, 0, 0)
            .unwrap()
            .and_local_timezone(chrono::Local)
            .unwrap()
            .with_timezone(&Utc)
            + Duration::days(days_interval)
    };

    SrsResult {
        new_level,
        next_review,
        days_interval,
    }
}

#[allow(dead_code)]
pub fn is_due(next_review: &DateTime<Utc>) -> bool {
    *next_review <= Utc::now()
}

#[allow(dead_code)]
pub fn get_mastery_status(level: i32) -> &'static str {
    match level {
        0 => "new",
        1..=2 => "learning",
        3..=4 => "familiar",
        5..=6 => "proficient",
        _ => "mastered",
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_srs_remembered_progression() {
        let r0 = calculate_next_review(0, true);
        assert_eq!(r0.new_level, 1);
        assert_eq!(r0.days_interval, 1);

        let r1 = calculate_next_review(1, true);
        assert_eq!(r1.new_level, 2);
        assert_eq!(r1.days_interval, 1);

        let r2 = calculate_next_review(2, true);
        assert_eq!(r2.new_level, 3);
        assert_eq!(r2.days_interval, 3);

        let r3 = calculate_next_review(3, true);
        assert_eq!(r3.new_level, 4);
        assert_eq!(r3.days_interval, 7);

        let r5 = calculate_next_review(5, true);
        assert_eq!(r5.new_level, 6);
        assert_eq!(r5.days_interval, 30);

        let r7 = calculate_next_review(7, true);
        assert_eq!(r7.new_level, 8);
        assert_eq!(r7.days_interval, 120);

        let r8 = calculate_next_review(8, true);
        assert_eq!(r8.new_level, 8);
        assert_eq!(r8.days_interval, 120);
    }

    #[test]
    fn test_srs_forgotten_progression() {
        // level 5 forgotten -> new level 4, interval 7 days
        let r5 = calculate_next_review(5, false);
        assert_eq!(r5.new_level, 4);
        assert_eq!(r5.days_interval, 7);

        // level 1 forgotten -> new level 0, interval 0 days
        let r1 = calculate_next_review(1, false);
        assert_eq!(r1.new_level, 0);
        assert_eq!(r1.days_interval, 0);

        // level 0 forgotten -> new level 0, interval 0 days
        let r0 = calculate_next_review(0, false);
        assert_eq!(r0.new_level, 0);
        assert_eq!(r0.days_interval, 0);
    }
}
