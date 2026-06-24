import { useEffect, useMemo, useState } from "react";

const standings = [
  { place: 1, team: "Редько / Kh", short: "RK", rating: 6.6, record: "6 - 0 - 1", points: "34 - 14", delta: 20 },
  { place: 2, team: "Аршакян / Ткачев", short: "AT", rating: 4.5, record: "6 - 0 - 1", points: "33 - 16", delta: 17 },
  { place: 3, team: "Shapovalova / Sh", short: "SS", rating: 5.8, record: "4 - 0 - 3", points: "24 - 22", delta: 2 },
  { place: 4, team: "Гудини / Shvedov", short: "GS", rating: 5.2, record: "4 - 0 - 3", points: "23 - 21", delta: 2 },
  { place: 5, team: "Пронович / Gleb", short: "PG", rating: 4.9, record: "3 - 0 - 4", points: "24 - 22", delta: 2 },
  { place: 6, team: "Soloveva / Каменный", short: "SK", rating: 5.4, record: "2 - 0 - 5", points: "15 - 25", delta: -10 },
  { place: 7, team: "Шевченко / Борис", short: "SB", rating: 5.7, record: "2 - 0 - 5", points: "16 - 28", delta: -12 },
  { place: 8, team: "Мхитарян / Muradyan", short: "MA", rating: 5.0, record: "1 - 0 - 6", points: "12 - 33", delta: -21 },
];

const matches = [
  { round: 1, court: 1, a: "Редько / Kh", b: "Пронович / Gleb", scoreA: 5, scoreB: 3 },
  { round: 1, court: 2, a: "Шевченко / Борис", b: "Soloveva / Каменный", scoreA: 3, scoreB: 4 },
  { round: 1, court: 3, a: "Shapovalova / Sh", b: "Аршакян / Ткачев", scoreA: 2, scoreB: 6 },
  { round: 1, court: 4, a: "Мхитарян / Muradyan", b: "Гудини / Shvedov", scoreA: 2, scoreB: 5 },
  { round: 2, court: 1, a: "Shapovalova / Sh", b: "Редько / Kh", scoreA: 2, scoreB: 6 },
  { round: 2, court: 2, a: "Soloveva / Каменный", b: "Мхитарян / Muradyan", scoreA: 4, scoreB: 1 },
  { round: 2, court: 3, a: "Гудини / Shvedov", b: "Аршакян / Ткачев", scoreA: 2, scoreB: 5 },
  { round: 2, court: 4, a: "Шевченко / Борис", b: "Пронович / Gleb", scoreA: 4, scoreB: 2 },
  { round: 3, court: 1, a: "Мхитарян / Muradyan", b: "Аршакян / Ткачев", scoreA: 2, scoreB: 6 },
  { round: 3, court: 2, a: "Шевченко / Борис", b: "Shapovalova / Sh", scoreA: 4, scoreB: 3 },
  { round: 3, court: 3, a: "Гудини / Shvedov", b: "Редько / Kh", scoreA: 4, scoreB: 3 },
  { round: 3, court: 4, a: "Soloveva / Каменный", b: "Пронович / Gleb", scoreA: 1, scoreB: 5 },
  { round: 4, court: 1, a: "Гудини / Shvedov", b: "Шевченко / Борис", scoreA: 3, scoreB: 2 },
  { round: 4, court: 2, a: "Аршакян / Ткачев", b: "Редько / Kh", scoreA: 3, scoreB: 4 },
  { round: 4, court: 3, a: "Пронович / Gleb", b: "Мхитарян / Muradyan", scoreA: 5, scoreB: 1 },
  { round: 4, court: 4, a: "Soloveva / Каменный", b: "Shapovalova / Sh", scoreA: 1, scoreB: 4 },
  { round: 5, court: 1, a: "Пронович / Gleb", b: "Shapovalova / Sh", scoreA: 2, scoreB: 4 },
  { round: 5, court: 2, a: "Soloveva / Каменный", b: "Гудини / Shvedov", scoreA: 2, scoreB: 4 },
  { round: 5, court: 3, a: "Мхитарян / Muradyan", b: "Редько / Kh", scoreA: 1, scoreB: 5 },
  { round: 5, court: 4, a: "Аршакян / Ткачев", b: "Шевченко / Борис", scoreA: 6, scoreB: 1 },
  { round: 6, court: 1, a: "Аршакян / Ткачев", b: "Soloveva / Каменный", scoreA: 3, scoreB: 2 },
  { round: 6, court: 2, a: "Пронович / Gleb", b: "Гудини / Shvedov", scoreA: 4, scoreB: 3 },
  { round: 6, court: 3, a: "Редько / Kh", b: "Шевченко / Борис", scoreA: 6, scoreB: 0 },
  { round: 6, court: 4, a: "Shapovalova / Sh", b: "Мхитарян / Muradyan", scoreA: 6, scoreB: 1 },
  { round: 7, court: 1, a: "Редько / Kh", b: "Soloveva / Каменный", scoreA: 5, scoreB: 1 },
  { round: 7, court: 2, a: "Мхитарян / Muradyan", b: "Шевченко / Борис", scoreA: 4, scoreB: 2 },
  { round: 7, court: 3, a: "Shapovalova / Sh", b: "Гудини / Shvedov", scoreA: 3, scoreB: 2 },
  { round: 7, court: 4, a: "Пронович / Gleb", b: "Аршакян / Ткачев", scoreA: 3, scoreB: 4 },
];

const storyCards = [
  {
    image: "/assets/trophy.png",
    label: "Матч за золото",
    title: "Редько / Kh — Аршакян / Ткачев 4–3",
    copy: "Обе пары закончили турнир 6–1, и личная встреча решила, кто станет чемпионом.",
  },
  {
    image: "/assets/handshake.png",
    label: "Главный апсет",
    title: "Гудини / Shvedov — Редько / Kh 4–3",
    copy: "Будущие победители проиграли всего один матч, но именно он стал главным сюжетом вечера.",
  },
  {
    image: "/assets/forehand.png",
    label: "Холодная концовка",
    title: "Шевченко / Борис: 0–4 на финише",
    copy: "После бодрого старта пара не выдержала вторую половину турнира и упала на 7-е место.",
  },
];

const gallery = [
  { src: "/assets/forehand.png", alt: "Игрок выполняет удар на корте" },
  { src: "/assets/handshake.png", alt: "Игроки после матча" },
  { src: "/assets/trophy.png", alt: "Кубок турнира и мячи" },
  { src: "/assets/hero-court.png", alt: "Матч на падел корте" },
];

const americanoPlayers = [
  { place: 1, name: "Kh Ivan", record: "8–3", points: "120–89", delta: 31, change: "+0.039", rating: 3.55 },
  { place: 2, name: "Редько Илья", record: "8–3", points: "111–98", delta: 13, change: "+0.082", rating: 3.18 },
  { place: 3, name: "Рустам Мамедов", record: "7–4", points: "111–98", delta: 13, change: "+0.048", rating: 3.24 },
  { place: 4, name: "G Alexey", record: "6–5", points: "112–97", delta: 15, change: "+0.022", rating: 3.12 },
  { place: 5, name: "Бессонов Егор", record: "6–5", points: "108–101", delta: 7, change: "+0.129", rating: 2.22 },
  { place: 6, name: "Тарасов Артем", record: "6–5", points: "97–112", delta: -15, change: "-0.002", rating: 3.22 },
  { place: 7, name: "Шевченко Эдуард", record: "5–6", points: "101–108", delta: -7, change: "-0.008", rating: 2.97 },
  { place: 8, name: "Борис Чигиринцев", record: "5–6", points: "98–111", delta: -13, change: "+0.027", rating: 2.65 },
  { place: 9, name: "Селантьев Данил", record: "4–7", points: "106–103", delta: 3, change: "-0.034", rating: 2.92 },
  { place: 10, name: "Трут Дмитрий", record: "4–7", points: "100–109", delta: -9, change: "-0.065", rating: 3.28 },
  { place: 11, name: "Каменный Никита", record: "4–7", points: "96–113", delta: -17, change: "-0.043", rating: 2.73 },
  { place: 12, name: "Ширинская Дарья", record: "3–8", points: "94–115", delta: -21, change: "-0.100", rating: 2.95 },
];

const americanoMatches = [
  { round: 1, court: 1, a: ["Шевченко Эдуард", "Ширинская Дарья"], b: ["Редько Илья", "Бессонов Егор"], scoreA: 8, scoreB: 11 },
  { round: 1, court: 2, a: ["Kh Ivan", "G Alexey"], b: ["Борис Чигиринцев", "Тарасов Артем"], scoreA: 16, scoreB: 3 },
  { round: 1, court: 3, a: ["Рустам Мамедов", "Трут Дмитрий"], b: ["Селантьев Данил", "Каменный Никита"], scoreA: 11, scoreB: 8 },
  { round: 2, court: 1, a: ["Шевченко Эдуард", "Рустам Мамедов"], b: ["Каменный Никита", "G Alexey"], scoreA: 8, scoreB: 11 },
  { round: 2, court: 2, a: ["Борис Чигиринцев", "Трут Дмитрий"], b: ["Бессонов Егор", "Ширинская Дарья"], scoreA: 13, scoreB: 6 },
  { round: 2, court: 3, a: ["Редько Илья", "Селантьев Данил"], b: ["Kh Ivan", "Тарасов Артем"], scoreA: 9, scoreB: 10 },
  { round: 3, court: 1, a: ["Бессонов Егор", "Шевченко Эдуард"], b: ["Тарасов Артем", "Селантьев Данил"], scoreA: 12, scoreB: 7 },
  { round: 3, court: 2, a: ["Kh Ivan", "Каменный Никита"], b: ["Борис Чигиринцев", "Ширинская Дарья"], scoreA: 10, scoreB: 9 },
  { round: 3, court: 3, a: ["Рустам Мамедов", "Редько Илья"], b: ["G Alexey", "Трут Дмитрий"], scoreA: 11, scoreB: 8 },
  { round: 4, court: 1, a: ["Рустам Мамедов", "Kh Ivan"], b: ["Трут Дмитрий", "Шевченко Эдуард"], scoreA: 12, scoreB: 7 },
  { round: 4, court: 2, a: ["Борис Чигиринцев", "G Alexey"], b: ["Бессонов Егор", "Селантьев Данил"], scoreA: 11, scoreB: 8 },
  { round: 4, court: 3, a: ["Тарасов Артем", "Редько Илья"], b: ["Ширинская Дарья", "Каменный Никита"], scoreA: 11, scoreB: 8 },
  { round: 5, court: 1, a: ["Рустам Мамедов", "Борис Чигиринцев"], b: ["Шевченко Эдуард", "Редько Илья"], scoreA: 7, scoreB: 12 },
  { round: 5, court: 2, a: ["Ширинская Дарья", "Kh Ivan"], b: ["Селантьев Данил", "G Alexey"], scoreA: 10, scoreB: 9 },
  { round: 5, court: 3, a: ["Бессонов Егор", "Трут Дмитрий"], b: ["Тарасов Артем", "Каменный Никита"], scoreA: 9, scoreB: 10 },
  { round: 6, court: 1, a: ["Селантьев Данил", "Борис Чигиринцев"], b: ["Каменный Никита", "Трут Дмитрий"], scoreA: 10, scoreB: 9 },
  { round: 6, court: 2, a: ["Тарасов Артем", "Шевченко Эдуард"], b: ["Ширинская Дарья", "G Alexey"], scoreA: 10, scoreB: 9 },
  { round: 6, court: 3, a: ["Рустам Мамедов", "Бессонов Егор"], b: ["Редько Илья", "Kh Ivan"], scoreA: 10, scoreB: 9 },
  { round: 7, court: 1, a: ["Ширинская Дарья", "Редько Илья"], b: ["Селантьев Данил", "Трут Дмитрий"], scoreA: 10, scoreB: 9 },
  { round: 7, court: 2, a: ["Рустам Мамедов", "Тарасов Артем"], b: ["Kh Ivan", "Борис Чигиринцев"], scoreA: 13, scoreB: 6 },
  { round: 7, court: 3, a: ["Каменный Никита", "Бессонов Егор"], b: ["G Alexey", "Шевченко Эдуард"], scoreA: 9, scoreB: 10 },
  { round: 8, court: 1, a: ["Селантьев Данил", "Kh Ivan"], b: ["Каменный Никита", "Шевченко Эдуард"], scoreA: 13, scoreB: 6 },
  { round: 8, court: 2, a: ["G Alexey", "Тарасов Артем"], b: ["Трут Дмитрий", "Редько Илья"], scoreA: 9, scoreB: 10 },
  { round: 8, court: 3, a: ["Рустам Мамедов", "Ширинская Дарья"], b: ["Борис Чигиринцев", "Бессонов Егор"], scoreA: 8, scoreB: 11 },
  { round: 9, court: 1, a: ["Каменный Никита", "Борис Чигиринцев"], b: ["G Alexey", "Редько Илья"], scoreA: 8, scoreB: 11 },
  { round: 9, court: 2, a: ["Рустам Мамедов", "Селантьев Данил"], b: ["Бессонов Егор", "Тарасов Артем"], scoreA: 13, scoreB: 6 },
  { round: 9, court: 3, a: ["Ширинская Дарья", "Трут Дмитрий"], b: ["Шевченко Эдуард", "Kh Ivan"], scoreA: 6, scoreB: 13 },
  { round: 10, court: 1, a: ["G Alexey", "Бессонов Егор"], b: ["Трут Дмитрий", "Kh Ivan"], scoreA: 12, scoreB: 7 },
  { round: 10, court: 2, a: ["Рустам Мамедов", "Каменный Никита"], b: ["Тарасов Артем", "Ширинская Дарья"], scoreA: 12, scoreB: 7 },
  { round: 10, court: 3, a: ["Шевченко Эдуард", "Селантьев Данил"], b: ["Редько Илья", "Борис Чигиринцев"], scoreA: 7, scoreB: 12 },
  { round: 11, court: 1, a: ["Редько Илья", "Каменный Никита"], b: ["Kh Ivan", "Бессонов Егор"], scoreA: 5, scoreB: 14 },
  { round: 11, court: 2, a: ["Рустам Мамедов", "G Alexey"], b: ["Ширинская Дарья", "Селантьев Данил"], scoreA: 6, scoreB: 13 },
  { round: 11, court: 3, a: ["Трут Дмитрий", "Тарасов Артем"], b: ["Шевченко Эдуард", "Борис Чигиринцев"], scoreA: 11, scoreB: 8 },
];

