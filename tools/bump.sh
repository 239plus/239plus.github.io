#!/bin/bash
# Сбрасывает кэш браузеров: дописывает ?v=<время> к style.css / app.js / tutors.js / schedule.js во всех страницах.
cd "$(dirname "$0")/.." && v=$(date +%s)
sed -i -E "s/(href|src)=\"(style\.css|app\.js|tutors\.js|schedule\.js)(\?v=[0-9]+)?\"/\1=\"\2?v=$v\"/g" index.html komanda.html zapis.html oferta.html
