# Tài liệu Cấu trúc Cơ sở dữ liệu ứng dụng Học tiếng Trung (Hoàn Học Tiếng Trung)

Ứng dụng sử dụng hai cơ sở dữ liệu SQLite:

1. **`zh.db`** (Cơ sở dữ liệu Hệ thống / Từ điển & Ngữ pháp): Chứa dữ liệu tra cứu từ điển, bộ thủ chiết tự, hệ thống ngữ pháp HSK chuẩn và các câu ví dụ mẫu. Cơ sở dữ liệu này có tính chất đọc ghi tĩnh (chủ yếu là đọc dữ liệu).
2. **`app_database.db`** (Cơ sở dữ liệu Cá nhân / Người dùng): Lưu trữ dữ liệu động phát sinh trong quá trình học tập của người dùng như thẻ từ vựng (flashcards), tiến độ học tập ngữ pháp, thùng rác, và sổ tay ghi chú ngữ pháp cá nhân.

---

## 1. Dữ liệu hệ thống: `zh.db`

### Bảng: `vocabulary`

Chứa các từ vựng phục vụ tra cứu từ điển và học tập theo các cấp độ HSK. Bổ sung thêm cột type (từ loại nếu là từ), và cột note (để người dùng ghi chú, ví dụ)

- **Cấu trúc bảng**:
  | Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
  | :--- | :--- | :--- | :--- |
  | `id` | `INTEGER` | PRIMARY KEY | ID định danh từ vựng |
  | `hsk_level` | `TEXT` | | Cấp độ từ vựng HSK (1, 2, 3, 4, 5, 6, 7-9) |
  | `word` | `TEXT` | | Chữ Hán của từ vựng (Từ đơn hoặc từ ghép) |
  | `pinyin` | `TEXT` | | Phiên âm Pinyin kèm dấu thanh chuẩn mực |
  | `pos` | `TEXT` | | Từ loại (danh từ, động từ, tính từ, v.v.) |
  | `meaning_vi` | `TEXT` | | Nghĩa dịch tiếng Việt |
  | `meaning_en` | `TEXT` | | Nghĩa dịch tiếng Anh (thường đi kèm định dạng chú thích CC-CEDICT) |

---

### Bảng: `decomposition_radicals`

Chứa dữ liệu của các chữ độc thể và bộ thủ gốc trong tiếng Trung.

- **Cấu trúc bảng**:
  | Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
  | :--- | :--- | :--- | :--- |
  | `character` | `TEXT` | PRIMARY KEY | Ký tự chữ Hán (bộ thủ hoặc chữ độc thể) |
  | `radical_number` | `INTEGER` | | Số hiệu bộ thủ theo chuẩn Khang Hy |
  | `parent_radical` | `TEXT` | | Bộ thủ gốc của ký tự này (nếu là biến thể) |
  | `variants` | `TEXT` | | Các biến thể chữ viết liên quan |
  | `simplified` | `TEXT` | | Ký tự dạng Giản thể |
  | `pinyin` | `TEXT` | | Phiên âm Pinyin chuẩn thanh điệu |
  | `meaning_vi` | `TEXT` | | Nghĩa tiếng Việt của bộ thủ (Định dạng: `Bộ [Tên]: [Giải nghĩa]`) |
  | `meaning_en` | `TEXT` | | Nghĩa tiếng Anh của bộ thủ |
  | `strokecount` | `INTEGER` | | Số nét viết của bộ thủ/chữ độc thể |
  | `type` | `TEXT` | | Phân loại ký tự (ví dụ: `radical` cho bộ thủ gốc, `basic` cho chữ độc thể) |

---

### Bảng: `decomposition_details`

Chứa dữ liệu chi tiết cấu trúc phân tích chiết tự và tự nguyên (nguồn gốc cấu tạo) cho các chữ hợp thể.