const americanoStories = [
  {
    image: "/assets/trophy.png",
    label: "MVP турнира",
    title: "Kh Ivan: 8–3 и лучшая разница +31",
    copy: "Лучший по победам, очкам, защите и общей стабильности. 120 набранных и всего 89 пропущенных.",
  },
  {
    image: "/assets/handshake.png",
    label: "Матч за первое место",
    title: "Редько / Каменный — Kh / Бессонов 5–14",
    copy: "Последний раунд окончательно закрепил первое место за Kh и снял интригу по разнице.",
  },
  {
    image: "/assets/forehand.png",
    label: "Оверперформер",
    title: "Бессонов Егор: 5 место и +0.129",
    copy: "При рейтинге 2.22 он выиграл 6 матчей, закончил в плюсе и сильнее всех прибавил в рейтинге.",
  },
  {
    image: "/assets/hero-court.png",
    label: "Раунд нервов",
    title: "6-й раунд: все три матча 10–9",
    copy: "Самый плотный отрезок турнира: каждый корт закончился разницей всего в одно очко.",
  },
  {
    image: "/assets/handshake.png",
    label: "Странная статистика",
    title: "Селантьев: 9 место при разнице +3",
    copy: "Редкий случай, когда игрок остается в нижней части таблицы, но по качеству очков выглядит выше.",
  },
];

const mexicanoPlayers = [
  { place: 1, name: "Искалдович Константин", record: "9–2", points: "105–82", delta: 23, change: "+0.379", rating: 1.5 },
  { place: 2, name: "Гудини Дмитрий", record: "7–4", points: "101–86", delta: 15, change: "+0.056", rating: 2.28 },
  { place: 3, name: "Khrapatyi Denis", record: "7–4", points: "98–89", delta: 9, change: "+0.122", rating: 1.93 },
  { place: 4, name: "Калюжный Максим", record: "8–3", points: "97–90", delta: 7, change: "+0.098", rating: 2.28 },
  { place: 5, name: "Очкуров Илья", record: "6–5", points: "96–91", delta: 5, change: "+0.088", rating: 1.79 },
  { place: 6, name: "@L.A.Bruin Алексей", record: "5–6", points: "93–94", delta: -1, change: "-0.074", rating: 2.27 },
  { place: 7, name: "Кулик Дмитрий", record: "6–5", points: "92–95", delta: -3, change: "+0.003", rating: 1.9 },
  { place: 8, name: "Золотов Илья", record: "5–6", points: "92–95", delta: -3, change: "+0.055", rating: 1.57 },
  { place: 9, name: "Khizhnyak Mikhail", record: "3–8", points: "92–95", delta: -3, change: "-0.160", rating: 2.14 },
  { place: 10, name: "Князев Влад", record: "4–7", points: "89–98", delta: -9, change: "-0.180", rating: 2.26 },
  { place: 11, name: "Захаров Иван", record: "2–9", points: "86–101", delta: -15, change: "+0.006", rating: 1.0 },
  { place: 12, name: "Levchenko Roman", record: "4–7", points: "81–106", delta: -25, change: "-0.050", rating: 1.44 },
];

const mexicanoMatches = [
  { round: 1, court: 1, a: ["Калюжный Максим", "Князев Влад"], b: ["Гудини Дмитрий", "@L.A.Bruin Алексей"], scoreA: 6, scoreB: 11 },
  { round: 1, court: 2, a: ["Khizhnyak Mikhail", "Очкуров Илья"], b: ["Khrapatyi Denis", "Кулик Дмитрий"], scoreA: 7, scoreB: 10 },
  { round: 1, court: 3, a: ["Золотов Илья", "Захаров Иван"], b: ["Искалдович Константин", "Levchenko Roman"], scoreA: 8, scoreB: 9 },
  { round: 2, court: 1, a: ["Гудини Дмитрий", "Кулик Дмитрий"], b: ["@L.A.Bruin Алексей", "Khrapatyi Denis"], scoreA: 6, scoreB: 11 },
  { round: 2, court: 2, a: ["Искалдович Константин", "Захаров Иван"], b: ["Levchenko Roman", "Золотов Илья"], scoreA: 11, scoreB: 6 },
  { round: 2, court: 3, a: ["Khizhnyak Mikhail", "Князев Влад"], b: ["Очкуров Илья", "Калюжный Максим"], scoreA: 8, scoreB: 9 },
  { round: 3, court: 1, a: ["@L.A.Bruin Алексей", "Захаров Иван"], b: ["Khrapatyi Denis", "Искалдович Константин"], scoreA: 8, scoreB: 9 },
  { round: 3, court: 2, a: ["Гудини Дмитрий", "Калюжный Максим"], b: ["Кулик Дмитрий", "Очкуров Илья"], scoreA: 11, scoreB: 6 },
  { round: 3, court: 3, a: ["Levchenko Roman", "Золотов Илья"], b: ["Khizhnyak Mikhail", "Князев Влад"], scoreA: 5, scoreB: 12 },
  { round: 4, court: 1, a: ["Khrapatyi Denis", "Гудини Дмитрий"], b: ["@L.A.Bruin Алексей", "Искалдович Константин"], scoreA: 8, scoreB: 9 },
  { round: 4, court: 2, a: ["Khizhnyak Mikhail", "Князев Влад"], b: ["Захаров Иван", "Калюжный Максим"], scoreA: 11, scoreB: 6 },
  { round: 4, court: 3, a: ["Кулик Дмитрий", "Золотов Илья"], b: ["Очкуров Илья", "Levchenko Roman"], scoreA: 10, scoreB: 7 },
  { round: 5, court: 1, a: ["@L.A.Bruin Алексей", "Khizhnyak Mikhail"], b: ["Искалдович Константин", "Khrapatyi Denis"], scoreA: 8, scoreB: 9 },
  { round: 5, court: 2, a: ["Князев Влад", "Калюжный Максим"], b: ["Гудини Дмитрий", "Захаров Иван"], scoreA: 11, scoreB: 6 },
  { round: 5, court: 3, a: ["Кулик Дмитрий", "Levchenko Roman"], b: ["Золотов Илья", "Очкуров Илья"], scoreA: 7, scoreB: 10 },
  { round: 6, court: 1, a: ["Князев Влад", "@L.A.Bruin Алексей"], b: ["Искалдович Константин", "Khrapatyi Denis"], scoreA: 5, scoreB: 12 },
  { round: 6, court: 2, a: ["Khizhnyak Mikhail", "Золотов Илья"], b: ["Калюжный Максим", "Гудини Дмитрий"], scoreA: 7, scoreB: 10 },
  { round: 6, court: 3, a: ["Кулик Дмитрий", "Levchenko Roman"], b: ["Очкуров Илья", "Захаров Иван"], scoreA: 9, scoreB: 8 },
  { round: 7, court: 1, a: ["Искалдович Константин", "Князев Влад"], b: ["Khrapatyi Denis", "Калюжный Максим"], scoreA: 7, scoreB: 10 },
  { round: 7, court: 2, a: ["Khizhnyak Mikhail", "Кулик Дмитрий"], b: ["@L.A.Bruin Алексей", "Гудини Дмитрий"], scoreA: 7, scoreB: 10 },
  { round: 7, court: 3, a: ["Очкуров Илья", "Levchenko Roman"], b: ["Захаров Иван", "Золотов Илья"], scoreA: 9, scoreB: 8 },
  { round: 8, court: 1, a: ["Khrapatyi Denis", "@L.A.Bruin Алексей"], b: ["Искалдович Константин", "Калюжный Максим"], scoreA: 8, scoreB: 9 },
  { round: 8, court: 2, a: ["Гудини Дмитрий", "Очкуров Илья"], b: ["Князев Влад", "Khizhnyak Mikhail"], scoreA: 11, scoreB: 6 },
  { round: 8, court: 3, a: ["Кулик Дмитрий", "Levchenko Roman"], b: ["Захаров Иван", "Золотов Илья"], scoreA: 6, scoreB: 11 },
  { round: 9, court: 1, a: ["Khrapatyi Denis", "Калюжный Максим"], b: ["Искалдович Константин", "Гудини Дмитрий"], scoreA: 5, scoreB: 12 },
  { round: 9, court: 2, a: ["@L.A.Bruin Алексей", "Khizhnyak Mikhail"], b: ["Очкуров Илья", "Князев Влад"], scoreA: 7, scoreB: 10 },
  { round: 9, court: 3, a: ["Захаров Иван", "Levchenko Roman"], b: ["Золотов Илья", "Кулик Дмитрий"], scoreA: 8, scoreB: 9 },
  { round: 10, court: 1, a: ["Искалдович Константин", "Калюжный Максим"], b: ["Гудини Дмитрий", "Khrapatyi Denis"], scoreA: 10, scoreB: 7 },
  { round: 10, court: 2, a: ["Очкуров Илья", "Золотов Илья"], b: ["@L.A.Bruin Алексей", "Князев Влад"], scoreA: 11, scoreB: 6 },
  { round: 10, court: 3, a: ["Захаров Иван", "Levchenko Roman"], b: ["Khizhnyak Mikhail", "Кулик Дмитрий"], scoreA: 5, scoreB: 12 },
  { round: 11, court: 1, a: ["Искалдович Константин", "Очкуров Илья"], b: ["Гудини Дмитрий", "Khrapatyi Denis"], scoreA: 8, scoreB: 9 },
  { round: 11, court: 2, a: ["Калюжный Максим", "@L.A.Bruin Алексей"], b: ["Золотов Илья", "Khizhnyak Mikhail"], scoreA: 10, scoreB: 7 },
  { round: 11, court: 3, a: ["Кулик Дмитрий", "Levchenko Roman"], b: ["Князев Влад", "Захаров Иван"], scoreA: 10, scoreB: 7 },
];

const mexicanoStories = [
  {
    image: "/assets/trophy.png",
    label: "Победитель по дельте",
    title: "Искалдович Константин: +23",
    copy: "Костя закончил с лучшей разницей очков 105–82 и забрал LITE-турнир по главному правилу Mexicano.",
  },
  {
    image: "/assets/handshake.png",
    label: "Темная лошадка",
    title: "Эдуард Шевченко сыграл за победителя",
    copy: "Важная скрытая роль турнира: Эдуард Шевченко выходил за Костю и помог сохранить чемпионский темп.",
  },
  {
    image: "/assets/forehand.png",
    label: "Фейл турнира",
    title: "Никита Каменный не явился",
    copy: "Главный организационный провал: игрок не пришел без предупреждения и заставил перестраивать турнир на ходу.",
  },
  {
    image: "/assets/hero-court.png",
    label: "Сильная группа",
    title: "Гудини и Khrapatyi: плотная борьба",
    copy: "Оба закончили 7–4, но Дмитрий взял второе место за счет более высокой дельты +15.",
  },
  {
    image: "/assets/trophy.png",
    label: "Главный контраст",
    title: "Калюжный: 8 побед, но 4 место",
    copy: "Максим выиграл больше матчей, чем игроки выше, но формат по дельте оставил его за пределами топ-3.",
  },
];

const tournamentRegistry = [
  {
    id: "mexicano-brazzers-lite",
    title: "Mexicano Brazzers LITE",
    date: "21 июня",
    dateOrder: "2026-06-21",
    club: "Padel Pro Club",
    format: "Mexicano",
    teams: "12 игроков",
    rounds: "11 раундов",
    matches: "33 матча",
    winner: "Искалдович Константин",
    status: "Боевой турнир",
    image: "/assets/trophy.png",
    featured: true,
  },
  {
    id: "americano-brazzers-pro",
    title: "Americano Brazzers PRO",
    date: "17 июня",
    dateOrder: "2026-06-17",
    club: "Padel Pro Club",
    format: "Americano",
    teams: "12 игроков",
    rounds: "11 раундов",
    matches: "33 матча",
    winner: "Kh Ivan",
    status: "Боевой турнир",
    image: "/assets/handshake.png",
    featured: true,
  },
].sort((a, b) => b.dateOrder.localeCompare(a.dateOrder));

const fallbackForecastTournaments = [
  {
    id: "forecast-shell",
    title: "Будущий турнир",
    date: "Дата после публикации",
    time: "Время будет задано",
    club: "Padel Pro Club",
    format: "Формат из управляющей части",
    players: "Состав ожидается",
    status: "Прием прогнозов",
    image: "/assets/hero-court.png",
    roster: [],
  },
];

const fallbackScoringMethods = [
  {
    createdAt: new Date(0).toISOString(),
    description: "Базовый подсчет для индивидуальных турниров: Americano, Mexicano, Escalera.",
    exactPlace: 5,
    formats: "Americano, Mexicano, Escalera",
    id: "individual-basic",
    lastPlaceBonus: 5,
    name: "Базовая индивидуальная методика",
    onePositionError: 3,
    top3AnyOrderBonus: 8,
    top3ExactBonus: 15,
    twoPositionError: 1,
  },
];

const authTokenStorageKey = "padel-brazzers-auth-token";
const emptyAuthState = { currentUser: null, hasUsers: false, loading: true, notifications: [], users: [] };
const defaultSettings = { predictionRegistryVisibility: "admin" };

function getStoredAuthToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(authTokenStorageKey) ?? "";
}

function storeAuthToken(token) {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    window.localStorage.setItem(authTokenStorageKey, token);
    return;
  }

  window.localStorage.removeItem(authTokenStorageKey);
}

async function apiRequest(path, options = {}) {
  const token = getStoredAuthToken();
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message ?? "Не удалось выполнить запрос.");
  }

  return payload;
}

