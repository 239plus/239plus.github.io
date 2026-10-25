#!/usr/bin/env python3
"""Ответы Google-формы «Анкета репетитора 239+» (CSV) -> записи для tutors.js.

  python3 tools/csv2tutors.py answers.csv [slots.json] > new_tutors.txt

Если указан slots.json — туда пишутся окна «Когда свободен» (сетка Пн–Вс × часы) для бота записи.

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
    "Поступление": "entry",  # «Поступление в физмат-школу» / «…в школы городского набора»
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
    t = {
        "name": col(row, "Имя и фамилия"),
        "grade": ", ".join(x for x in (uni or grade, school) if x),
        "photo": "",
        "achievements": ach,
        "topics": split_list(col(row, "Сильные темы")),
        "directions": dirs,
        "about": col(row, "Пара фраз о себе"),
        "format": "Онлайн",
    }
    return t


def slots(row):
    """Сетка флажков: колонки «Когда свободен [Пн]» со значениями «16–19;19–22»."""
    out = []
    for k, v in row.items():
        m = re.match(r"\s*Когда свободен\s*\[(.+?)\]", k or "")
        if m:
            out += [f"{m.group(1).strip()} {x.strip()}" for x in re.split(r"[;,]", v or "") if x.strip()]
    return out


def main():
    if len(sys.argv) not in (2, 3):
        sys.exit(__doc__)
    with open(sys.argv[1], encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
    for row in rows:
        t = tutor(row)
        if not t["name"]:
            continue
        assert not any(p in json.dumps(t, ensure_ascii=False).lower() for p in ("t.me/",)), "контакт попал в карточку"
        print("  " + json.dumps(t, ensure_ascii=False, indent=2).replace("\n", "\n  ") + ",")
    if len(sys.argv) == 3:
        data = [{"name": col(r, "Имя и фамилия"), "directions": tutor(r)["directions"], "slots": slots(r)}
                for r in rows if col(r, "Имя и фамилия")]
        json.dump({"tutors": data}, open(sys.argv[2], "w"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