- **Cấu trúc bảng**:
  | Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
  | :--- | :--- | :--- | :--- |
  | `character` | `TEXT` | PRIMARY KEY | Chữ Hán hợp thể cần chiết tự |
  | `pinyin` | `TEXT` | | Phiên âm Pinyin chuẩn dấu thanh |
  | `definition_en` | `TEXT` | | Định nghĩa/Nghĩa tiếng Anh |
  | `radical` | `TEXT` | | Bộ thủ chính chứa chữ này |
  | `decomposition` | `TEXT` | | Cấu trúc phân tích chiết tự theo chuẩn IDS (Ideographic Description Sequence) |
  | `etymology_type` | `TEXT` | | Phân loại tự nguyên (`pictographic`, `ideographic`, `pictophonetic`, v.v.) |
  | `etymology_hint` | `TEXT` | | Câu chuyện giải nghĩa nguồn gốc chữ viết bằng tiếng Anh |
  | `etymology_semantic` | `TEXT` | | Thành phần biểu ý của chữ (bộ nghĩa) |
  | `etymology_phonetic` | `TEXT` | | Thành phần biểu âm của chữ (bộ âm) |
  | `hsk_level` | `INTEGER` | | Cấp độ HSK của chữ Hán |
  | `definition_vi` | `TEXT` | | Định nghĩa/Nghĩa tiếng Việt |
  | `etymology_hint_vi` | `TEXT` | | Câu chuyện giải nghĩa nguồn gốc chữ viết bằng tiếng Việt |

---

### Bảng: `grammar_categories`

Phân loại các danh mục ngữ pháp HSK theo cấu trúc phân cấp (cây danh mục).

- **Cấu trúc bảng**:
  | Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
  | :--- | :--- | :--- | :--- |
  | `id` | `INTEGER` | PRIMARY KEY | ID định danh danh mục ngữ pháp |
  | `level` | `INTEGER` | | Cấp độ ngữ pháp HSK |
  | `parent_id` | `INTEGER` | | ID danh mục cha (để phân cấp, NULL nếu là cấp cao nhất) |
  | `code` | `TEXT` | | Mã danh mục ngữ pháp |
  | `title_zh` | `TEXT` | | Tiêu đề danh mục bằng chữ Hán |
  | `title_vi` | `TEXT` | | Tiêu đề danh mục bằng tiếng Việt |
  | `title_en` | `TEXT` | | Tiêu đề danh mục bằng tiếng Anh |
  | `sort_order` | `INTEGER` | | Thứ tự sắp xếp hiển thị |

---

### Bảng: `grammar_points`

Lưu trữ chi tiết các điểm ngữ pháp HSK.

- **Cấu trúc bảng**:
  | Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
  | :--- | :--- | :--- | :--- |
  | `id` | `INTEGER` | PRIMARY KEY | ID định danh điểm ngữ pháp |
  | `category_id` | `INTEGER` | | ID danh mục ngữ pháp cha (liên kết với `grammar_categories.id`) |
  | `level` | `INTEGER` | | Cấp độ ngữ pháp HSK |
  | `code` | `TEXT` | | Mã định danh điểm ngữ pháp (ví dụ: `H1.1`) |
  | `title_zh` | `TEXT` | | Tiêu đề điểm ngữ pháp bằng tiếng Trung |
  | `title_vi` | `TEXT` | | Tiêu đề điểm ngữ pháp bằng tiếng Việt |
  | `title_en` | `TEXT` | | Tiêu đề điểm ngữ pháp bằng tiếng Anh |
  | `explanation_zh` | `TEXT` | | Giải thích chi tiết bằng tiếng Trung |
  | `explanation_vi` | `TEXT` | | Giải thích chi tiết bằng tiếng Việt |
  | `explanation_en` | `TEXT` | | Giải thích chi tiết bằng tiếng Anh |
  | `sort_order` | `INTEGER` | | Thứ tự sắp xếp hiển thị |

---

### Bảng: `grammar_examples`

Chứa các câu ví dụ thực tế tương ứng với từng điểm ngữ pháp để người dùng dễ tiếp thu.

- **Cấu trúc bảng**:
  | Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
  | :--- | :--- | :--- | :--- |
  | `id` | `INTEGER` | PRIMARY KEY | ID định danh câu ví dụ |
  | `grammar_point_id` | `INTEGER` | | ID điểm ngữ pháp sở hữu (liên kết với `grammar_points.id`) |
  | `subgroup_zh` | `TEXT` | | Nhóm phụ tiếng Trung (phân loại nhánh ví dụ) |
  | `subgroup_vi` | `TEXT` | | Nhóm phụ tiếng Việt |
  | `subgroup_en` | `TEXT` | | Nhóm phụ tiếng Anh |
  | `sentence_zh` | `TEXT` | | Câu ví dụ bằng chữ Hán |
  | `sentence_pinyin` | `TEXT` | | Phiên âm Pinyin kèm dấu thanh chuẩn cho câu ví dụ |
  | `sentence_vi` | `TEXT` | | Câu dịch tiếng Việt |
  | `sentence_en` | `TEXT` | | Câu dịch tiếng Anh |
  | `sort_order` | `INTEGER` | | Thứ tự sắp xếp hiển thị |

