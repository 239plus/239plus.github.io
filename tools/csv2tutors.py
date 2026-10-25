#!/usr/bin/env python3
"""Ответы Google-формы «Анкета репетитора 239+» (CSV) -> записи для tutors.js.

  python3 tools/csv2tutors.py answers.csv > new_tutors.txt

Печатает объекты для массива TUTORS. На сайт попадают только публичные поля:
Telegram, возраст, желаемая цена, нагрузка и расписание НЕ публикуются.
Фото: положить в img/<латиница>.jpg и вписать в поле photo вручную.
"""
import csv, json, re, sys

DIRS = {
    "Олимпиады 5–8 класс": "olymp",
    "Олимпиады 9–11 класс": "olymp911",
    "ОГЭ": "oge",
    "ЕГЭ": "ege",
    "Школьная программа / подтянуть оценки": "school",
    "Поступление в физмат-школу": "entry",
}


def col(row, prefix):
    for k, v in row.items():
        if k and k.strip().lower().startswith(prefix.lower()):
            return (v or "").strip()
    return ""


def split_list(s):
    return [x.strip() for x in s.split(",") if x.strip()]


def tutor(row):
    grade = col(row, "Класс / статус")
    school = col(row, "Школа")
    uni = col(row, "Если учишься в вузе")
    ach = [a.strip(" •-–") for a in re.split(r"[;\n]+", col(row, "Главные дипломы")) if a.strip(" •-–")]
    dirs = [DIRS[d] for d in DIRS if d in col(row, "Направления")]
    fmt = col(row, "Формат")
    t = {
        "name": col(row, "Имя и фамилия"),
        "grade": ", ".join(x for x in (uni or grade, school) if x),
        "photo": "",
        "achievements": ach,
        "topics": split_list(col(row, "Сильные темы")),
        "directions": dirs,
        "about": col(row, "Пара фраз о себе"),
        "format": "Онлайн · очно для учеников 239" if "Очно" in fmt else "Онлайн",
    }
    return t


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    with open(sys.argv[1], encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
    for row in rows:
        t = tutor(row)
        if not t["name"]:
            continue
        assert not any(p in json.dumps(t, ensure_ascii=False).lower() for p in ("t.me/",)), "контакт попал в карточку"
        print("  " + json.dumps(t, ensure_ascii=False, indent=2).replace("\n", "\n  ") + ",")


if __name__ == "__main__":
    main()