function getInitials(user) {
  if (!user) {
    return "PB";
  }

  return `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "PB";
}

function getUserDisplayName(user) {
  if (!user) {
    return "";
  }

  return `${user.firstName} ${user.lastName}`.trim() || user.lundaNick;
}

function formatVladivostokDate(date) {
  if (!date || !date.includes("-")) {
    return date;
  }

  const [year, month, day] = date.split("-");
  return `${day}.${month}.${year}`;
}

function formatVladivostokDateTime(value) {
  if (!value || !value.includes("T")) {
    return value;
  }

  const [date, time] = value.split("T");
  return `${formatVladivostokDate(date)} ${time} VLAT`;
}

function formatVladivostokInstant(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Vladivostok",
    year: "numeric",
  }).format(new Date(value)).replace(",", "");
}

function describeScoringMethod(method) {
  if (!method) {
    return "Методика не выбрана";
  }

  return `Точное место ${method.exactPlace} · ошибка на 1 позицию ${method.onePositionError} · ошибка на 2 позиции ${method.twoPositionError} · топ-3 точно +${method.top3ExactBonus} · топ-3 в любом порядке +${method.top3AnyOrderBonus} · последнее место +${method.lastPlaceBonus}`;
}

function getScoringMethodDetails(method) {
  if (!method) {
    return [];
  }

  return [
    ["Точное место", `${method.exactPlace} баллов`],
    ["Ошибка на 1 позицию", `${method.onePositionError} балла`],
    ["Ошибка на 2 позиции", `${method.twoPositionError} балл`],
    ["Топ-3 точный", `+${method.top3ExactBonus}`],
    ["Топ-3 в любом порядке", `+${method.top3AnyOrderBonus}`],
    ["Последнее место", `+${method.lastPlaceBonus}`],
  ];
}

function getTournamentScoringMethod(tournament, scoringMethods) {
  return tournament.scoringMethod
    ?? scoringMethods.find((method) => method.id === tournament.scoringMethodId)
    ?? scoringMethods[0]
    ?? fallbackScoringMethods[0];
}

function buildForecastSlotsFromPrediction(prediction, roster) {
  const nextSlots = Array.from({ length: 16 }, () => null);
  const rosterById = new Map(roster.map((player) => [String(player.id ?? player.name), player]));

  if (!prediction?.placements?.length) {
    return nextSlots;
  }

  prediction.placements.forEach((placement) => {
    const slotIndex = Number(placement.place) - 1;
    const player = rosterById.get(String(placement.playerId));
    if (slotIndex >= 0 && slotIndex < nextSlots.length && player) {
      nextSlots[slotIndex] = player;
    }
  });

  (prediction.invalidPlacements ?? []).forEach((placement) => {
    const slotIndex = Number(placement.place) - 1;
    if (slotIndex >= 0 && slotIndex < nextSlots.length) {
      nextSlots[slotIndex] = {
        id: placement.playerId,
        invalid: true,
        name: placement.playerName,
        rating: placement.rating,
      };
    }
  });

  return nextSlots;
}

function getStandingsAfterRound(round) {
  const table = new Map(
    standings.map((team, index) => [
      team.team,
      {
        team: team.team,
        short: team.short,
        index,
        wins: 0,
        losses: 0,
        for: 0,
        against: 0,
      },
    ]),
  );

  matches
    .filter((match) => match.round <= round)
    .forEach((match) => {
      const a = table.get(match.a);
      const b = table.get(match.b);

      a.for += match.scoreA;
      a.against += match.scoreB;
      b.for += match.scoreB;
      b.against += match.scoreA;

      if (match.scoreA > match.scoreB) {
        a.wins += 1;
        b.losses += 1;
      } else {
        b.wins += 1;
        a.losses += 1;
      }
    });

  return [...table.values()]
    .map((team) => ({
      ...team,
      delta: team.for - team.against,
      record: `${team.wins} - 0 - ${team.losses}`,
      points: `${team.for} - ${team.against}`,
    }))
    .sort(
      (a, b) =>
        b.wins - a.wins ||
        b.delta - a.delta ||
        b.for - a.for ||
        a.index - b.index,
    );
}

function TeamBadge({ team, small = false }) {
  const match = standings.find((item) => item.team === team);
  return <span className={`team-badge ${small ? "small" : ""}`}>{match?.rating?.toFixed(1) ?? "—"}</span>;
}

function PlayerBadge({ player, small = false, playerPool = americanoPlayers }) {
  const match = playerPool.find((item) => item.name === player);
  return <span className={`team-badge player-rating ${small ? "small" : ""}`}>{match?.rating?.toFixed(1) ?? "—"}</span>;
}

function getPairRating(players, playerPool = americanoPlayers) {
  return players.reduce((sum, player) => {
    const match = playerPool.find((item) => item.name === player);
    return sum + (match?.rating ?? 0);
  }, 0);
}

function PairRatingBadge({ players, playerPool = americanoPlayers }) {
  return <span className="pair-rating-badge">{getPairRating(players, playerPool).toFixed(1)}</span>;
}

function getIndividualStandingsAfterRound(playerPool, matchPool, round, sortMode = "wins") {
  const table = new Map(
    playerPool.map((player, index) => [
      player.name,
      {
        name: player.name,
        index,
        wins: 0,
        losses: 0,
        for: 0,
        against: 0,
      },
    ]),
  );

  matchPool
    .filter((match) => match.round <= round)
    .forEach((match) => {
      const sideAWin = match.scoreA > match.scoreB;
      const applyScore = (playerName, own, opponent, won) => {
        const player = table.get(playerName);
        player.for += own;
        player.against += opponent;
        if (won) {
          player.wins += 1;
        } else {
          player.losses += 1;
        }
      };

      match.a.forEach((player) => applyScore(player, match.scoreA, match.scoreB, sideAWin));
      match.b.forEach((player) => applyScore(player, match.scoreB, match.scoreA, !sideAWin));
    });

  const rows = [...table.values()]
    .map((player) => ({
      ...player,
      delta: player.for - player.against,
      record: `${player.wins}–${player.losses}`,
      points: `${player.for}–${player.against}`,
    }));

  if (sortMode === "delta") {
    return rows.sort(
      (a, b) =>
        b.delta - a.delta ||
        b.for - a.for ||
        b.wins - a.wins ||
        a.index - b.index,
    );
  }

  return rows.sort(
    (a, b) =>
      b.wins - a.wins ||
      b.delta - a.delta ||
      b.for - a.for ||
      a.index - b.index,
  );
}

function getAmericanoStandingsAfterRound(round) {
  return getIndividualStandingsAfterRound(americanoPlayers, americanoMatches, round);
}

function LeaderCard({ eyebrow, name, meta, metric, image }) {
  return (
    <article className="leader-card">
      <img src={image} alt="" />
      <div className="leader-copy">
        <span>{eyebrow}</span>
        <strong>{name}</strong>
        <small>{meta}</small>
      </div>
      <div className="leader-metric">
        <span>{metric.label}</span>
        <strong>{metric.value}</strong>
      </div>
    </article>
  );
}

function AmericanoStandingsTable() {
  return (
    <section className="surface standings-card americano-final-card" id="standings">
      <div className="section-title">
        <span>Личный зачет</span>
        <h2>12 игроков после 11 раундов</h2>
      </div>
      <div className="americano-standings-head">
        <span>#</span>
        <span>Игрок</span>
        <span>Игры</span>
        <span>Очки</span>
        <span>+/-</span>
      </div>
      <div className="standings-list">
        {americanoPlayers.map((item) => (
          <article className="americano-standing-row" key={item.name}>
            <b>{item.place}</b>
            <div className="standing-team">
              <PlayerBadge player={item.name} small />
              <strong>{item.name}</strong>
            </div>
            <span>{item.record}</span>
            <span>{item.points}</span>
            <em className={item.delta >= 0 ? "positive" : "negative"}>{item.delta > 0 ? `+${item.delta}` : item.delta}</em>
          </article>
        ))}
      </div>
      <footer>Победитель определяется по победам · Americano</footer>
    </section>
  );
}

function MexicanoStandingsTable() {
  return (
    <section className="surface standings-card americano-final-card" id="standings">
      <div className="section-title">
        <span>Личный зачет</span>
        <h2>12 игроков · победитель по дельте</h2>
      </div>
      <div className="americano-standings-head">
        <span>#</span>
        <span>Игрок</span>
        <span>Игры</span>
        <span>Очки</span>
        <span>+/-</span>
      </div>
      <div className="standings-list">
        {mexicanoPlayers.map((item) => (
          <article className="americano-standing-row" key={item.name}>
            <b>{item.place}</b>
            <div className="standing-team">
              <PlayerBadge player={item.name} playerPool={mexicanoPlayers} small />
              <strong>{item.name}</strong>
            </div>
            <span>{item.record}</span>
            <span>{item.points}</span>
            <em className={item.delta >= 0 ? "positive" : "negative"}>{item.delta > 0 ? `+${item.delta}` : item.delta}</em>
          </article>
        ))}
      </div>
      <footer>Победитель определяется по дельте очков · Mexicano</footer>
    </section>
  );
}

function StandingsTable() {
  return (
    <section className="surface standings-card" id="standings">
      <div className="section-title">
        <span>Итоговая таблица</span>
        <h2>8 пар после 7 раундов</h2>
      </div>
      <div className="standings-head">
        <span>#</span>
        <span>Пара</span>
        <span>Игры</span>
        <span>Очки</span>
        <span>+/-</span>
      </div>
      <div className="standings-list">
        {standings.map((item) => (
          <article className={`standing-row ${item.focus ? "focus" : ""}`} key={item.team}>
            <b>{item.place}</b>
            <div className="standing-team">
              <TeamBadge team={item.team} small />
              <strong>{item.team}</strong>
            </div>
            <span>{item.record}</span>
            <span>{item.points}</span>
            <em className={item.delta >= 0 ? "positive" : "negative"}>{item.delta > 0 ? `+${item.delta}` : item.delta}</em>
          </article>
        ))}
      </div>
      <footer>8 пар · 7 раундов · PRO</footer>
    </section>
  );
}

function AmericanoRoundPanel() {
  const [round, setRound] = useState(11);
  const shownMatches = useMemo(
    () => americanoMatches.filter((match) => match.round === round),
    [round],
  );
  const roundStandings = useMemo(() => getAmericanoStandingsAfterRound(round), [round]);

  return (
    <section className="surface round-card americano-round-card" id="rounds">
      <div className="round-head">
        <div>
          <span>Раунд {round}</span>
          <h2>{round === 11 ? "Финальные смены" : "Матчи Americano"}</h2>
        </div>
        <div className="round-picker americano-picker" aria-label="Выбор раунда">
          {Array.from({ length: 11 }, (_, index) => index + 1).map((item) => (
            <button
              className={round === item ? "active" : ""}
              type="button"
              onClick={() => setRound(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="round-body americano-round-body">
        <div className="match-list americano-match-list">
          <div className="match-list-title">
            <span>Результаты игр</span>
            <strong>{round} раунда</strong>
          </div>
          <div className="match-list-head americano-match-head">
            <span>Корт</span>
            <span>Пары</span>
            <span>Счет</span>
          </div>
          {shownMatches.map((match) => (
            <article className="match-row americano-match-row" key={match.court}>
              <span>Корт {match.court}</span>
              <div>
                <p className={match.scoreA > match.scoreB ? "winner" : "loser"}>
                  <PairRatingBadge players={match.a} />
                  <span className="americano-pair-name">
                    <span>{match.a[0]}</span>
                    <span>{match.a[1]}</span>
                  </span>
                </p>
                <p className={match.scoreB > match.scoreA ? "winner" : "loser"}>
                  <PairRatingBadge players={match.b} />
                  <span className="americano-pair-name">
                    <span>{match.b[0]}</span>
                    <span>{match.b[1]}</span>
                  </span>
                </p>
              </div>
              <strong>
                {match.scoreA}
                <small>:</small>
                {match.scoreB}
              </strong>
            </article>
          ))}
        </div>
        <div className="round-standings americano-live-table">
          <div className="round-standings-title">
            <span>Личный зачет</span>
            <strong>После {round} раунда</strong>
          </div>
          <div className="americano-live-head">
            <span>#</span>
            <span>Игрок</span>
            <span>Игры</span>
            <span>Очки</span>
            <span>+/-</span>
          </div>
          {roundStandings.map((player, index) => (
            <article className="americano-live-row" key={player.name}>
              <b>{index + 1}</b>
              <div>
                <PlayerBadge player={player.name} small />
                <strong>{player.name}</strong>
              </div>
              <span>{player.record}</span>
              <span>{player.points}</span>
              <em className={player.delta >= 0 ? "positive" : "negative"}>
                {player.delta > 0 ? `+${player.delta}` : player.delta}
              </em>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function MexicanoRoundPanel() {
  const [round, setRound] = useState(11);
  const shownMatches = useMemo(
    () => mexicanoMatches.filter((match) => match.round === round),
    [round],
  );
  const roundStandings = useMemo(
    () => getIndividualStandingsAfterRound(mexicanoPlayers, mexicanoMatches, round, "delta"),
    [round],
  );

  return (
    <section className="surface round-card americano-round-card" id="rounds">
      <div className="round-head">
        <div>
          <span>Раунд {round}</span>
          <h2>{round === 11 ? "Финальные смены" : "Матчи Mexicano"}</h2>
        </div>
        <div className="round-picker americano-picker" aria-label="Выбор раунда">
          {Array.from({ length: 11 }, (_, index) => index + 1).map((item) => (
            <button
              className={round === item ? "active" : ""}
              type="button"
              onClick={() => setRound(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="round-body americano-round-body">
        <div className="match-list americano-match-list">
          <div className="match-list-title">
            <span>Результаты игр</span>
            <strong>{round} раунда</strong>
          </div>
          <div className="match-list-head americano-match-head">
            <span>Корт</span>
            <span>Пары</span>
            <span>Счет</span>
          </div>
          {shownMatches.map((match) => (
            <article className="match-row americano-match-row" key={match.court}>
              <span>Корт {match.court}</span>
              <div>
                <p className={match.scoreA > match.scoreB ? "winner" : "loser"}>
                  <PairRatingBadge players={match.a} playerPool={mexicanoPlayers} />
                  <span className="americano-pair-name">
                    <span>{match.a[0]}</span>
                    <span>{match.a[1]}</span>
                  </span>
                </p>
                <p className={match.scoreB > match.scoreA ? "winner" : "loser"}>
                  <PairRatingBadge players={match.b} playerPool={mexicanoPlayers} />
                  <span className="americano-pair-name">
                    <span>{match.b[0]}</span>
                    <span>{match.b[1]}</span>
                  </span>
                </p>
              </div>
              <strong>
                {match.scoreA}
                <small>:</small>
                {match.scoreB}
              </strong>
            </article>
          ))}
        </div>
        <div className="round-standings americano-live-table">
          <div className="round-standings-title">
            <span>Личный зачет</span>
            <strong>После {round} раунда</strong>
          </div>
          <div className="americano-live-head">
            <span>#</span>
            <span>Игрок</span>
            <span>Игры</span>
            <span>Очки</span>
            <span>+/-</span>
          </div>
          {roundStandings.map((player, index) => (
            <article className="americano-live-row" key={player.name}>
              <b>{index + 1}</b>
              <div>
                <PlayerBadge player={player.name} playerPool={mexicanoPlayers} small />
                <strong>{player.name}</strong>
              </div>
              <span>{player.record}</span>
              <span>{player.points}</span>
              <em className={player.delta >= 0 ? "positive" : "negative"}>
                {player.delta > 0 ? `+${player.delta}` : player.delta}
              </em>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function RoundPanel() {
  const [round, setRound] = useState(7);
  const shownMatches = useMemo(
    () => matches.filter((match) => match.round === round),
    [round],
  );
  const roundStandings = useMemo(() => getStandingsAfterRound(round), [round]);

  return (
    <section className="surface round-card" id="rounds">
      <div className="round-head">
        <div>
          <span>Раунд {round}</span>
          <h2>{round === 7 ? "Финальные матчи" : "Матчи раунда"}</h2>
        </div>
        <div className="round-picker" aria-label="Выбор раунда">
          {[1, 2, 3, 4, 5, 6, 7].map((item) => (
            <button
              className={round === item ? "active" : ""}
              type="button"
              onClick={() => setRound(item)}
              key={item}
            >
              Раунд {item}
            </button>
          ))}
        </div>
      </div>
      <div className="round-body">
        <div className="match-list">
          <div className="match-list-title">
            <span>Результаты игр</span>
            <strong>{round} раунда</strong>
          </div>
          <div className="match-list-head">
            <span>Корт</span>
            <span>Пары</span>
            <span>Счет</span>
          </div>
          {shownMatches.map((match) => (
            <article className="match-row" key={match.court}>
              <span>Корт {match.court}</span>
              <div>
                <p className={match.scoreA > match.scoreB ? "winner" : "loser"}>
                  <TeamBadge team={match.a} small />
                  {match.a}
                </p>
                <p className={match.scoreB > match.scoreA ? "winner" : "loser"}>
                  <TeamBadge team={match.b} small />
                  {match.b}
                </p>
              </div>
              <strong>
                {match.scoreA}
                <small>:</small>
                {match.scoreB}
              </strong>
            </article>
          ))}
        </div>
        <div className="round-standings">
          <div className="round-standings-title">
            <span>Положение</span>
            <strong>После {round} раунда</strong>
          </div>
          <div className="round-standings-head">
            <span>#</span>
            <span>Пара</span>
            <span>Игры</span>
            <span>Очки</span>
            <span>+/-</span>
          </div>
          {roundStandings.map((team, index) => (
            <article className="round-standing-row" key={team.team}>
              <b>{index + 1}</b>
              <div>
                <TeamBadge team={team.team} small />
                <strong>{team.team}</strong>
              </div>
              <span>{team.record}</span>
              <span>{team.points}</span>
              <em className={team.delta >= 0 ? "positive" : "negative"}>
                {team.delta > 0 ? `+${team.delta}` : team.delta}
              </em>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function DescriptionPanel({ onClose }) {
  return (
    <section className="description-panel" id="description">
      <article>
        <span>О турнире</span>
        <p>
          THE BEST MIDDLE (PM) — еженедельный PRO-турнир Padel Brazzers в категории
          middle. Round Robin на 8 пар: каждый играет с каждым, а итоговая таблица
          собирается по победам, очкам и личным встречам.
        </p>
      </article>
      <article>
        <span>Правила подсчета</span>
        <ul>
          <li>Победа — 3 очка, ничья — 1, поражение — 0.</li>
          <li>При равенстве очков учитываются личная встреча и разница геймов.</li>
          <li>Матчи до 5 геймов, при счете 4–4 играется тай-брейк до 7.</li>
        </ul>
      </article>
      <article>
        <span>Что входит</span>
        <ul className="includes">
          <li>Вода и изотоники</li>
          <li>Бананы и фрукты</li>
          <li>Фото с турнира</li>
          <li>Статистика и рейтинг</li>
        </ul>
      </article>
      <button type="button" onClick={onClose}>Свернуть</button>
    </section>
  );
}

function AmericanoDescriptionPanel({ onClose }) {
  return (
    <section className="description-panel americano-description" id="description">
      <article>
        <span>О формате</span>
        <p>
          Americano на 12 игроков: каждый участник сыграл с каждым в паре по одному
          разу и дважды против каждого соперника. Победитель определяется по числу
          побед, затем по разнице и набранным очкам.
        </p>
      </article>
      <article>
        <span>Итог турнира</span>
        <ul>
          <li>Kh Ivan — 8 побед, лучшая разница +31 и первое место.</li>
          <li>Редько Илья тоже набрал 8 побед, но уступил по качеству результата.</li>
          <li>Рустам Мамедов взял бронзу с балансом 7–4.</li>
        </ul>
      </article>
      <article>
        <span>Номинации</span>
        <ul className="includes">
          <li>MVP: Kh Ivan</li>
          <li>Оверперформер: Бессонов</li>
          <li>Раунд нервов: 6-й</li>
          <li>Матч турнира: 5–14</li>
        </ul>
      </article>
      <button type="button" onClick={onClose}>Свернуть</button>
    </section>
  );
}

function MexicanoDescriptionPanel({ onClose }) {
  return (
    <section className="description-panel americano-description" id="description">
      <article>
        <span>О формате</span>
        <p>
          Mexicano LITE на 12 игроков: пары менялись каждый раунд, а победитель
          определялся не по числу побед, а по дельте набранных и пропущенных очков.
          В каждом матче играли сет до 17 очков.
        </p>
      </article>
      <article>
        <span>Итог турнира</span>
        <ul>
          <li>Искалдович Константин выиграл турнир с дельтой +23.</li>
          <li>Гудини Дмитрий забрал второе место с +15, Khrapatyi Denis — третье с +9.</li>
          <li>Калюжный Максим выиграл 8 матчей, но остался четвертым из-за дельты +7.</li>
        </ul>
      </article>
      <article>
        <span>Важное</span>
        <ul className="includes">
          <li>Темная лошадка: Эдуард Шевченко</li>
          <li>Сыграл за победителя Костю</li>
          <li>Фейл: Никита Каменный</li>
          <li>Не явился без предупреждения</li>
        </ul>
      </article>
      <button type="button" onClick={onClose}>Свернуть</button>
    </section>
  );
}

function AuthControls({ currentUser, notifications = [], onLogin, onLogout, onOpenAdmin, onOpenForecastTournament, onReadNotification, onRegister }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  if (currentUser) {
    const isPending = currentUser.status === "pending";
    const canOpenAdmin = currentUser.role === "admin" && currentUser.status === "active";
    const unreadNotifications = notifications.filter((notification) => !notification.readAt);

    return (
      <div className="auth-user-card">
        <span>{getInitials(currentUser)}</span>
        <div>
          <strong>{getUserDisplayName(currentUser)}</strong>
          <small>{isPending ? "Ожидает подтверждения" : currentUser.role === "admin" ? "Админ" : "Участник"}</small>
        </div>
        {notifications.length > 0 && (
          <button type="button" onClick={() => setNotificationsOpen((value) => !value)}>
            Уведомления {unreadNotifications.length || ""}
          </button>
        )}
        {canOpenAdmin && <button type="button" onClick={onOpenAdmin}>Кабинет</button>}
        <button type="button" onClick={onLogout}>Выйти</button>
        {notificationsOpen && (
          <div className="auth-notification-popover">
            {notifications.map((notification) => (
              <article className={notification.readAt ? "read" : ""} key={notification.id}>
                <span>{notification.readAt ? "Прочитано" : "Новое"}</span>
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
                <div>
                  {notification.tournamentId && (
                    <button
                      type="button"
                      onClick={() => {
                        onReadNotification?.(notification.id);
                        onOpenForecastTournament?.(notification.tournamentId);
                        setNotificationsOpen(false);
                      }}
                    >
                      Открыть прогноз
                    </button>
                  )}
                  {!notification.readAt && (
                    <button type="button" onClick={() => onReadNotification?.(notification.id)}>
                      Прочитано
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="auth-actions">
      <button type="button" onClick={onLogin}>Войти</button>
      <button type="button" onClick={onRegister}>Зарегистрироваться</button>
    </div>
  );
}

function AuthModal({ hasUsers, mode, onClose, onLogin, onRegister }) {
  const isLogin = mode === "login";
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    lundaNick: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isFirstUser = !hasUsers;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const result = await (isLogin ? onLogin(form.email, form.password) : onRegister(form));
      if (!result.ok) {
        setError(result.message);
        return;
      }

      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-modal="true"
        className="auth-modal surface"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="auth-modal-head">
          <div>
            <span>{isLogin ? "Вход" : isFirstUser ? "Первый админ" : "Заявка участника"}</span>
            <h2>{isLogin ? "Войти в прогнозы" : "Регистрация в клубе"}</h2>
          </div>
          <button aria-label="Закрыть" type="button" onClick={onClose}>×</button>
        </div>

        {!isLogin && (
          <p className="auth-note">
            {isFirstUser
              ? "Первый зарегистрированный аккаунт получает права админа."
              : "После регистрации админ подтвердит участника, и прогнозы откроются."}
          </p>
        )}

        <form className="prediction-login-form auth-form" onSubmit={submitForm}>
          {!isLogin && (
            <>
              <div className="auth-form-grid">
                <label>
                  <span>Имя</span>
                  <input required value={form.firstName} onChange={(event) => updateField("firstName", event.target.value)} />
                </label>
                <label>
                  <span>Фамилия</span>
                  <input required value={form.lastName} onChange={(event) => updateField("lastName", event.target.value)} />
                </label>
              </div>
              <label>
                <span>Ник в Lunda</span>
                <input required value={form.lundaNick} onChange={(event) => updateField("lundaNick", event.target.value)} />
              </label>
              <label>
                <span>Телефон</span>
                <input required inputMode="tel" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
              </label>
            </>
          )}

          <label>
            <span>Почта</span>
            <input required type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} />
          </label>
          <label>
            <span>Пароль</span>
            <input required minLength={6} type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} />
          </label>

          {error && <strong className="prediction-error">{error}</strong>}

          <button disabled={submitting} type="submit">
            {submitting ? "Проверяем..." : isLogin ? "Войти" : "Отправить регистрацию"}
          </button>
        </form>
      </section>
    </div>
  );
}

function PredictionAccessGate({ currentUser, onLogin, onRegister }) {
  const isPending = currentUser?.status === "pending";

  return (
    <section className="surface prediction-access-gate" id="top">
      <img src="/assets/hero-court.png" alt="" />
      <div>
        <span className="eyebrow">{isPending ? "Заявка на проверке" : "Требуется вход"}</span>
        <h1>{isPending ? "Админ скоро подтвердит аккаунт" : "Прогнозы доступны только участникам"}</h1>
        <p>
          {isPending
            ? "Аккаунт создан, но раздел прогнозов откроется после ручного подтверждения админом клуба."
            : "Архив турниров можно смотреть свободно, а прогнозы закрыты, чтобы результаты оставались внутри сообщества."}
        </p>
        {!currentUser && (
          <div className="home-actions">
            <button type="button" onClick={onLogin}>Войти</button>
            <button type="button" onClick={onRegister}>Зарегистрироваться</button>
          </div>
        )}
      </div>
    </section>
  );
}

function AdminApprovalPanel({ users, onApproveUser }) {
  const pendingUsers = users.filter((user) => user.status === "pending");

  return (
    <section className="surface side-panel admin-approval-panel">
      <div className="section-title">
        <span>Админ</span>
        <h2>Заявки участников</h2>
      </div>

      {pendingUsers.length === 0 ? (
        <p>Новых заявок нет. Когда участники зарегистрируются, они появятся здесь.</p>
      ) : (
        <div className="approval-list">
          {pendingUsers.map((user) => (
            <article className="approval-row" key={user.id}>
              <span>{getInitials(user)}</span>
              <div>
                <strong>{getUserDisplayName(user)}</strong>
                <small>{user.lundaNick} · {user.email} · {user.phone}</small>
              </div>
              <button type="button" onClick={() => onApproveUser(user.id)}>Подтвердить</button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function makeTournamentFormState(scoringMethods, tournament = null) {
  return {
    club: "Padel Pro Club",
    conditions: "",
    date: "",
    format: "Americano",
    pointsToWin: "11",
    scoringMethodId: scoringMethods[0]?.id ?? "",
    time: "",
    title: "",
    ...(tournament ? {
      club: tournament.club ?? "Padel Pro Club",
      conditions: tournament.conditions ?? "",
      date: tournament.date ?? "",
      format: tournament.format ?? "Americano",
      pointsToWin: tournament.pointsToWin ? String(tournament.pointsToWin) : "11",
      scoringMethodId: tournament.scoringMethodId || tournament.scoringMethod?.id || scoringMethods[0]?.id || "",
      time: tournament.time ?? "",
      title: tournament.title ?? "",
    } : {}),
  };
}

function makeTournamentPlayers(tournament = null) {
  if (tournament?.roster?.length) {
    return tournament.roster.map((player) => ({
      id: player.id,
      name: player.name ?? "",
      rating: player.rating !== undefined ? String(player.rating) : "",
    }));
  }

  return [
    { name: "", rating: "" },
    { name: "", rating: "" },
    { name: "", rating: "" },
    { name: "", rating: "" },
  ];
}

function AdminTournamentForm({
  forecastTournaments,
  initialTournament = null,
  onSubmitTournament,
  scoringMethods,
  submitLabel = "Опубликовать турнир",
  submittingLabel = "Публикуем...",
  successMessage = "Турнир опубликован в прогнозах.",
}) {
  const [form, setForm] = useState(() => makeTournamentFormState(scoringMethods, initialTournament));
  const [players, setPlayers] = useState(() => makeTournamentPlayers(initialTournament));
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const selectedScoringMethod = scoringMethods.find((method) => method.id === form.scoringMethodId) ?? scoringMethods[0];

  useEffect(() => {
    setForm(makeTournamentFormState(scoringMethods, initialTournament));
    setPlayers(makeTournamentPlayers(initialTournament));
    setMessage("");
  }, [initialTournament?.id, scoringMethods]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage("");
  };

  const updatePlayer = (index, field, value) => {
    setPlayers((current) => current.map((player, playerIndex) => (
      playerIndex === index ? { ...player, [field]: value } : player
    )));
    setMessage("");
  };

  const addPlayer = () => {
    setPlayers((current) => [...current, { name: "", rating: "" }]);
  };

  const removePlayer = (index) => {
    setPlayers((current) => current.filter((_, playerIndex) => playerIndex !== index));
  };

  const submitTournament = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    const roster = players
      .map((player) => ({ id: player.id, name: player.name.trim(), rating: Number(player.rating) }))
      .filter((player) => player.name && Number.isFinite(player.rating));

    const result = await onSubmitTournament({ ...form, roster });
    setSubmitting(false);

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    if (!initialTournament) {
      setForm(makeTournamentFormState(scoringMethods));
      setPlayers(makeTournamentPlayers());
    }
    setMessage(successMessage);
  };

  return (
    <section className="surface admin-tournament-panel">
      <div className="section-title">
        <span>Прогнозы</span>
        <h2>Новый турнир для участников</h2>
      </div>

      <form className="admin-tournament-form" onSubmit={submitTournament}>
        <div className="admin-form-grid">
          <label>
            <span>Название</span>
            <input required value={form.title} onChange={(event) => updateForm("title", event.target.value)} placeholder="Например, Friday Mexicano" />
          </label>
          <label>
            <span>Формат</span>
            <select value={form.format} onChange={(event) => updateForm("format", event.target.value)}>
              <option>Americano</option>
              <option>Mexicano</option>
              <option>Round Robin</option>
              <option>King of the Court</option>
            </select>
          </label>
          <label>
            <span>Дата</span>
            <input required type="date" value={form.date} onChange={(event) => updateForm("date", event.target.value)} />
          </label>
          <label>
            <span>Время</span>
            <input required type="time" value={form.time} onChange={(event) => updateForm("time", event.target.value)} />
          </label>
          <label>
            <span>Клуб</span>
            <select value={form.club} onChange={(event) => updateForm("club", event.target.value)}>
              <option>Padel Pro Club</option>
              <option>Падел-клуб "Небо"</option>
            </select>
          </label>
          {form.format === "Americano" && (
            <label>
              <span>Розыгрыш до</span>
              <input required inputMode="numeric" min="1" type="number" value={form.pointsToWin} onChange={(event) => updateForm("pointsToWin", event.target.value)} />
            </label>
          )}
        </div>

        <label>
          <span>Методика подсчета</span>
          <select required value={form.scoringMethodId} onChange={(event) => updateForm("scoringMethodId", event.target.value)}>
            {scoringMethods.map((method) => (
              <option key={method.id} value={method.id}>{method.name}</option>
            ))}
          </select>
          <small className="admin-method-preview">{describeScoringMethod(selectedScoringMethod)}</small>
        </label>

        <label>
          <span>Условия турнира</span>
          <textarea
            required={!initialTournament}
            value={form.conditions}
            onChange={(event) => updateForm("conditions", event.target.value)}
            placeholder="Коротко: формат, пары/смены партнеров, как считается итог, ограничения по заменам."
          />
        </label>

        <div className="admin-player-editor">
          <div className="admin-player-head">
            <div>
              <span>Состав и рейтинги</span>
              <strong>Минимум 2 игрока</strong>
            </div>
            <button type="button" onClick={addPlayer}>Добавить игрока</button>
          </div>

          <div className="admin-player-list">
            {players.map((player, index) => (
              <div className="admin-player-row" key={`player-${index}`}>
                <b>{index + 1}</b>
                <input value={player.name} onChange={(event) => updatePlayer(index, "name", event.target.value)} placeholder="Имя игрока" />
                <input inputMode="decimal" value={player.rating} onChange={(event) => updatePlayer(index, "rating", event.target.value)} placeholder="Рейтинг" />
                <button disabled={players.length <= 2} type="button" onClick={() => removePlayer(index)}>Убрать</button>
              </div>
            ))}
          </div>
        </div>

        {message && <strong className={message.includes("опубликован") || message.includes("обновлен") ? "admin-form-success" : "prediction-error"}>{message}</strong>}

        <footer>
          <span>{forecastTournaments.length} турниров в реестре прогнозов</span>
          <button disabled={submitting} type="submit">{submitting ? submittingLabel : submitLabel}</button>
        </footer>
      </form>
    </section>
  );
}

function AdminMembersPanel({ users }) {
  return (
    <section className="surface admin-members-panel">
      <div className="section-title">
        <span>Клуб</span>
        <h2>Все зарегистрированные участники</h2>
      </div>

      {users.length === 0 ? (
        <p>Пока нет зарегистрированных аккаунтов.</p>
      ) : (
        <div className="member-list">
          {users.map((user) => (
            <article className="member-row" key={user.id}>
              <span>{getInitials(user)}</span>
              <div>
                <strong>{getUserDisplayName(user)}</strong>
                <small>{user.lundaNick} · {user.email} · {user.phone}</small>
              </div>
              <b className={`member-status ${user.status}`}>{user.status === "active" ? "Активен" : "Заявка"}</b>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function AdminScoringMethodsPanel({ onCreateScoringMethod, scoringMethods }) {
  const [form, setForm] = useState({
    description: "",
    exactPlace: "5",
    formats: "Americano, Mexicano, Escalera",
    lastPlaceBonus: "5",
    name: "",
    onePositionError: "3",
    top3AnyOrderBonus: "8",
    top3ExactBonus: "15",
    twoPositionError: "1",
  });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage("");
  };

  const submitMethod = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const result = await onCreateScoringMethod(form);
    setSubmitting(false);

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    setForm({
      description: "",
      exactPlace: "5",
      formats: "Americano, Mexicano, Escalera",
      lastPlaceBonus: "5",
      name: "",
      onePositionError: "3",
      top3AnyOrderBonus: "8",
      top3ExactBonus: "15",
      twoPositionError: "1",
    });
    setMessage("Методика сохранена.");
  };

  return (
    <section className="surface admin-scoring-panel">
      <div className="section-title">
        <span>Настройки прогнозов</span>
        <h2>Методики подсчета</h2>
      </div>

      <div className="scoring-method-list">
        {scoringMethods.map((method) => (
          <article className="scoring-method-card" key={method.id}>
            <span>{method.formats}</span>
            <strong>{method.name}</strong>
            <p>{method.description || describeScoringMethod(method)}</p>
            <div>
              <b>Точное: {method.exactPlace}</b>
              <b>±1: {method.onePositionError}</b>
              <b>±2: {method.twoPositionError}</b>
              <b>Топ-3 точно: +{method.top3ExactBonus}</b>
              <b>Топ-3 любой: +{method.top3AnyOrderBonus}</b>
              <b>Последний: +{method.lastPlaceBonus}</b>
            </div>
          </article>
        ))}
      </div>

      <form className="admin-tournament-form scoring-method-form" onSubmit={submitMethod}>
        <div className="admin-form-grid">
          <label>
            <span>Название</span>
            <input required value={form.name} onChange={(event) => updateForm("name", event.target.value)} placeholder="Например, PRO playoffs" />
          </label>
          <label>
            <span>Типы турниров</span>
            <input required value={form.formats} onChange={(event) => updateForm("formats", event.target.value)} />
          </label>
          <label>
            <span>Точное место</span>
            <input required inputMode="numeric" min="0" type="number" value={form.exactPlace} onChange={(event) => updateForm("exactPlace", event.target.value)} />
          </label>
          <label>
            <span>Ошибка на 1</span>
            <input required inputMode="numeric" min="0" type="number" value={form.onePositionError} onChange={(event) => updateForm("onePositionError", event.target.value)} />
          </label>
          <label>
            <span>Ошибка на 2</span>
            <input required inputMode="numeric" min="0" type="number" value={form.twoPositionError} onChange={(event) => updateForm("twoPositionError", event.target.value)} />
          </label>
          <label>
            <span>Топ-3 точный</span>
            <input required inputMode="numeric" min="0" type="number" value={form.top3ExactBonus} onChange={(event) => updateForm("top3ExactBonus", event.target.value)} />
          </label>
          <label>
            <span>Топ-3 любой</span>
            <input required inputMode="numeric" min="0" type="number" value={form.top3AnyOrderBonus} onChange={(event) => updateForm("top3AnyOrderBonus", event.target.value)} />
          </label>
          <label>
            <span>Последнее место</span>
            <input required inputMode="numeric" min="0" type="number" value={form.lastPlaceBonus} onChange={(event) => updateForm("lastPlaceBonus", event.target.value)} />
          </label>
        </div>

        <label>
          <span>Описание</span>
          <textarea value={form.description} onChange={(event) => updateForm("description", event.target.value)} placeholder="Для каких турниров и почему такая логика." />
        </label>

        {message && <strong className={message.includes("сохранена") ? "admin-form-success" : "prediction-error"}>{message}</strong>}

        <footer>
          <span>{scoringMethods.length} методик сохранено</span>
          <button disabled={submitting} type="submit">{submitting ? "Сохраняем..." : "Сохранить методику"}</button>
        </footer>
      </form>
    </section>
  );
}

function AdminPredictionSettingsPanel({ onUpdateSettings, settings }) {
  const [form, setForm] = useState(() => ({
    predictionRegistryVisibility: settings.predictionRegistryVisibility ?? "admin",
  }));
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm({ predictionRegistryVisibility: settings.predictionRegistryVisibility ?? "admin" });
    setMessage("");
  }, [settings.predictionRegistryVisibility]);

  const submitSettings = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const result = await onUpdateSettings(form);
    setSubmitting(false);

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    setMessage("Настройки сохранены.");
  };

  return (
    <section className="surface admin-settings-panel">
      <div className="section-title">
        <span>CRM</span>
        <h2>Видимость реестра прогнозов</h2>
      </div>

      <form className="admin-tournament-form admin-settings-form" onSubmit={submitSettings}>
        <label>
          <span>Кто видит список прогнозов</span>
          <select
            value={form.predictionRegistryVisibility}
            onChange={(event) => {
              setForm({ predictionRegistryVisibility: event.target.value });
              setMessage("");
            }}
          >
            <option value="admin">Только админ</option>
            <option value="all">Все подтвержденные участники</option>
          </select>
        </label>
        <p>
          При открытом режиме участники видят только имена и статус прогноза. Почта остается видна только админу.
        </p>

        {message && <strong className={message.includes("сохранены") ? "admin-form-success" : "prediction-error"}>{message}</strong>}

        <footer>
          <span>{form.predictionRegistryVisibility === "all" ? "Список открыт участникам" : "Список закрыт для админа"}</span>
          <button disabled={submitting} type="submit">{submitting ? "Сохраняем..." : "Сохранить настройки"}</button>
        </footer>
      </form>
    </section>
  );
}

function AdminSectionShell({ children, eyebrow, onBack, title }) {
  return (
    <section className="admin-section-shell">
      <div className="admin-section-head">
        <button className="back-link" type="button" onClick={onBack}>К меню кабинета</button>
        <div>
          <span>{eyebrow}</span>
          <h2>{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function AdminCabinetScreen({ auth, forecastTournaments, onCreateScoringMethod, onCreateTournament, onOpenHome, onOpenPlaceholder, onOpenPredictions, onUpdateSettings, scoringMethods, settings }) {
  const [activeSection, setActiveSection] = useState(null);
  const pendingUsers = auth.users.filter((user) => user.status === "pending");
  const activeMembers = auth.users.filter((user) => user.status === "active");

  const renderActiveSection = () => {
    if (activeSection === "approvals") {
      return (
        <AdminSectionShell eyebrow="Акцепт заявок" onBack={() => setActiveSection(null)} title="Проверка новых регистраций">
          <AdminApprovalPanel users={auth.users} onApproveUser={auth.onApproveUser} />
        </AdminSectionShell>
      );
    }

    if (activeSection === "tournament") {
      return (
        <AdminSectionShell eyebrow="Прогнозы" onBack={() => setActiveSection(null)} title="Добавить турнир для прогнозов">
          <AdminTournamentForm
            forecastTournaments={forecastTournaments}
            onSubmitTournament={onCreateTournament}
            scoringMethods={scoringMethods}
          />
        </AdminSectionShell>
      );
    }

    if (activeSection === "scoring") {
      return (
        <AdminSectionShell eyebrow="Методики подсчета" onBack={() => setActiveSection(null)} title="Настройки очков для прогнозов">
          <AdminScoringMethodsPanel onCreateScoringMethod={onCreateScoringMethod} scoringMethods={scoringMethods} />
        </AdminSectionShell>
      );
    }

    if (activeSection === "members") {
      return (
        <AdminSectionShell eyebrow="Члены клуба" onBack={() => setActiveSection(null)} title="Все зарегистрированные участники">
          <AdminMembersPanel users={auth.users} />
        </AdminSectionShell>
      );
    }

    if (activeSection === "settings") {
      return (
        <AdminSectionShell eyebrow="Настройки CRM" onBack={() => setActiveSection(null)} title="Права видимости на сайте">
          <AdminPredictionSettingsPanel onUpdateSettings={onUpdateSettings} settings={settings} />
        </AdminSectionShell>
      );
    }

    return null;
  };

  return (
    <main className="admin-cabinet-shell">
      <MainNav
        active="admin"
        auth={auth}
        label="Admin"
        onOpenHome={onOpenHome}
        onOpenPlaceholder={onOpenPlaceholder}
        onOpenPredictions={onOpenPredictions}
        action={<AuthControls {...auth} />}
      />

      <section className="admin-cabinet-hero surface" id="top">
        <div>
          <span className="eyebrow">Личный кабинет админа</span>
          <h1>Управление клубом</h1>
          <p>
            Выбирай нужный раздел: принять новые регистрации, добавить турнир для
            прогнозов или посмотреть полный список членов клуба.
          </p>
        </div>
        <div className="admin-cabinet-stats">
          <div><strong>{pendingUsers.length}</strong><span>ожидают принятия</span></div>
          <div><strong>{activeMembers.length}</strong><span>принятых участников</span></div>
          <div><strong>{forecastTournaments.length}</strong><span>турниров для прогнозов</span></div>
        </div>
      </section>

      {activeSection ? renderActiveSection() : (
        <section className="admin-menu-grid">
          <button className="admin-menu-card surface" type="button" onClick={() => setActiveSection("approvals")}>
            <span>Акцепт заявок</span>
            <strong>{pendingUsers.length ? `${pendingUsers.length} ожидают проверки` : "Новых заявок нет"}</strong>
            <p>Открыть заявки, проверить данные участника и принять регистрацию.</p>
          </button>

          <button className="admin-menu-card surface" type="button" onClick={() => setActiveSection("tournament")}>
            <span>Прогнозы</span>
            <strong>Добавить турнир</strong>
            <p>Дата, формат, условия, состав игроков и рейтинги для нового прогноза.</p>
          </button>

          <button className="admin-menu-card surface" type="button" onClick={() => setActiveSection("scoring")}>
            <span>Методики</span>
            <strong>{scoringMethods.length} сохранено</strong>
            <p>Настрой правила начисления очков и выбирай их при создании турнира.</p>
          </button>

          <button className="admin-menu-card surface" type="button" onClick={() => setActiveSection("members")}>
            <span>Члены клуба</span>
            <strong>{activeMembers.length} активных из {auth.users.length}</strong>
            <p>Полный список зарегистрированных аккаунтов со статусами и контактами.</p>
          </button>

          <button className="admin-menu-card surface" type="button" onClick={() => setActiveSection("settings")}>
            <span>Настройки</span>
            <strong>{settings.predictionRegistryVisibility === "all" ? "Реестр открыт" : "Только админ"}</strong>
            <p>Выбрать, кто может раскрывать список участников, уже сделавших прогноз.</p>
          </button>
        </section>
      )}
    </main>
  );
}

function MainNav({ active = "home", auth = null, onOpenHome, onOpenPlaceholder, onOpenPredictions, label = "Club", action = null }) {
  const goHome = (event) => {
    event.preventDefault();
    onOpenHome?.();
  };

  const openPlaceholder = (sectionKey, sectionTitle) => {
    onOpenPlaceholder?.(sectionKey, sectionTitle);
  };

  return (
    <header className="topbar">
      <a className="brand" href="#top" aria-label="Padel Brazzers" onClick={goHome}>
        <span className="brand-mark">PB</span>
        <strong>Padel Brazzers</strong>
        <span>{label}</span>
      </a>
      <nav>
        <button className={active === "tournaments" || active === "home" ? "active" : ""} type="button" onClick={onOpenHome}>
          Турниры
        </button>
        <button className={active === "leaders" ? "active" : ""} type="button" onClick={() => openPlaceholder("leaders", "Лидеры")}>
          Лидеры
        </button>
        <button className={active === "predictions" ? "active" : ""} type="button" onClick={onOpenPredictions}>
          Прогнозы
        </button>
        <button className={active === "community" ? "active" : ""} type="button" onClick={() => openPlaceholder("community", "Сообщество")}>
          Сообщество
        </button>
      </nav>
      {action ?? (
        <div className="profile-chip home-chip">
          <span>PB</span>
          <b>PRO</b>
        </div>
      )}
    </header>
  );
}

function LockedPredictionsScreen({ auth, onOpenHome, onOpenPlaceholder, onOpenPredictions }) {
  return (
    <main className="predictions-shell">
      <MainNav
        active="predictions"
        auth={auth}
        label="Club"
        onOpenHome={onOpenHome}
        onOpenPlaceholder={onOpenPlaceholder}
        onOpenPredictions={onOpenPredictions}
        action={<AuthControls {...auth} />}
      />
      <PredictionAccessGate
        currentUser={auth.currentUser}
        onLogin={auth.onLogin}
        onRegister={auth.onRegister}
      />
    </main>
  );
}

function ForecastRegistryScreen({ auth, forecastTournaments, onOpenHome, onOpenPlaceholder, onOpenPredictions, onOpenTournament }) {
  return (
    <main className="predictions-shell">
      <MainNav
        active="predictions"
        auth={auth}
        label="Club"
        onOpenHome={onOpenHome}
        onOpenPlaceholder={onOpenPlaceholder}
        onOpenPredictions={onOpenPredictions}
        action={<AuthControls {...auth} />}
      />

      <section className="prediction-hero surface" id="top">
        <img src="/assets/hero-court.png" alt="Падел корт перед турниром" />
        <div className="prediction-hero-copy">
          <span className="eyebrow">Реестр прогнозов</span>
          <h1>Будущие турниры для прогнозов</h1>
          <p>
            Здесь будут турниры, которые опубликованы заранее и открыты для ставок
            на итоговые места. Нажатие на турнир открывает карточку с составом и
            расстановкой участников.
          </p>
        </div>
        <div className="prediction-hero-stats">
          <div><strong>{forecastTournaments.length}</strong><span>турниров в реестре</span></div>
          <div><strong>1</strong><span>балл за точное место</span></div>
          <div><strong>До старта</strong><span>прием прогнозов</span></div>
        </div>
      </section>

      <section className="home-layout forecast-registry-layout" id="registry">
        <section className="surface registry-card">
          <div className="registry-head">
            <div>
              <span>Реестр прогнозов</span>
              <h2>Турниры, которые еще впереди</h2>
            </div>
          </div>

          <div className="tournament-list">
            {forecastTournaments.length === 0 && (
              <div className="empty-registry">
                <span>Forecast</span>
                <strong>Турниров для прогнозов пока нет</strong>
                <p>Когда админ добавит турнир в кабинете, он появится здесь.</p>
              </div>
            )}
            {forecastTournaments.map((tournament) => (
              <button
                className="tournament-row featured"
                type="button"
                onClick={() => onOpenTournament(tournament.id)}
                key={tournament.id}
              >
                <img src={tournament.image} alt="" />
                <div className="tournament-copy">
                  <span>{formatVladivostokDate(tournament.date)} · {tournament.time} VLAT · {tournament.club}</span>
                  <strong>{tournament.title}</strong>
                  <p>{tournament.format} · {tournament.players}</p>
                </div>
                <div className="tournament-result">
                  <span>{tournament.status}</span>
                  <strong>Прогнозы</strong>
                  <small>Открыть</small>
                </div>
              </button>
            ))}
          </div>
        </section>

        <aside className="home-side">
          <section className="surface side-panel prediction-teaser-panel" id="community">
            <div className="section-title">
              <span>Как это работает</span>
              <h2>Сначала публикуем турнир, потом принимаем прогнозы</h2>
            </div>
            <p>
              После добавления турнира в управляющей части здесь появятся дата,
              формат, состав и статус приема прогнозов.
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}

function ForecastTournamentDetail({
  auth,
  forecastTournaments,
  onBack,
  onDeleteTournament,
  onLoadForecastPrediction,
  onLoadForecastPredictionSummary,
  onOpenHome,
  onOpenPlaceholder,
  onOpenPredictions,
  onSaveForecastPrediction,
  onUpdateTournament,
  scoringMethods,
  settings,
  tournament,
}) {
  const getPlayerKey = (player) => player.id ?? player.name;
  const sortedRoster = useMemo(
    () => [...tournament.roster].sort((a, b) => Number(b.rating) - Number(a.rating) || a.name.localeCompare(b.name)),
    [tournament.roster],
  );
  const [forecastSlots, setForecastSlots] = useState(() => Array.from({ length: 16 }, () => null));
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastSaving, setForecastSaving] = useState(false);
  const [forecastSaveMessage, setForecastSaveMessage] = useState("");
  const [forecastSaveTone, setForecastSaveTone] = useState("success");
  const [adminPredictionSummary, setAdminPredictionSummary] = useState(null);
  const [adminPredictionSummaryLoading, setAdminPredictionSummaryLoading] = useState(false);
  const [predictionRegistryOpen, setPredictionRegistryOpen] = useState(false);
  const [adminEditing, setAdminEditing] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");
  const [deleting, setDeleting] = useState(false);
  const currentForecastSlots = forecastSlots.filter((slot) => slot && !slot.invalid);
  const filledSlots = currentForecastSlots.length;
  const forecastPlayerIds = new Set(currentForecastSlots.map((slot) => String(getPlayerKey(slot))));
  const expectedPlayerIds = sortedRoster.slice(0, 16).map((player) => String(getPlayerKey(player)));
  const isForecastComplete = expectedPlayerIds.length > 0 && expectedPlayerIds.every((playerId) => forecastPlayerIds.has(playerId));
  const canManageTournament = auth.currentUser?.role === "admin" && auth.currentUser?.status === "active";
  const canViewPredictionRegistry = canManageTournament || settings.predictionRegistryVisibility === "all";
  const tournamentScoringMethod = getTournamentScoringMethod(tournament, scoringMethods);

  const selectedPlayer = sortedRoster.find((player) => getPlayerKey(player) === selectedPlayerId);

  const loadAdminPredictionSummary = async () => {
    if (!canViewPredictionRegistry) {
      setAdminPredictionSummary(null);
      return;
    }

    setAdminPredictionSummaryLoading(true);
    const result = await onLoadForecastPredictionSummary(tournament.id);
    setAdminPredictionSummaryLoading(false);
    if (result.ok) {
      setAdminPredictionSummary(result.summary);
    }
  };

  useEffect(() => {
    setForecastSlots(Array.from({ length: 16 }, () => null));
    setSelectedPlayerId(null);
    setForecastSaveMessage("");
    setForecastSaveTone("success");
    setAdminEditing(false);
    setAdminMessage("");
  }, [tournament.id, auth.currentUser?.id]);

  useEffect(() => {
    let ignore = false;

    const loadPrediction = async () => {
      if (!auth.currentUser?.id || !tournament.id) {
        return;
      }

      setForecastLoading(true);
      const result = await onLoadForecastPrediction(tournament.id);
      if (ignore) {
        return;
      }

      setForecastLoading(false);
      if (!result.ok) {
        setForecastSaveMessage(result.message);
        setForecastSaveTone("error");
        return;
      }

      setForecastSlots(buildForecastSlotsFromPrediction(result.prediction, sortedRoster));
      if (result.prediction?.needsReview) {
        setForecastSaveMessage("Состав турнира изменился. Красным отмечены игроки, которых уже нет в составе; поставь новых игроков из списка слева.");
        setForecastSaveTone("error");
        return;
      }

      setForecastSaveMessage(result.prediction ? `Загружен твой сохраненный прогноз от ${formatVladivostokInstant(result.prediction.updatedAt)} VLAT.` : "");
      setForecastSaveTone("success");
    };

    loadPrediction();

    return () => {
      ignore = true;
    };
  }, [auth.currentUser?.id, tournament.id, tournament.roster]);

  useEffect(() => {
    loadAdminPredictionSummary();
  }, [canViewPredictionRegistry, tournament.id, tournament.predictionCount, tournament.rosterChangeRevision]);

  useEffect(() => {
    if (!canViewPredictionRegistry) {
      setPredictionRegistryOpen(false);
    }
  }, [canViewPredictionRegistry]);

  const placePlayer = (slotIndex, playerId) => {
    const player = sortedRoster.find((item) => getPlayerKey(item) === playerId);
    if (!player) {
      return;
    }

    setForecastSlots((current) => {
      const next = current.map((slot) => (slot && getPlayerKey(slot) === playerId ? null : slot));
      next[slotIndex] = player;
      return next;
    });
    setSelectedPlayerId(null);
    setForecastSaveMessage("");
    setForecastSaveTone("success");
  };

  const clearSlot = (slotIndex) => {
    setForecastSlots((current) => current.map((slot, index) => (index === slotIndex ? null : slot)));
    setForecastSaveMessage("");
    setForecastSaveTone("success");
  };

  const handleSlotDrop = (event, slotIndex) => {
    event.preventDefault();
    const sourceSlotValue = event.dataTransfer.getData("application/x-padel-slot");
    const sourceSlotIndex = Number(sourceSlotValue);
    if (sourceSlotValue !== "" && Number.isInteger(sourceSlotIndex) && sourceSlotIndex >= 0 && sourceSlotIndex < forecastSlots.length) {
      if (sourceSlotIndex !== slotIndex) {
        setForecastSlots((current) => {
          const next = [...current];
          [next[sourceSlotIndex], next[slotIndex]] = [next[slotIndex], next[sourceSlotIndex]];
          return next;
        });
        setForecastSaveMessage("");
        setForecastSaveTone("success");
      }
      return;
    }

    const playerId = event.dataTransfer.getData("text/plain");
    placePlayer(slotIndex, playerId);
  };

  const saveForecast = async () => {
    if (!isForecastComplete) {
      return;
    }

    setForecastSaving(true);
    setForecastSaveMessage("");
    setForecastSaveTone("success");
    const placements = forecastSlots
      .map((slot, index) => (slot && !slot.invalid ? { place: index + 1, playerId: String(getPlayerKey(slot)) } : null))
      .filter(Boolean);
    const result = await onSaveForecastPrediction(tournament.id, { placements });
    setForecastSaving(false);

    if (!result.ok) {
      setForecastSaveMessage(result.message);
      setForecastSaveTone("error");
      return;
    }

    setForecastSaveMessage(`Прогноз сохранен на сервере: ${formatVladivostokInstant(result.prediction.updatedAt)} VLAT.`);
    setForecastSaveTone("success");
    loadAdminPredictionSummary();
  };

  const predictionCount = Number(tournament.predictionCount ?? 0);
  const needsReviewCount = adminPredictionSummary?.needsReviewCount ?? 0;

  const submitTournamentUpdate = async (payload) => {
    const result = await onUpdateTournament(tournament.id, payload);
    if (result.ok) {
      setAdminEditing(false);
    }

    return result;
  };

  const deleteTournament = async () => {
    const confirmed = window.confirm("Удалить этот турнир из прогнозов?");
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    const result = await onDeleteTournament(tournament.id);
    setDeleting(false);
    if (!result.ok) {
      setAdminMessage(result.message);
    }
  };

  return (
    <main className="predictions-shell">
      <MainNav
        active="predictions"
        auth={auth}
        label="Club"
        onOpenHome={onOpenHome}
        onOpenPlaceholder={onOpenPlaceholder}
        onOpenPredictions={onOpenPredictions}
        action={(
          <div className="prediction-top-actions">
            <button className="back-link" type="button" onClick={onBack}>Все прогнозы</button>
            <AuthControls {...auth} />
          </div>
        )}
      />

      <section className="prediction-detail-grid" id="top">
        <section className="surface hero-card prediction-detail-hero">
          <img src={tournament.image} alt="" />
          <div className="hero-content">
            <span className="eyebrow">{tournament.status}</span>
            <h1>{tournament.title}</h1>
            <div className="meta-row">
              <span>{formatVladivostokDate(tournament.date)}</span>
              <span>{tournament.time} VLAT</span>
              <span>{tournament.club}</span>
            </div>
            <p>
              {tournament.conditions || "Карточка будущего турнира для прогнозов. Участник сможет расставить игроков по местам до закрытия приема."}
            </p>
            {tournament.format === "Americano" && tournament.pointsToWin && (
              <p className="prediction-format-note">Americano до {tournament.pointsToWin} очков в розыгрыше.</p>
            )}
          </div>
          <div className="metric-strip">
            <div><strong>{tournament.roster.length || "—"}</strong><span>участников</span></div>
            <div><strong>{tournamentScoringMethod?.exactPlace ?? "—"}</strong><span>за точное место</span></div>
            <div><strong>До старта</strong><span>редактирование</span></div>
            <div><strong>{tournament.format}</strong><span>формат</span></div>
          </div>
        </section>

        <section className="surface prediction-tournament-card">
          <div className="section-title">
            <span>Условия прогноза</span>
            <h2>{tournamentScoringMethod?.name ?? tournament.scoring ?? "Методика прогноза"}</h2>
          </div>
          <p>
            {tournament.predictionCloseAt
              ? `Прием прогнозов открыт до ${formatVladivostokDateTime(tournament.predictionCloseAt)}.`
              : "Прогноз можно будет сохранить и менять до закрытия приема."}
          </p>
          {tournamentScoringMethod && (
            <div className="prediction-scoring-details">
              <span>{tournamentScoringMethod.formats}</span>
              <p>{tournamentScoringMethod.description || "Методика подсчета очков для этого турнира."}</p>
              <div>
                {getScoringMethodDetails(tournamentScoringMethod).map(([label, value]) => (
                  <b key={label}>
                    <small>{label}</small>
                    {value}
                  </b>
                ))}
              </div>
            </div>
          )}
          {canManageTournament && (
            <div className="prediction-admin-actions">
              <button type="button" onClick={() => { setAdminEditing((value) => !value); setAdminMessage(""); }}>
                {adminEditing ? "Закрыть редактор" : "Редактировать"}
              </button>
              <button className="danger" disabled={deleting} type="button" onClick={deleteTournament}>
                {deleting ? "Удаляем..." : "Удалить"}
              </button>
            </div>
          )}
          {adminMessage && <strong className="prediction-error">{adminMessage}</strong>}
          <div className={`prediction-count-card ${canViewPredictionRegistry ? "can-open" : ""}`}>
            <button
              className="prediction-count-trigger"
              disabled={!canViewPredictionRegistry}
              type="button"
              onClick={() => setPredictionRegistryOpen((value) => !value)}
            >
              <span>Прогнозы участников</span>
              <strong>{predictionCount}</strong>
              <p>столько игроков уже сделали прогноз на этот турнир</p>
              {canManageTournament && (
                <b className={needsReviewCount > 0 ? "has-review" : ""}>{needsReviewCount} требуют корректировки</b>
              )}
              {canViewPredictionRegistry && (
                <small>{predictionRegistryOpen ? "Скрыть реестр" : "Показать реестр"}</small>
              )}
            </button>
            {canViewPredictionRegistry && predictionRegistryOpen && (
              <div className="admin-prediction-summary">
                {adminPredictionSummaryLoading ? (
                  <small>Загружаем список...</small>
                ) : adminPredictionSummary?.predictions?.length ? (
                  adminPredictionSummary.predictions.map((prediction) => (
                    <article className={prediction.needsReview ? "needs-review" : ""} key={prediction.userId}>
                      <div>
                        <strong>{prediction.name}</strong>
                        <small>{prediction.lundaNick || prediction.email || "Участник клуба"}</small>
                      </div>
                      <span>{prediction.needsReview ? "Корректировка" : "Готово"}</span>
                    </article>
                  ))
                ) : (
                  <small>Пока никто не сохранил прогноз.</small>
                )}
              </div>
            )}
          </div>
        </section>
      </section>

      {canManageTournament && adminEditing && (
        <section className="forecast-edit-panel" id="edit-tournament">
          <AdminTournamentForm
            forecastTournaments={forecastTournaments}
            initialTournament={tournament}
            onSubmitTournament={submitTournamentUpdate}
            scoringMethods={scoringMethods}
            submitLabel="Сохранить изменения"
            submittingLabel="Сохраняем..."
            successMessage="Турнир обновлен."
          />
        </section>
      )}

      <section className="prediction-workspace">
        <section className="surface prediction-roster-card" id="roster">
          <div className="section-title">
            <span>Состав турнира</span>
            <h2>{tournament.roster.length ? `${tournament.roster.length} игроков по рейтингу` : "Игроки появятся из управляющей части"}</h2>
          </div>
          {tournament.roster.length > 0 && (
            <div className="prediction-placement-hint">
              Выбери игрока и перетащи в правую часть.
            </div>
          )}
          {tournament.roster.length === 0 ? (
            <div className="prediction-empty-list">
              <strong>Состав пока не опубликован</strong>
              <p>Когда организатор добавит участников, здесь появятся плашки игроков.</p>
            </div>
          ) : (
            <div className="prediction-roster-grid">
              {sortedRoster.map((player, index) => {
                const playerId = getPlayerKey(player);
                const isSelected = selectedPlayerId === playerId;
                const isPlaced = forecastSlots.some((slot) => slot && !slot.invalid && getPlayerKey(slot) === playerId);

                return (
                <button
                  className={`prediction-roster-player ${isSelected ? "selected" : ""} ${isPlaced ? "placed" : ""}`}
                  draggable
                  key={playerId}
                  type="button"
                  onClick={() => setSelectedPlayerId(isSelected ? null : playerId)}
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", playerId);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                >
                  <span>{index + 1}</span>
                  <strong>{player.name}</strong>
                  <b className="prediction-rating">{Number(player.rating).toFixed(2)}</b>
                </button>
              );
              })}
            </div>
          )}
        </section>

        <section className="surface prediction-ranking-card" id="ranking">
          <div className="prediction-card-head">
            <div className="section-title">
              <span>Мой прогноз</span>
              <h2>16 мест турнира</h2>
            </div>
            <button disabled={!isForecastComplete || forecastLoading || forecastSaving} type="button" onClick={saveForecast}>
              {forecastSaving ? "Сохраняем..." : "Сохранить прогноз"}
            </button>
          </div>
          {forecastSaveMessage && <strong className={`prediction-save-message ${forecastSaveTone}`}>{forecastSaveMessage}</strong>}
          {tournament.roster.length === 0 ? (
            <div className="prediction-empty-list tall">
              <strong>Расстановка откроется после публикации состава</strong>
              <p>Здесь будет 16 мест турнира для прогноза.</p>
            </div>
          ) : (
            <>
              <div className="prediction-placement-hint">
                {selectedPlayer
                  ? `Выбран: ${selectedPlayer.name}. Нажми на место справа.`
                  : forecastLoading
                    ? "Загружаем твой сохраненный прогноз..."
                    : `Расставлено ${filledSlots} из ${expectedPlayerIds.length}. Расставь всех игроков согласно твоему прогнозу.`}
              </div>
              <div className="prediction-slot-grid">
                {forecastSlots.map((slot, index) => (
                  <button
                    className={`prediction-slot ${slot ? "filled" : ""} ${slot?.invalid ? "invalid" : ""}`}
                    draggable={Boolean(slot && !slot.invalid)}
                    key={`slot-${index}`}
                    type="button"
                    onClick={() => {
                      if (selectedPlayerId) {
                        placePlayer(index, selectedPlayerId);
                        return;
                      }

                      if (slot) {
                        clearSlot(index);
                      }
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDragStart={(event) => {
                      if (!slot || slot.invalid) {
                        return;
                      }

                      event.dataTransfer.setData("text/plain", String(getPlayerKey(slot)));
                      event.dataTransfer.setData("application/x-padel-slot", String(index));
                      event.dataTransfer.effectAllowed = "move";
                    }}
                    onDrop={(event) => handleSlotDrop(event, index)}
                  >
                    <span>{index + 1}</span>
                    {slot ? (
                      <div>
                        <strong>{slot.name}</strong>
                        {slot.invalid ? <b>Выбыл из состава</b> : <b>{Number(slot.rating).toFixed(2)}</b>}
                      </div>
                    ) : (
                      <em>Место свободно</em>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  );
}

function HomeScreen({ auth, onOpenHome, onOpenPlaceholder, onOpenPredictions, onOpenTournament }) {
  const tournaments = tournamentRegistry;

  return (
    <main className="home-shell">
      <MainNav
        active="tournaments"
        auth={auth}
        label="Club"
        onOpenHome={onOpenHome}
        onOpenPlaceholder={onOpenPlaceholder}
        onOpenPredictions={onOpenPredictions}
        action={<AuthControls {...auth} />}
      />

      <section className="home-hero surface" id="top">
        <img src="/assets/hero-court.png" alt="Падел корт Padel Brazzers" />
        <div className="home-hero-copy">
          <span className="eyebrow">Vladivostok padel community</span>
          <h1>Добро пожаловать в Padel Brazzers</h1>
          <p>
            Архив турниров, таблицы после каждого раунда, результаты всех кортов и
            аналитика по главным матчам. Все турниры идут единым реестром: новые
            даты сверху.
          </p>
          <div className="home-actions">
            <a href="#registry">Смотреть турниры</a>
            <button type="button" onClick={onOpenPredictions}>Сделать прогноз</button>
          </div>
        </div>
        <div className="home-hero-stats" aria-label="Статистика сообщества">
          <div><strong>2</strong><span>боевых турнира в архиве</span></div>
          <div><strong>24</strong><span>игрока в турнирах</span></div>
          <div><strong>66</strong><span>матчей разобрано</span></div>
        </div>
      </section>

      <section className="home-layout" id="registry">
        <section className="surface registry-card">
          <div className="registry-head">
            <div>
              <span>Реестр турниров</span>
              <h2>Прошедшие турниры по дате</h2>
            </div>
          </div>

          <div className="tournament-list">
            {tournaments.length === 0 && (
              <div className="empty-registry">
                <span>Архив</span>
                <strong>Турниров пока нет</strong>
                <p>Здесь появятся боевые турниры, когда мы загрузим реальные данные.</p>
              </div>
            )}
            {tournaments.map((tournament) => (
              <button
                className={`tournament-row ${tournament.featured ? "featured" : ""}`}
                type="button"
                onClick={() => onOpenTournament(tournament.id)}
                key={tournament.id}
              >
                <img src={tournament.image} alt="" />
                <div className="tournament-copy">
                  <span>{tournament.date} · {tournament.club}</span>
                  <strong>{tournament.title}</strong>
                  <p>{tournament.format} · {tournament.teams} · {tournament.rounds} · {tournament.matches}</p>
                </div>
                <div className="tournament-result">
                  <span>{tournament.status}</span>
                  <strong>{tournament.winner}</strong>
                  <small>Открыть</small>
                </div>
              </button>
            ))}
          </div>
        </section>

        <aside className="home-side">
          <section className="surface side-panel" id="leaders">
            <div className="section-title">
              <span>Лидеры сообщества</span>
              <h2>Кто сейчас задает темп</h2>
            </div>
            <LeaderCard
              eyebrow="За все время"
              image="/assets/forehand.png"
              meta="152 матча · 79% побед"
              metric={{ label: "Рейтинг", value: "3.13" }}
              name="Редько Илья"
            />
            <LeaderCard
              eyebrow="За месяц"
              image="/assets/handshake.png"
              meta="24 матча · 87% побед"
              metric={{ label: "Рост", value: "+0.234" }}
              name="Ткачев Тимур"
            />
          </section>

          <section className="surface side-panel prediction-teaser-panel" id="community">
            <div className="section-title">
              <span>Прогнозы</span>
              <h2>Соберите свой топ до старта</h2>
            </div>
            <p>
              Участник входит в кабинет, ранжирует состав будущего турнира и после
              финала видит, сколько точных мест угадал.
            </p>
            <button type="button" onClick={onOpenPredictions}>Открыть прогнозы</button>
          </section>
        </aside>
      </section>
    </main>
  );
}

function AmericanoDetail({ auth, onBack, onOpenPlaceholder, onOpenPredictions }) {
  const [descriptionOpen, setDescriptionOpen] = useState(true);

  return (
    <main>
      <MainNav
        active="tournaments"
        auth={auth}
        label="PRO"
        onOpenHome={onBack}
        onOpenPlaceholder={onOpenPlaceholder}
        onOpenPredictions={onOpenPredictions}
        action={(
          <div className="prediction-top-actions">
            <button className="back-link" type="button" onClick={onBack}>Все турниры</button>
            <AuthControls {...auth} />
          </div>
        )}
      />

      <section className="page-grid americano-page-grid" id="top">
        <section className="surface hero-card americano-hero-card">
          <img src="/assets/handshake.png" alt="Игроки после матча Americano" />
          <div className="hero-content americano-hero-content">
            <span className="eyebrow">PRO category · личный зачет</span>
            <h1>AMERICANO BRAZZERS PRO</h1>
            <div className="meta-row">
              <span>17 июня</span>
              <span>20:00–22:00</span>
              <span>Padel Pro Club</span>
            </div>
            <p>
              12 игроков, 11 раундов и 33 матча. Каждый менял партнера каждый раунд,
              а итог решил личный баланс побед и качество набранных очков.
            </p>
            <button type="button" onClick={() => setDescriptionOpen(true)}>
              Полное описание
              <span>→</span>
            </button>
          </div>
          <div className="metric-strip">
            <div><strong>12</strong><span>игроков</span></div>
            <div><strong>11</strong><span>раундов</span></div>
            <div><strong>33</strong><span>матча</span></div>
            <div><strong>Americano</strong><span>формат</span></div>
          </div>
        </section>

        <AmericanoStandingsTable />
      </section>

      <section className="leaders-row americano-highlights">
        <LeaderCard
          eyebrow="Победитель турнира"
          image="/assets/trophy.png"
          meta="8–3 · 120–89 · лучшая разница"
          metric={{ label: "+/-", value: "+31" }}
          name="Kh Ivan"
        />
        <LeaderCard
          eyebrow="Главный оверперформер"
          image="/assets/forehand.png"
          meta="6–5 · +7 · самый большой рост"
          metric={{ label: "Рейтинг", value: "+0.129" }}
          name="Бессонов Егор"
        />
      </section>

      <section className="lower-grid americano-lower-grid">
        <AmericanoRoundPanel />
        <section className="surface stories-card" id="stories">
          <div className="section-title">
            <span>Главные сюжеты Americano</span>
            <h2>Что решило турнир</h2>
          </div>
          {americanoStories.map((card) => (
            <article className="story-row" key={card.title}>
              <img src={card.image} alt="" />
              <div>
                <span>{card.label}</span>
                <strong>{card.title}</strong>
                <p>{card.copy}</p>
              </div>
              <b>›</b>
            </article>
          ))}
        </section>
      </section>

      {descriptionOpen && <AmericanoDescriptionPanel onClose={() => setDescriptionOpen(false)} />}
    </main>
  );
}

function MexicanoDetail({ auth, onBack, onOpenPlaceholder, onOpenPredictions }) {
  const [descriptionOpen, setDescriptionOpen] = useState(true);

  return (
    <main>
      <MainNav
        active="tournaments"
        auth={auth}
        label="LITE"
        onOpenHome={onBack}
        onOpenPlaceholder={onOpenPlaceholder}
        onOpenPredictions={onOpenPredictions}
        action={(
          <div className="prediction-top-actions">
            <button className="back-link" type="button" onClick={onBack}>Все турниры</button>
            <AuthControls {...auth} />
          </div>
        )}
      />

      <section className="page-grid americano-page-grid" id="top">
        <section className="surface hero-card americano-hero-card">
          <img src="/assets/trophy.png" alt="Кубок турнира Mexicano" />
          <div className="hero-content americano-hero-content">
            <span className="eyebrow">LITE category · победитель по дельте</span>
            <h1>MEXICANO BRAZZERS LITE</h1>
            <div className="meta-row">
              <span>21 июня</span>
              <span>12:00–14:00</span>
              <span>Padel Pro Club</span>
            </div>
            <p>
              12 игроков, 11 раундов и 33 матча. Еженедельный дружеский LITE-турнир,
              где главный показатель — дельта очков после всех смен партнеров.
            </p>
            <button type="button" onClick={() => setDescriptionOpen(true)}>
              Полное описание
              <span>→</span>
            </button>
          </div>
          <div className="metric-strip">
            <div><strong>12</strong><span>игроков</span></div>
            <div><strong>11</strong><span>раундов</span></div>
            <div><strong>33</strong><span>матча</span></div>
            <div><strong>Mexicano</strong><span>формат</span></div>
          </div>
        </section>

        <MexicanoStandingsTable />
      </section>

      <section className="leaders-row americano-highlights">
        <LeaderCard
          eyebrow="Победитель турнира"
          image="/assets/trophy.png"
          meta="9–2 · 105–82 · лучшая дельта"
          metric={{ label: "+/-", value: "+23" }}
          name="Искалдович Константин"
        />
        <LeaderCard
          eyebrow="Темная лошадка"
          image="/assets/forehand.png"
          meta="Сыграл за победителя Костю"
          metric={{ label: "Роль", value: "важно" }}
          name="Эдуард Шевченко"
        />
      </section>

      <section className="lower-grid americano-lower-grid">
        <MexicanoRoundPanel />
        <section className="surface stories-card" id="stories">
          <div className="section-title">
            <span>Важное турнира</span>
            <h2>Что нужно отметить после Mexicano</h2>
          </div>
          {mexicanoStories.map((card) => (
            <article className="story-row" key={card.title}>
              <img src={card.image} alt="" />
              <div>
                <span>{card.label}</span>
                <strong>{card.title}</strong>
                <p>{card.copy}</p>
              </div>
              <b>›</b>
            </article>
          ))}
        </section>
      </section>

      {descriptionOpen && <MexicanoDescriptionPanel onClose={() => setDescriptionOpen(false)} />}
    </main>
  );
}

function TournamentDetail({ auth, onBack, onOpenPlaceholder, onOpenPredictions }) {
  const [descriptionOpen, setDescriptionOpen] = useState(true);

  return (
    <main>
      <MainNav
        active="tournaments"
        auth={auth}
        label="PRO"
        onOpenHome={onBack}
        onOpenPlaceholder={onOpenPlaceholder}
        onOpenPredictions={onOpenPredictions}
        action={(
          <div className="prediction-top-actions">
            <button className="back-link" type="button" onClick={onBack}>Все турниры</button>
            <AuthControls {...auth} />
          </div>
        )}
      />

      <section className="page-grid" id="top">
        <section className="surface hero-card">
          <img src="/assets/hero-court.png" alt="Матч турнира на падел корте" />
          <div className="hero-content">
            <span className="eyebrow">PRO category</span>
            <h1>THE BEST MIDDLE (PM)</h1>
            <div className="meta-row">
              <span>13 июня</span>
              <span>15:00–17:00</span>
              <span>Padel Pro Club</span>
            </div>
            <p>
              Round Robin на 8 пар: каждый сыграл с каждым, а первое, второе и
              третье места решились через один-два ключевых мяча.
            </p>
            <button type="button" onClick={() => setDescriptionOpen(true)}>
              Полное описание
              <span>→</span>
            </button>
          </div>
          <div className="metric-strip">
            <div><strong>8</strong><span>пар</span></div>
            <div><strong>7</strong><span>раундов</span></div>
            <div><strong>28</strong><span>матчей</span></div>
            <div><strong>Round Robin</strong><span>формат</span></div>
          </div>
        </section>

        <StandingsTable />
      </section>

      <section className="leaders-row">
        <LeaderCard
          eyebrow="Лучший игрок за все время"
          image="/assets/forehand.png"
          meta="152 матча · 79% побед"
          metric={{ label: "Рейтинг", value: "3.13" }}
          name="Редько Илья"
        />
        <LeaderCard
          eyebrow="Лучший за месяц"
          image="/assets/handshake.png"
          meta="24 матча · 87% побед"
          metric={{ label: "Рост за месяц", value: "+0.234" }}
          name="Ткачев Тимур"
        />
      </section>

      <section className="lower-grid">
        <RoundPanel />
        <section className="surface stories-card" id="stories">
          <div className="section-title">
            <span>Главные сюжеты турнира</span>
            <h2>Что стоит прочитать после игр</h2>
          </div>
          {storyCards.map((card) => (
            <article className="story-row" key={card.title}>
              <img src={card.image} alt="" />
              <div>
                <span>{card.label}</span>
                <strong>{card.title}</strong>
                <p>{card.copy}</p>
              </div>
              <b>›</b>
            </article>
          ))}
        </section>
      </section>

      {descriptionOpen && <DescriptionPanel onClose={() => setDescriptionOpen(false)} />}
    </main>
  );
}

function PlaceholderScreen({ active, auth, onOpenHome, onOpenPlaceholder, onOpenPredictions, title }) {
  return (
    <main className="predictions-shell">
      <MainNav
        active={active}
        auth={auth}
        label="Club"
        onOpenHome={onOpenHome}
        onOpenPlaceholder={onOpenPlaceholder}
        onOpenPredictions={onOpenPredictions}
        action={<AuthControls {...auth} />}
      />

      <section className="surface placeholder-section" id="top">
        <span className="eyebrow">Padel Brazzers</span>
        <h1>Раздел «{title}» еще не создан</h1>
        <p>
          Меню уже кликабельное на всех страницах. Когда появится полноценный
          раздел, откроем здесь его содержимое.
        </p>
        <div>
          <button className="back-link" type="button" onClick={onOpenHome}>К турнирам</button>
          <button type="button" onClick={onOpenPredictions}>Прогнозы</button>
        </div>
      </section>
    </main>
  );
}

export function App() {
  const [screen, setScreen] = useState({ name: "home" });
  const [authState, setAuthState] = useState(emptyAuthState);
  const [authMode, setAuthMode] = useState(null);
  const [forecastTournaments, setForecastTournaments] = useState([]);
  const [scoringMethods, setScoringMethods] = useState(fallbackScoringMethods);
  const [settings, setSettings] = useState(defaultSettings);
  const currentUser = authState.currentUser;
  const canOpenPredictions = currentUser?.status === "active";
  const canOpenAdmin = currentUser?.role === "admin" && currentUser?.status === "active";

  useEffect(() => {
    const loadServerAuthState = async () => {
      try {
        const [payload, forecastPayload, scoringPayload, settingsPayload] = await Promise.all([
          apiRequest("/api/auth/state"),
          apiRequest("/api/forecast-tournaments"),
          apiRequest("/api/scoring-methods"),
          apiRequest("/api/settings"),
        ]);
        setAuthState({
          currentUser: payload.user ?? null,
          hasUsers: payload.hasUsers,
          loading: false,
          notifications: payload.notifications ?? [],
          users: payload.users ?? [],
        });
        setForecastTournaments(forecastPayload.tournaments ?? []);
        setScoringMethods(scoringPayload.methods?.length ? scoringPayload.methods : fallbackScoringMethods);
        setSettings(settingsPayload.settings ?? defaultSettings);
      } catch {
        storeAuthToken("");
        setAuthState({ ...emptyAuthState, loading: false });
        setForecastTournaments(fallbackForecastTournaments);
        setScoringMethods(fallbackScoringMethods);
        setSettings(defaultSettings);
      }
    };

    loadServerAuthState();
  }, []);

  const applyAuthPayload = (payload) => {
    if (payload.token !== undefined) {
      storeAuthToken(payload.token);
    }

    setAuthState({
      currentUser: payload.user ?? null,
      hasUsers: payload.hasUsers ?? true,
      loading: false,
      notifications: payload.notifications ?? [],
      users: payload.users ?? [],
    });
    if (payload.settings) {
      setSettings(payload.settings);
    }
  };

  const refreshAuthState = async () => {
    const payload = await apiRequest("/api/auth/state");
    applyAuthPayload(payload);
  };

  const createForecastTournament = async (payload) => {
    try {
      const result = await apiRequest("/api/admin/forecast-tournaments", {
        body: JSON.stringify(payload),
        method: "POST",
      });
      setForecastTournaments(result.tournaments ?? []);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  const updateForecastTournament = async (tournamentId, payload) => {
    try {
      const result = await apiRequest(`/api/admin/forecast-tournaments/${tournamentId}`, {
        body: JSON.stringify(payload),
        method: "PUT",
      });
      setForecastTournaments(result.tournaments ?? []);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  const deleteForecastTournament = async (tournamentId) => {
    try {
      const result = await apiRequest(`/api/admin/forecast-tournaments/${tournamentId}`, {
        method: "DELETE",
      });
      setForecastTournaments(result.tournaments ?? []);
      setScreen({ name: "predictions" });
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  const loadForecastPrediction = async (tournamentId) => {
    try {
      const result = await apiRequest(`/api/forecast-tournaments/${tournamentId}/prediction`);
      return { ok: true, prediction: result.prediction ?? null };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  const loadForecastPredictionSummary = async (tournamentId) => {
    try {
      const result = await apiRequest(`/api/forecast-tournaments/${tournamentId}/predictions-summary`);
      return { ok: true, summary: result };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  const saveForecastPrediction = async (tournamentId, payload) => {
    try {
      const result = await apiRequest(`/api/forecast-tournaments/${tournamentId}/prediction`, {
        body: JSON.stringify(payload),
        method: "PUT",
      });
      setForecastTournaments((current) => current.map((tournament) => (
        tournament.id === tournamentId
          ? { ...tournament, predictionCount: result.predictionCount ?? tournament.predictionCount ?? 0 }
          : tournament
      )));
      return { ok: true, prediction: result.prediction, predictionCount: result.predictionCount ?? 0 };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  const createScoringMethod = async (payload) => {
    try {
      const result = await apiRequest("/api/admin/scoring-methods", {
        body: JSON.stringify(payload),
        method: "POST",
      });
      setScoringMethods(result.methods?.length ? result.methods : fallbackScoringMethods);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  const updateSettings = async (payload) => {
    try {
      const result = await apiRequest("/api/admin/settings", {
        body: JSON.stringify(payload),
        method: "PUT",
      });
      setSettings(result.settings ?? defaultSettings);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  const openPredictions = () => {
    setScreen({ name: "predictions" });
    if (!currentUser) {
      setAuthMode("login");
    }
  };

  const openPlaceholder = (sectionKey, sectionTitle) => {
    setScreen({ name: "placeholder", sectionKey, sectionTitle });
  };

  const openAdminCabinet = () => {
    setScreen({ name: "admin" });
  };

  const registerUser = async (payload) => {
    try {
      const result = await apiRequest("/api/auth/register", {
        body: JSON.stringify(payload),
        method: "POST",
      });
      applyAuthPayload(result);
      setScreen({ name: "predictions" });
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  const loginUser = async (email, password) => {
    try {
      const result = await apiRequest("/api/auth/login", {
        body: JSON.stringify({ email, password }),
        method: "POST",
      });
      applyAuthPayload(result);
      setScreen({ name: "predictions" });
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  const logoutUser = async () => {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
    } catch {
      // Session cleanup is best-effort; local token removal is enough for the UI.
    }

    storeAuthToken("");
    setAuthState((state) => ({ ...state, currentUser: null, notifications: [], users: [] }));
    setScreen({ name: "home" });
  };

  const approveUser = async (userId) => {
    await apiRequest(`/api/admin/users/${userId}/approve`, { method: "POST" });
    await refreshAuthState();
  };

  const readNotification = async (notificationId) => {
    try {
      const payload = await apiRequest(`/api/notifications/${notificationId}/read`, { method: "POST" });
      applyAuthPayload(payload);
    } catch {
      // Notification read state is best-effort; the action target can still open.
    }
  };

  const auth = {
    currentUser,
    hasUsers: authState.hasUsers,
    notifications: authState.notifications,
    users: authState.users,
    onApproveUser: approveUser,
    onOpenAdmin: openAdminCabinet,
    onOpenForecastTournament: (tournamentId) => setScreen({ name: "forecast-detail", tournamentId }),
    onLogin: () => setAuthMode("login"),
    onLogout: logoutUser,
    onReadNotification: readNotification,
    onRegister: () => setAuthMode("register"),
  };

  const authModal = authMode && (
    <AuthModal
      hasUsers={authState.hasUsers}
      mode={authMode}
      onClose={() => setAuthMode(null)}
      onLogin={loginUser}
      onRegister={registerUser}
    />
  );

  if (authState.loading) {
    return (
      <main className="predictions-shell">
        <section className="surface prediction-empty-list tall" id="top">
          <strong>Загружаем кабинет</strong>
          <p>Проверяем сессию и статус регистрации.</p>
        </section>
      </main>
    );
  }

  if (screen.name === "admin") {
    if (!canOpenAdmin) {
      return (
        <>
          <LockedPredictionsScreen
            auth={auth}
            onOpenHome={() => setScreen({ name: "home" })}
            onOpenPlaceholder={openPlaceholder}
            onOpenPredictions={openPredictions}
          />
          {authModal}
        </>
      );
    }

    return (
      <>
        <AdminCabinetScreen
          auth={auth}
          forecastTournaments={forecastTournaments}
          onCreateScoringMethod={createScoringMethod}
          onCreateTournament={createForecastTournament}
          onOpenHome={() => setScreen({ name: "home" })}
          onOpenPlaceholder={openPlaceholder}
          onOpenPredictions={openPredictions}
          onUpdateSettings={updateSettings}
          scoringMethods={scoringMethods}
          settings={settings}
        />
        {authModal}
      </>
    );
  }

  if (screen.name === "forecast-detail") {
    const tournament = forecastTournaments.find((item) => item.id === screen.tournamentId) ?? forecastTournaments[0] ?? fallbackForecastTournaments[0];

    if (!canOpenPredictions) {
      return (
        <>
          <LockedPredictionsScreen
            auth={auth}
            onOpenHome={() => setScreen({ name: "home" })}
            onOpenPlaceholder={openPlaceholder}
            onOpenPredictions={openPredictions}
          />
          {authModal}
        </>
      );
    }

    return (
      <>
        <ForecastTournamentDetail
          auth={auth}
          forecastTournaments={forecastTournaments}
          onBack={() => setScreen({ name: "predictions" })}
          onDeleteTournament={deleteForecastTournament}
          onLoadForecastPrediction={loadForecastPrediction}
          onLoadForecastPredictionSummary={loadForecastPredictionSummary}
          onOpenHome={() => setScreen({ name: "home" })}
          onOpenPlaceholder={openPlaceholder}
          onOpenPredictions={openPredictions}
          onSaveForecastPrediction={saveForecastPrediction}
          onUpdateTournament={updateForecastTournament}
          scoringMethods={scoringMethods}
          settings={settings}
          tournament={tournament}
        />
        {authModal}
      </>
    );
  }

  if (screen.name === "predictions") {
    if (!canOpenPredictions) {
      return (
        <>
          <LockedPredictionsScreen
            auth={auth}
            onOpenHome={() => setScreen({ name: "home" })}
            onOpenPlaceholder={openPlaceholder}
            onOpenPredictions={openPredictions}
          />
          {authModal}
        </>
      );
    }

    return (
      <>
        <ForecastRegistryScreen
          auth={auth}
          forecastTournaments={forecastTournaments}
          onOpenHome={() => setScreen({ name: "home" })}
          onOpenPlaceholder={openPlaceholder}
          onOpenPredictions={openPredictions}
          onOpenTournament={(tournamentId) => setScreen({ name: "forecast-detail", tournamentId })}
        />
        {authModal}
      </>
    );
  }

  if (screen.name === "detail") {
    if (screen.tournamentId === "mexicano-brazzers-lite") {
      return (
        <>
          <MexicanoDetail
            auth={auth}
            onBack={() => setScreen({ name: "home" })}
            onOpenPlaceholder={openPlaceholder}
            onOpenPredictions={openPredictions}
          />
          {authModal}
        </>
      );
    }

    return (
      <>
        <AmericanoDetail
          auth={auth}
          onBack={() => setScreen({ name: "home" })}
          onOpenPlaceholder={openPlaceholder}
          onOpenPredictions={openPredictions}
        />
        {authModal}
      </>
    );
  }

  if (screen.name === "placeholder") {
    return (
      <>
        <PlaceholderScreen
          active={screen.sectionKey}
          auth={auth}
          onOpenHome={() => setScreen({ name: "home" })}
          onOpenPlaceholder={openPlaceholder}
          onOpenPredictions={openPredictions}
          title={screen.sectionTitle}
        />
        {authModal}
      </>
    );
  }

  return (
    <>
      <HomeScreen
        auth={auth}
        onOpenHome={() => setScreen({ name: "home" })}
        onOpenPlaceholder={openPlaceholder}
        onOpenPredictions={openPredictions}
        onOpenTournament={(tournamentId) => {
          setScreen({ name: "detail", tournamentId });
        }}
      />
      {authModal}
    </>
  );
}