---

## 2. Dữ liệu người dùng: `app_database.db`

### Bảng: `flashcards`

Lưu trữ danh sách thẻ từ vựng (flashcards) mà người dùng tự thêm hoặc lưu lại để ôn tập.

- **Cấu trúc bảng**:
  | Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
  | :--- | :--- | :--- | :--- |
  | `id` | `INTEGER` | PRIMARY KEY AUTOINCREMENT | ID tự tăng của thẻ từ vựng |
  | `hanzi` | `VARCHAR(100)` | | Chữ Hán của từ vựng |
  | `pinyin` | `VARCHAR(200)` | | Phiên âm Pinyin |
  | `meaning` | `VARCHAR(500)` | | Nghĩa của từ vựng (tiếng Việt/tiếng Anh) do người dùng ghi chú |
  | `date_added` | `DATETIME` | | Ngày giờ tạo thẻ từ vựng |
  | `level` | `INTEGER` | | Cấp độ ôn tập SRS hiện tại (hộp 0 đến hộp 5) |
  | `next_review` | `DATETIME` | | Ngày giờ tới hạn ôn tập tiếp theo |
  | `deleted_at` | `DATETIME` | | Ngày giờ đánh dấu xóa tạm thời (NULL nếu chưa xóa) |
  | `auto_delete_at` | `DATETIME` | | Ngày giờ tự động xóa vĩnh viễn khỏi thùng rác |

---

### Bảng: `grammar_notes`

Sổ tay lưu trữ các ghi chú ngữ pháp cá nhân do người dùng tạo lập.

- **Cấu trúc bảng**:
  | Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
  | :--- | :--- | :--- | :--- |
  | `id` | `INTEGER` | PRIMARY KEY AUTOINCREMENT | ID tự tăng của ghi chú |
  | `note_type` | `VARCHAR(50)` | | Loại ghi chú ngữ pháp |
  | `title` | `VARCHAR(200)` | | Tiêu đề ghi chú ngữ pháp |
  | `level` | `INTEGER` | | Hạng HSK áp dụng cho ghi chú này |
  | `formula` | `VARCHAR(500)` | | Công thức cấu trúc ngữ pháp |
  | `explanation` | `TEXT` | | Phần giải thích chi tiết cách dùng |
  | `examples` | `TEXT` | | Các câu ví dụ do người dùng tự thêm |

---

### Bảng: `trash`

Lưu trữ tạm thời các flashcards bị xóa để hỗ trợ chức năng khôi phục hoặc tự động dọn dẹp sau một khoảng thời gian.

- **Cấu trúc bảng**:
  | Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
  | :--- | :--- | :--- | :--- |
  | `id` | `INTEGER` | PRIMARY KEY AUTOINCREMENT | ID tự tăng của bản ghi thùng rác |
  | `flashcard_id` | `INTEGER` | | ID gốc của thẻ từ vựng trước khi xóa |
  | `hanzi` | `VARCHAR(100)` | | Chữ Hán của thẻ |
  | `pinyin` | `VARCHAR(200)` | | Phiên âm Pinyin |
  | `meaning` | `VARCHAR(500)` | | Nghĩa ghi chú của thẻ |
  | `level` | `INTEGER` | | Cấp độ SRS của thẻ trước khi xóa (mặc định là 0) |
  | `deleted_at` | `DATETIME` | | Ngày giờ thực hiện xóa (Mặc định: CURRENT_TIMESTAMP) |
  | `auto_delete_at` | `DATETIME` | | Ngày giờ tự động xóa hoàn toàn khỏi cơ sở dữ liệu |

---

### Bảng: `learned_grammar_points`

Ghi nhận tiến độ học tập bằng cách đánh dấu các điểm ngữ pháp HSK đã được người dùng học.

- **Cấu trúc bảng**:
  | Tên cột | Kiểu dữ liệu | Khóa | Mô tả |
  | :--- | :--- | :--- | :--- |
  | `grammar_point_id` | `INTEGER` | PRIMARY KEY | ID điểm ngữ pháp đã học (liên kết với `grammar_points.id` trong `zh.db`) |
  | `learned_at` | `DATETIME` | | Ngày giờ đánh dấu đã học (Mặc định: CURRENT_TIMESTAMP) |
