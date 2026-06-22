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

const tournamentRegistry = {
  pro: [
    {
      id: "americano-brazzers-pro",
      title: "Americano Brazzers PRO",
      date: "17 июня",
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
  ],
  lite: [
    {
      id: "mexicano-brazzers-lite",
      title: "Mexicano Brazzers LITE",
      date: "21 июня",
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
  ],
};

const forecastTournaments = [
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

const authTokenStorageKey = "padel-brazzers-auth-token";
const emptyAuthState = { currentUser: null, hasUsers: false, loading: true, users: [] };

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

function AuthControls({ currentUser, onLogin, onLogout, onOpenAdmin, onRegister }) {
  if (currentUser) {
    const isPending = currentUser.status === "pending";
    const canOpenAdmin = currentUser.role === "admin" && currentUser.status === "active";

    return (
      <div className="auth-user-card">
        <span>{getInitials(currentUser)}</span>
        <div>
          <strong>{getUserDisplayName(currentUser)}</strong>
          <small>{isPending ? "Ожидает подтверждения" : currentUser.role === "admin" ? "Админ" : "Участник"}</small>
        </div>
        {canOpenAdmin && <button type="button" onClick={onOpenAdmin}>Кабинет</button>}
        <button type="button" onClick={onLogout}>Выйти</button>
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

function AdminCabinetScreen({ auth, onOpenHome, onOpenPredictions }) {
  const pendingUsers = auth.users.filter((user) => user.status === "pending");
  const activeMembers = auth.users.filter((user) => user.status === "active" && user.role !== "admin");

  return (
    <main className="admin-cabinet-shell">
      <MainNav
        active="admin"
        label="Admin"
        onOpenHome={onOpenHome}
        onOpenPredictions={onOpenPredictions}
        action={<AuthControls {...auth} />}
      />

      <section className="admin-cabinet-hero surface" id="top">
        <div>
          <span className="eyebrow">Личный кабинет админа</span>
          <h1>Акцепт заявок участников</h1>
          <p>
            Все новые регистрации попадают сюда. Пока заявка не принята, участник
            может войти в аккаунт, но не сможет открыть прогнозы и ставить места.
          </p>
        </div>
        <div className="admin-cabinet-stats">
          <div><strong>{pendingUsers.length}</strong><span>ожидают принятия</span></div>
          <div><strong>{activeMembers.length}</strong><span>принятых участников</span></div>
          <div><strong>{auth.users.length}</strong><span>аккаунтов всего</span></div>
        </div>
      </section>

      <section className="admin-cabinet-grid">
        <AdminApprovalPanel users={auth.users} onApproveUser={auth.onApproveUser} />

        <section className="surface side-panel admin-members-panel">
          <div className="section-title">
            <span>Уже приняты</span>
            <h2>Активные участники</h2>
          </div>

          {activeMembers.length === 0 ? (
            <p>Пока нет принятых участников.</p>
          ) : (
            <div className="member-list">
              {activeMembers.map((user) => (
                <article className="member-row" key={user.id}>
                  <span>{getInitials(user)}</span>
                  <div>
                    <strong>{getUserDisplayName(user)}</strong>
                    <small>{user.lundaNick} · {user.email}</small>
                  </div>
                  <b>Активен</b>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function MainNav({ active = "home", onOpenHome, onOpenPredictions, label = "Club", action = null }) {
  const goHome = (event) => {
    event.preventDefault();
    onOpenHome?.();
  };

  return (
    <header className="topbar">
      <a className="brand" href="#top" aria-label="Padel Brazzers" onClick={goHome}>
        <span className="brand-mark">PB</span>
        <strong>Padel Brazzers</strong>
        <span>{label}</span>
      </a>
      <nav>
        <a className={active === "tournaments" ? "active" : ""} href="#registry" onClick={active === "predictions" ? goHome : undefined}>
          Турниры
        </a>
        <a className={active === "leaders" ? "active" : ""} href="#leaders">Лидеры</a>
        <button className={active === "predictions" ? "active" : ""} type="button" onClick={onOpenPredictions}>
          Прогнозы
        </button>
        <a href="#community">Сообщество</a>
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

function LockedPredictionsScreen({ auth, onOpenHome, onOpenPredictions }) {
  return (
    <main className="predictions-shell">
      <MainNav
        active="predictions"
        label="Club"
        onOpenHome={onOpenHome}
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

function ForecastRegistryScreen({ auth, onOpenHome, onOpenPredictions, onOpenTournament }) {
  return (
    <main className="predictions-shell">
      <MainNav
        active="predictions"
        label="Club"
        onOpenHome={onOpenHome}
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
          <div><strong>{forecastTournaments.length}</strong><span>турнир в реестре</span></div>
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
            {forecastTournaments.map((tournament) => (
              <button
                className="tournament-row featured"
                type="button"
                onClick={() => onOpenTournament(tournament.id)}
                key={tournament.id}
              >
                <img src={tournament.image} alt="" />
                <div className="tournament-copy">
                  <span>{tournament.date} · {tournament.club}</span>
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

function ForecastTournamentDetail({ auth, tournament, onOpenHome, onOpenPredictions, onBack }) {
  return (
    <main className="predictions-shell">
      <MainNav
        active="predictions"
        label="Club"
        onOpenHome={onOpenHome}
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
              <span>{tournament.date}</span>
              <span>{tournament.time}</span>
              <span>{tournament.club}</span>
            </div>
            <p>
              Карточка будущего турнира для прогнозов. После публикации состава
              участник сможет открыть этот экран и расставить игроков по местам.
            </p>
          </div>
          <div className="metric-strip">
            <div><strong>{tournament.roster.length || "—"}</strong><span>участников</span></div>
            <div><strong>1</strong><span>балл за позицию</span></div>
            <div><strong>До старта</strong><span>редактирование</span></div>
            <div><strong>{tournament.format}</strong><span>формат</span></div>
          </div>
        </section>

        <section className="surface prediction-tournament-card">
          <div className="section-title">
            <span>Кабинет участника</span>
            <h2>{getUserDisplayName(auth.currentUser)}</h2>
          </div>
          <p>
            Вход выполнен. Прогноз можно будет сохранить и менять до закрытия
            приема после публикации состава турнира.
          </p>
        </section>
      </section>

      <section className="prediction-workspace">
        <section className="surface prediction-roster-card" id="roster">
          <div className="section-title">
            <span>Состав турнира</span>
            <h2>Игроки появятся из управляющей части</h2>
          </div>
          <div className="prediction-empty-list">
            <strong>Состав пока не опубликован</strong>
            <p>Когда организатор добавит участников, здесь появятся плашки игроков.</p>
          </div>
        </section>

        <section className="surface prediction-ranking-card" id="ranking">
          <div className="prediction-card-head">
            <div className="section-title">
              <span>Мой прогноз</span>
              <h2>Порядок мест</h2>
            </div>
            <button disabled type="button">Сохранить прогноз</button>
          </div>
          <div className="prediction-empty-list tall">
            <strong>Расстановка откроется после публикации состава</strong>
            <p>Здесь будет drag-and-drop список участников: 1-е место сверху, последнее место снизу.</p>
          </div>
        </section>
      </section>
    </main>
  );
}

function HomeScreen({ auth, onOpenTournament, onOpenPredictions }) {
  const [category, setCategory] = useState("pro");
  const tournaments = tournamentRegistry[category];
  const activeLabel = category.toUpperCase();

  return (
    <main className="home-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Padel Brazzers">
          <span className="brand-mark">PB</span>
          <strong>Padel Brazzers</strong>
          <span>Club</span>
        </a>
        <nav>
          <a className="active" href="#registry">Турниры</a>
          <a href="#leaders">Лидеры</a>
          <button type="button" onClick={onOpenPredictions}>Прогнозы</button>
          <a href="#community">Сообщество</a>
        </nav>
        <AuthControls {...auth} />
      </header>

      <section className="home-hero surface" id="top">
        <img src="/assets/hero-court.png" alt="Падел корт Padel Brazzers" />
        <div className="home-hero-copy">
          <span className="eyebrow">Vladivostok padel community</span>
          <h1>Добро пожаловать в Padel Brazzers</h1>
          <p>
            Архив турниров, таблицы после каждого раунда, результаты всех кортов и
            аналитика по главным матчам. Выбирайте PRO или LITE и открывайте нужный
            турнир.
          </p>
          <div className="home-actions">
            <a href="#registry">Смотреть турниры</a>
            <button type="button" onClick={onOpenPredictions}>Сделать прогноз</button>
            <button type="button" onClick={() => setCategory(category === "pro" ? "lite" : "pro")}>
              Переключить на {category === "pro" ? "LITE" : "PRO"}
            </button>
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
              <h2>Прошедшие турниры {activeLabel}</h2>
            </div>
            <div className="registry-toggle" aria-label="Категория турниров">
              <button className={category === "pro" ? "active" : ""} type="button" onClick={() => setCategory("pro")}>
                PRO
              </button>
              <button className={category === "lite" ? "active" : ""} type="button" onClick={() => setCategory("lite")}>
                LITE
              </button>
            </div>
          </div>

          <div className="tournament-list">
            {tournaments.length === 0 && (
              <div className="empty-registry">
                <span>{activeLabel}</span>
                <strong>Турниров пока нет</strong>
                <p>Здесь появятся боевые турниры этой категории, когда мы загрузим реальные данные.</p>
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

function AmericanoDetail({ onBack }) {
  const [descriptionOpen, setDescriptionOpen] = useState(true);

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Padel Brazzers" onClick={(event) => { event.preventDefault(); onBack(); }}>
          <span className="brand-mark">PB</span>
          <strong>Padel Brazzers</strong>
          <span>PRO</span>
        </a>
        <nav>
          <a href="#top">Турнир</a>
          <a href="#standings">Личный зачет</a>
          <a href="#rounds">Раунды</a>
          <a href="#stories">Разбор</a>
        </nav>
        <div className="profile-chip">
          <button className="back-link" type="button" onClick={onBack}>Все турниры</button>
          <span>1</span>
          <PlayerBadge player="Kh Ivan" small />
        </div>
      </header>

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

function MexicanoDetail({ onBack }) {
  const [descriptionOpen, setDescriptionOpen] = useState(true);

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Padel Brazzers" onClick={(event) => { event.preventDefault(); onBack(); }}>
          <span className="brand-mark">PB</span>
          <strong>Padel Brazzers</strong>
          <span>LITE</span>
        </a>
        <nav>
          <a href="#top">Турнир</a>
          <a href="#standings">Личный зачет</a>
          <a href="#rounds">Раунды</a>
          <a href="#stories">Важное</a>
        </nav>
        <div className="profile-chip">
          <button className="back-link" type="button" onClick={onBack}>Все турниры</button>
          <span>1</span>
          <PlayerBadge player="Искалдович Константин" playerPool={mexicanoPlayers} small />
        </div>
      </header>

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

function TournamentDetail({ onBack }) {
  const [descriptionOpen, setDescriptionOpen] = useState(true);

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Padel Brazzers" onClick={(event) => { event.preventDefault(); onBack(); }}>
          <span className="brand-mark">PB</span>
          <strong>Padel Brazzers</strong>
          <span>PRO</span>
        </a>
        <nav>
          <a href="#top">Турниры</a>
          <a href="#standings">Рейтинг</a>
          <a href="#rounds">Игроки</a>
          <a href="#stories">О нас</a>
        </nav>
        <div className="profile-chip">
          <button className="back-link" type="button" onClick={onBack}>Все турниры</button>
          <span>2</span>
          <TeamBadge team="Шевченко / Борис" small />
        </div>
      </header>

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

export function App() {
  const [screen, setScreen] = useState({ name: "home" });
  const [authState, setAuthState] = useState(emptyAuthState);
  const [authMode, setAuthMode] = useState(null);
  const currentUser = authState.currentUser;
  const canOpenPredictions = currentUser?.status === "active";
  const canOpenAdmin = currentUser?.role === "admin" && currentUser?.status === "active";

  useEffect(() => {
    const loadServerAuthState = async () => {
      try {
        const payload = await apiRequest("/api/auth/state");
        setAuthState({
          currentUser: payload.user ?? null,
          hasUsers: payload.hasUsers,
          loading: false,
          users: payload.users ?? [],
        });
      } catch {
        storeAuthToken("");
        setAuthState({ ...emptyAuthState, loading: false });
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
      users: payload.users ?? [],
    });
  };

  const refreshAuthState = async () => {
    const payload = await apiRequest("/api/auth/state");
    applyAuthPayload(payload);
  };

  const openPredictions = () => {
    setScreen({ name: "predictions" });
    if (!currentUser) {
      setAuthMode("login");
    }
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
    setAuthState((state) => ({ ...state, currentUser: null, users: [] }));
    setScreen({ name: "home" });
  };

  const approveUser = async (userId) => {
    await apiRequest(`/api/admin/users/${userId}/approve`, { method: "POST" });
    await refreshAuthState();
  };

  const auth = {
    currentUser,
    hasUsers: authState.hasUsers,
    users: authState.users,
    onApproveUser: approveUser,
    onOpenAdmin: openAdminCabinet,
    onLogin: () => setAuthMode("login"),
    onLogout: logoutUser,
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
          onOpenHome={() => setScreen({ name: "home" })}
          onOpenPredictions={openPredictions}
        />
        {authModal}
      </>
    );
  }

  if (screen.name === "forecast-detail") {
    const tournament = forecastTournaments.find((item) => item.id === screen.tournamentId) ?? forecastTournaments[0];

    if (!canOpenPredictions) {
      return (
        <>
          <LockedPredictionsScreen
            auth={auth}
            onOpenHome={() => setScreen({ name: "home" })}
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
          onBack={() => setScreen({ name: "predictions" })}
          onOpenHome={() => setScreen({ name: "home" })}
          onOpenPredictions={openPredictions}
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
          onOpenHome={() => setScreen({ name: "home" })}
          onOpenPredictions={openPredictions}
          onOpenTournament={(tournamentId) => setScreen({ name: "forecast-detail", tournamentId })}
        />
        {authModal}
      </>
    );
  }

  if (screen.name === "detail") {
    if (screen.tournamentId === "mexicano-brazzers-lite") {
      return <MexicanoDetail onBack={() => setScreen({ name: "home" })} />;
    }

    return <AmericanoDetail onBack={() => setScreen({ name: "home" })} />;
  }

  return (
    <>
      <HomeScreen
        auth={auth}
        onOpenPredictions={openPredictions}
        onOpenTournament={(tournamentId) => {
          setScreen({ name: "detail", tournamentId });
        }}
      />
      {authModal}
    </>
  );
}
