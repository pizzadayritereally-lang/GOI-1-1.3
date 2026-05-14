// /goi-1/main.js
"use strict";

const VERSION = "0.3.0-rebuild";
const SAVE_KEY = "goi1_rebuild_save";
const $ = (q) => document.querySelector(q);
const $$ = (q) => Array.from(document.querySelectorAll(q));
const clone = (x) => JSON.parse(JSON.stringify(x));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => Math.random() * (b - a) + a;
const fmt = (n, d = 0) => Number(n || 0).toLocaleString("ru-RU", { maximumFractionDigits: d, minimumFractionDigits: d });
const esc = (s) => String(s ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

const IDEO = {
  parliamentary: { name: "Парламентская лига", short: "Лига", color: "#3d76b8", money: 1.08, pp: 1.04, war: 1.18, justify: 1.25 },
  syndicate: { name: "Народный синдикат", short: "Синдикат", color: "#b84a4a", money: .98, pp: 1.04, war: 1, justify: 1 },
  grey: { name: "Серый Порядок", short: "Порядок", color: "#666d77", money: 1.02, pp: 1.12, war: .82, justify: .72 },
  crown: { name: "Коронный блок", short: "Корона", color: "#9569b2", money: 1.01, pp: 1.03, war: 1, justify: 1.05 },
  charter: { name: "Свободные хартии", short: "Хартии", color: "#c7a652", money: 1.18, pp: .98, war: 1.12, justify: 1.16 },
};

const TERRAIN = {
  plains: { name: "Равнины", atk: 1, def: 1, move: 1, supply: 1 },
  forest: { name: "Леса", atk: .9, def: 1.16, move: 1.2, supply: .95 },
  hills: { name: "Холмы", atk: .84, def: 1.24, move: 1.35, supply: .9 },
  mountains: { name: "Горы", atk: .62, def: 1.42, move: 1.7, supply: .75 },
  desert: { name: "Пустыня", atk: .82, def: .96, move: 1.35, supply: .72 },
  jungle: { name: "Джунгли", atk: .76, def: 1.18, move: 1.5, supply: .65 },
  urban: { name: "Город", atk: .82, def: 1.45, move: 1.1, supply: 1.08 },
  port: { name: "Порт", atk: .95, def: 1.12, move: 1, supply: 1.18 },
  island: { name: "Остров", atk: .8, def: 1.16, move: 1.3, supply: .84 },
  steppe: { name: "Степь", atk: 1.06, def: .96, move: .9, supply: 1.02 },
};

const RES = { steel: "Сталь", oil: "Нефть", aluminium: "Алюминий", rubber: "Резина", chromium: "Хром", crystals: "Кристаллы" };

const BUILD = {
  civilian: { name: "Гражданская фабрика", money: 120, cost: 520, max: 12 },
  military: { name: "Военный завод", money: 145, cost: 620, max: 12 },
  dockyard: { name: "Верфь", money: 160, cost: 650, max: 8 },
  infrastructure: { name: "Инфраструктура", money: 80, cost: 360, max: 10 },
  fort: { name: "Укрепления", money: 90, cost: 420, max: 8 },
  supply: { name: "Склад снабжения", money: 110, cost: 460, max: 5 },
  airbase: { name: "Аэродром", money: 100, cost: 430, max: 8 },
};

const EQ = {
  infantry_equipment: { name: "Пехотное оружие", cat: "mil", out: 2.2, res: { steel: 1 } },
  support_equipment: { name: "Поддержка", cat: "mil", out: 1.1, res: { steel: 1, aluminium: 1 } },
  artillery: { name: "Артиллерия", cat: "mil", out: .7, res: { steel: 2, chromium: 1 } },
  trucks: { name: "Грузовики", cat: "mil", out: .85, res: { steel: 1, rubber: 1, oil: 1 } },
  light_tanks: { name: "Лёгкие танки", cat: "mil", out: .28, res: { steel: 3, chromium: 1, oil: 1 } },
  medium_tanks: { name: "Средние танки", cat: "mil", out: .18, res: { steel: 4, chromium: 2, oil: 2 } },
  fighters: { name: "Истребители", cat: "mil", out: .25, res: { aluminium: 3, rubber: 2 } },
  convoys: { name: "Конвои", cat: "dock", out: .4, res: { steel: 2, oil: 1 } },
};

const TPL = {
  militia: {
    name: "Ополчение", short: "ОП", kind: "Пехота: ополчение", family: "infantry",
    days: 24, money: 28, moveMoney: 3, attackMoney: 6, manpower: 4500,
    eq: { infantry_equipment: 55 },
    s: { atk: 6, def: 12, brk: 3, armor: 0, pierce: 4, hp: 72, org: 32, speed: 1, supply: .75, fuel: 0 },
    desc: "Дешёвые части для гарнизонов и срочной обороны."
  },
  infantry_basic: {
    name: "Базовая пехота", short: "ПХ", kind: "Пехота: линейная", family: "infantry",
    days: 38, money: 58, moveMoney: 5, attackMoney: 10, manpower: 9000,
    eq: { infantry_equipment: 140, support_equipment: 18 },
    s: { atk: 15, def: 24, brk: 8, armor: 0, pierce: 8, hp: 105, org: 46, speed: 1, supply: 1.15, fuel: 0 },
    desc: "Основная фронтовая дивизия."
  },
  infantry_elite: {
    name: "Элитная пехота", short: "ЭЛ", kind: "Пехота: элита", family: "infantry",
    days: 58, money: 105, moveMoney: 7, attackMoney: 14, manpower: 10000,
    eq: { infantry_equipment: 220, support_equipment: 40, artillery: 18 },
    s: { atk: 27, def: 36, brk: 18, armor: 0, pierce: 16, hp: 124, org: 62, speed: 1.05, supply: 1.45, fuel: 0 },
    desc: "Дорогие штурмовые и оборонительные соединения."
  },
  light_tank: {
    name: "Лёгкая танковая дивизия", short: "ЛТ", kind: "Танковая", family: "tank",
    days: 62, money: 180, moveMoney: 15, attackMoney: 28, manpower: 7200,
    eq: { infantry_equipment: 80, trucks: 70, light_tanks: 65, support_equipment: 25 },
    s: { atk: 44, def: 24, brk: 58, armor: 24, pierce: 28, hp: 128, org: 42, speed: 2.2, supply: 2.7, fuel: 2.4 },
    desc: "Быстрый прорыв и окружение на равнинах."
  },
  medium_tank: {
    name: "Средняя танковая дивизия", short: "СТ", kind: "Танковая", family: "tank",
    days: 82, money: 260, moveMoney: 22, attackMoney: 40, manpower: 8400,
    eq: { infantry_equipment: 100, trucks: 90, medium_tanks: 58, artillery: 12, support_equipment: 35 },
    s: { atk: 66, def: 34, brk: 86, armor: 44, pierce: 48, hp: 148, org: 39, speed: 1.75, supply: 3.55, fuel: 3.8 },
    desc: "Тяжёлый ударный кулак для больших наступлений."
  },
};

const COUNTRIES = {
  nordwald: { name: "Рейхсдиректория Нордвальда", short: "Нордвальд", flag: "nordwald", ideology: "grey", leader: "Верховный Директор Эрих Волькмар", capital: "eisenburg", tier: "Великая держава", diff: "Средняя", ai: "aggressor", stability: 54, warSupport: 72, pp: 65, ppGain: 1.8, money: 720, manpower: 2300000, fuel: 720, slots: 4, problem: "Нехватка нефти и резины, рост сопротивления в долгой войне.", style: "Быстрые кампании, бронетехника, политическое давление.", history: "Реваншистская директория Айзенбурга выросла из кризиса и послевоенного унижения. Режим давит на соседей, строит военные заводы и готовит новый передел Вардии.", spirits: ["Унижение Серого мира", "Тайное перевооружение", "Офицерские братства"], pop: { grey: 72, parliamentary: 10, crown: 8, syndicate: 6, charter: 4 }, army: { militia: 6, infantry_basic: 28, infantry_elite: 4, light_tank: 4 } },
  aurelia: { name: "Федерация Аурелии", short: "Аурелия", flag: "aurelia", ideology: "parliamentary", leader: "Президентка Марена Лиор", capital: "solaris", tier: "Великая держава", diff: "Лёгкая", ai: "defender", stability: 78, warSupport: 35, pp: 75, ppGain: 1.45, money: 980, manpower: 1500000, fuel: 830, slots: 4, problem: "Парламент спорит о мобилизации, пока границы Вардии становятся горячими.", style: "Коалиции, оборона, промышленный рывок и помощь союзникам.", history: "Соларис пытается сохранить послевоенный порядок дипломатией, но общество всё чаще требует укреплять армию и гарантировать малые страны.", spirits: ["Сломанная коалиция", "Память прошлой войны", "Арсенал демократии"], pop: { parliamentary: 64, charter: 13, crown: 9, syndicate: 8, grey: 6 }, army: { militia: 4, infantry_basic: 25, infantry_elite: 4, light_tank: 2 } },
  wardian: { name: "Союз Вардийских Республик", short: "Вардийский Союз", flag: "wardian", ideology: "syndicate", leader: "Генеральный секретарь Ордан Малек", capital: "krasnoval", tier: "Великая держава", diff: "Сложная", ai: "industrialist", stability: 48, warSupport: 60, pp: 48, ppGain: 1.55, money: 820, manpower: 4200000, fuel: 1200, slots: 4, problem: "Слабые шаблоны, бюрократия и огромные расстояния.", style: "Массовая армия, глубокая оборона и поздняя индустриальная мощь.", history: "Красновал строит заводы за восточными хребтами и готовит страну к войне, которая может прийти с любой стороны.", spirits: ["Революционная бюрократия", "Пятилетние планы"], pop: { syndicate: 68, parliamentary: 10, crown: 9, grey: 7, charter: 6 }, army: { militia: 16, infantry_basic: 50, infantry_elite: 6, light_tank: 4, medium_tank: 4 } },
  seigan: { name: "Империя Сейган", short: "Сейган", flag: "seigan", ideology: "crown", leader: "Император Сейро IV", capital: "hakuro", tier: "Великая держава", diff: "Средняя", ai: "naval", stability: 63, warSupport: 58, pp: 58, ppGain: 1.42, money: 760, manpower: 1800000, fuel: 620, slots: 4, problem: "Островная экономика зависит от импортной нефти и резины.", style: "Флот, авиация, быстрые высадки и войны за ресурсы.", history: "Хакуро балансирует между армейской партией материка и флотской партией южных морей. Обе требуют расширения.", spirits: ["Островная имперская доктрина", "Армия против флота"], pop: { crown: 62, grey: 13, parliamentary: 9, charter: 8, syndicate: 8 }, army: { militia: 5, infantry_basic: 27, infantry_elite: 5, light_tank: 2 } },
  mireya: { name: "Конфедерация Мирейских Штатов", short: "Мирея", flag: "mireya", ideology: "parliamentary", leader: "Канцлер Элиан Торн", capital: "highmere", tier: "Великая держава", diff: "Лёгкая", ai: "industrialist", stability: 72, warSupport: 24, pp: 65, ppGain: 1.25, money: 1450, manpower: 2400000, fuel: 1450, slots: 4, problem: "Изоляционизм и позднее вступление в глобальные войны.", style: "Гигантская экономика, флот, авиация и помощь союзникам.", history: "За океаном Конфедерация предпочитает торговлю и безопасность морей, но шторм в Вардии угрожает всем путям.", spirits: ["Изоляционистский конгресс", "Великая промышленная машина"], pop: { parliamentary: 58, charter: 24, crown: 6, syndicate: 6, grey: 6 }, army: { militia: 8, infantry_basic: 22, infantry_elite: 3, light_tank: 2 } },
  caldora: { name: "Королевство Кальдора", short: "Кальдора", flag: "caldora", ideology: "crown", leader: "Король Адриан IV", capital: "verdant", tier: "Средняя держава", diff: "Сложная", ai: "defender", stability: 70, warSupport: 50, pp: 45, ppGain: 1.15, money: 420, manpower: 620000, fuel: 260, slots: 3, problem: "Малая промышленность и опасное положение между великими державами.", style: "Форты, горная оборона, элитная пехота.", history: "Вердант стоит на перевалах Вардии. Старые крепости держат границу, но новая война потребует большего.", spirits: ["Королевская линия крепостей", "Горные стрелки"], pop: { crown: 55, parliamentary: 20, grey: 10, charter: 8, syndicate: 7 }, army: { militia: 3, infantry_basic: 10, infantry_elite: 4 } },
  ostromar: { name: "Народная Республика Остромар", short: "Остромар", flag: "ostromar", ideology: "syndicate", leader: "Председатель Лян Ор", capital: "chan_or", tier: "Средняя держава", diff: "Сложная", ai: "defender", stability: 42, warSupport: 54, pp: 38, ppGain: 1.22, money: 520, manpower: 3000000, fuel: 420, slots: 3, problem: "Раздробленные армии, слабая инфраструктура и угроза с моря.", style: "Партизаны, оборона, истощение и мобилизация регионов.", history: "Чан-Ор пытается собрать провинциальные армии в единую силу, пока восточные порты смотрят на флот Сейгана.", spirits: ["Провинциальные армии", "Долгая война"], pop: { syndicate: 49, parliamentary: 18, crown: 14, charter: 11, grey: 8 }, army: { militia: 18, infantry_basic: 22, infantry_elite: 2 } },
  argenta: { name: "Доминион Аргенты", short: "Аргента", flag: "argenta", ideology: "charter", leader: "Премьер Селио Мар", capital: "silverport", tier: "Средняя держава", diff: "Средняя", ai: "trader", stability: 66, warSupport: 31, pp: 55, ppGain: 1.2, money: 930, manpower: 780000, fuel: 900, slots: 3, problem: "Нейтральная прибыль раздражает все лагеря.", style: "Торговля, ресурсы, флот и осторожный выбор стороны.", history: "Серебряные порты богатеют на рудах и нефти, но южные проливы всё чаще видят чужие военные корабли.", spirits: ["Серебряные шахты", "Нейтральный арсенал"], pop: { charter: 54, parliamentary: 20, crown: 12, grey: 8, syndicate: 6 }, army: { militia: 6, infantry_basic: 12, infantry_elite: 2, light_tank: 1 } },
};

const REGION_SPECS = [
  ["nordmark","Нордмарк","nordwald","Вардия",165,120,96,74,"hills",8,3,4,0,6,1,2,10,0,1,0,1,0],
  ["eisenburg","Айзенбург","nordwald","Вардия",263,126,110,82,"urban",42,8,6,0,8,2,3,22,0,2,0,1,1],
  ["ruran","Руран","nordwald","Вардия",188,195,108,80,"plains",16,5,8,0,7,0,2,26,1,2,0,4,0],
  ["valgrad","Вальград","nordwald","Вардия",296,208,100,78,"forest",12,4,5,0,6,0,2,14,1,2,0,2,0],
  ["holmgrad","Хольмград","nordwald","Вардия",145,278,110,75,"port",14,4,3,5,6,0,1,8,2,1,0,1,0],
  ["solaris","Соларис","aurelia","Вардия",373,142,114,86,"urban",38,11,5,2,8,0,3,10,0,5,0,0,1],
  ["lorren","Лоррен","aurelia","Вардия",398,227,105,76,"plains",14,7,4,0,7,0,2,8,1,3,0,0,0],
  ["cote_lumiere","Кот-Люмьер","aurelia","Вардия",512,185,114,78,"port",18,7,2,4,7,0,2,4,0,4,1,0,0],
  ["frontier","Фронтир","aurelia","Вардия",505,265,112,80,"forest",10,5,3,0,6,1,2,6,0,3,0,0,0],
  ["westhaven","Вестхейвен","aurelia","Вардия",402,305,107,76,"port",12,5,0,2,6,0,1,3,0,2,0,0,0],
  ["verdant","Вердант","caldora","Вардия",615,260,102,80,"mountains",25,4,3,0,5,5,2,6,0,1,0,2,0],
  ["kaldor_pass","Кальдорский перевал","caldora","Вардия",706,308,100,78,"mountains",8,3,2,0,4,4,1,4,0,0,0,3,0],
  ["royal_line","Королевская линия","caldora","Вардия",607,348,102,76,"hills",10,3,3,0,5,4,1,4,0,1,0,2,0],
  ["krasnoval","Красновал","wardian","Вардия",747,172,115,84,"urban",40,9,6,0,7,0,3,18,3,2,0,5,1],
  ["volkara","Волкара","wardian","Вардия",835,240,112,82,"steppe",14,7,5,0,6,0,2,16,10,1,0,6,0],
  ["east_rail","Восточные рельсы","wardian","Вардия",727,350,108,78,"steppe",10,6,4,0,7,0,2,12,7,1,0,5,0],
  ["red_hinterland","Красные тылы","wardian","Вардия",842,332,108,76,"forest",8,7,4,0,5,0,2,10,4,2,0,3,0],
  ["uraleth","Уралет","wardian","Вардия",792,428,112,80,"hills",12,7,3,0,5,0,1,20,8,2,0,6,1],
  ["chan_or","Чан-Ор","ostromar","Сейра",205,435,112,82,"urban",34,6,4,0,5,0,2,8,2,2,1,1,0],
  ["north_clans","Северные кланы","ostromar","Сейра",313,430,110,78,"mountains",8,3,2,0,3,0,1,8,0,1,0,4,1],
  ["green_basin","Зелёная котловина","ostromar","Сейра",420,435,112,82,"jungle",10,4,3,0,4,0,1,3,1,2,8,0,0],
  ["long_river","Длинная река","ostromar","Сейра",250,515,114,82,"plains",12,5,2,0,5,0,1,7,2,1,2,0,0],
  ["east_ports","Восточные порты","ostromar","Сейра",361,516,112,80,"port",16,5,2,2,5,0,1,4,1,1,3,0,0],
  ["red_delta","Красная дельта","ostromar","Сейра",474,515,112,82,"jungle",8,3,1,0,3,0,1,2,1,1,7,0,0],
  ["hakuro","Хакуро","seigan","Сейра",715,385,96,74,"port",36,7,5,8,7,0,3,5,0,2,0,0,0],
  ["kuroshima","Куросима","seigan","Сейра",810,405,88,72,"island",10,4,2,3,5,0,1,2,0,1,0,0,0],
  ["south_mandate","Южный мандат","seigan","Сейра",898,450,90,72,"island",8,3,1,3,4,0,1,1,1,1,2,0,0],
  ["naval_yards","Верфи Кайро","seigan","Сейра",725,465,100,78,"port",18,3,3,4,6,0,2,3,0,1,0,0,0],
  ["seigan_hills","Сейганские холмы","seigan","Сейра",825,500,92,74,"hills",8,2,1,0,4,0,1,4,0,1,0,1,0],
  ["highmere","Хаймир","mireya","Мирея",77,502,104,76,"urban",40,12,5,3,8,0,3,8,6,6,2,0,1],
  ["lake_forge","Озёрные кузни","mireya","Мирея",180,506,110,78,"plains",18,10,6,0,8,0,2,20,8,5,1,2,0],
  ["new_bastion","Новый Бастион","mireya","Мирея",285,590,112,78,"port",20,8,3,6,7,0,2,6,7,3,1,0,0],
  ["prairie_line","Линия прерий","mireya","Мирея",74,580,108,74,"steppe",8,7,2,0,6,0,1,6,10,2,1,0,0],
  ["western_ports","Западные порты","mireya","Мирея",182,585,108,76,"port",12,8,2,5,6,0,1,4,7,2,1,0,0],
  ["silverport","Сильверпорт","argenta","Захария",598,575,108,78,"port",30,7,3,5,7,0,2,5,10,3,2,1,1],
  ["argent_mines","Серебряные шахты","argenta","Захария",491,560,110,80,"hills",14,6,3,0,6,0,1,10,8,4,1,5,2],
  ["south_oil","Южная нефть","argenta","Захария",706,565,110,80,"desert",12,5,2,0,5,0,1,2,28,1,0,2,0],
  ["copper_dunes","Медные дюны","argenta","Захария",548,645,112,72,"desert",8,4,2,0,4,0,1,4,12,5,0,3,1],
  ["southern_pass","Южный проход","argenta","Захария",660,645,112,72,"mountains",6,3,1,0,3,1,1,5,5,2,0,4,0],
  ["lumin_bases","Базы Лумин","argenta","Лумин",958,580,90,68,"island",10,2,1,2,4,0,1,1,3,1,5,0,1],
];

const FOCUS = {
  nordwald: [
    f("nw_ind", "Возродить Айзенбургские заводы", 35, [], "+2 военных завода и 80 денег.", [["building","eisenburg","military",2],["money",80]]),
    f("nw_order", "Съезд Серого Порядка", 35, [], "+8% военная поддержка, -3% стабильность, +5 напряжения.", [["warSupport",8],["stability",-3],["wt",5]]),
    f("nw_claim", "Вернуть Северный пояс", 56, ["nw_order"], "Цель войны против Кальдоры.", [["wt",5],["wargoal","caldora"]]),
    f("nw_dawn", "План «Чёрный Рассвет»", 70, ["nw_claim"], "Цель войны против Аурелии.", [["wt",12],["wargoal","aurelia"],["news","План «Чёрный Рассвет»","Айзенбургские штабы переводят железные дороги на военный режим."]], { wt: 35 }),
  ],
  aurelia: [
    f("au_rep", "Сохранить республику", 35, [], "+8% стабильность и 60 денег.", [["stability",8],["money",60]]),
    f("au_ars", "Арсеналы Солариса", 56, [], "+2 военных завода.", [["building","solaris","military",2]]),
    f("au_league", "Лига Свободного Моря", 70, ["au_rep"], "Создать оборонительную фракцию.", [["faction","Лига Свободного Моря"]]),
  ],
  wardian: [
    f("wr_plan", "Второй пятилетний план", 56, [], "+3 гражданские фабрики.", [["building","uraleth","civilian",3],["money",90]]),
    f("wr_def", "Глубокая оборона", 56, [], "+4 укрепления.", [["building","krasnoval","fort",2],["building","volkara","fort",2],["mod","defense",.08]]),
    f("wr_red", "Красный Интервал", 70, ["wr_def"], "Создать фракцию.", [["faction","Красный Интервал"]]),
  ],
  seigan: [
    f("sg_yards", "Верфи Хакуро", 56, [], "+3 верфи.", [["building","hakuro","dockyard",3]]),
    f("sg_mainland", "Армия требует материка", 56, [], "Цель войны против Остромара.", [["wt",5],["wargoal","ostromar"]]),
  ],
  mireya: [
    f("mi_neu", "Нейтралитет прежде всего", 35, [], "+8% стабильность, +100 денег.", [["stability",8],["money",100]]),
    f("mi_ars", "Закон арсеналов свободы", 70, [], "+4 военных завода.", [["building","lake_forge","military",4]]),
  ],
  caldora: [
    f("ca_forts", "Королевская линия крепостей", 56, [], "+4 укрепления.", [["building","verdant","fort",2],["building","royal_line","fort",2]]),
    f("ca_elite", "Горные стрелки", 56, [], "+1 элитная дивизия и +8% защита.", [["spawn","infantry_elite",1],["mod","defense",.08]]),
  ],
  ostromar: [
    f("os_unite", "Объединить провинциальные армии", 56, [], "+3 базовые пехотные дивизии.", [["spawn","infantry_basic",3]]),
    f("os_front", "Антисейганский фронт", 70, [], "Цель войны против Сейгана.", [["wargoal","seigan"]]),
  ],
  argenta: [
    f("ar_mines", "Серебряные шахты", 56, [], "+6 стали, +2 кристалла, +100 денег.", [["res","argent_mines","steel",6],["res","argent_mines","crystals",2],["money",100]]),
    f("ar_oil", "Нефтяной закон юга", 56, [], "+12 нефти.", [["res","south_oil","oil",12]]),
  ],
};

const TECH = {
  industry: { name: "Станки нового поколения", days: 135, desc: "+10% производство", fx: [["mod","prod",.10]] },
  construction: { name: "Стандарты стройтрестов", days: 120, desc: "+10% строительство", fx: [["mod","build",.10]] },
  infantry: { name: "Пехотное оружие 1934", days: 145, desc: "+10% атака пехоты", fx: [["mod","infAtk",.10]] },
  logistics: { name: "Полевые склады", days: 120, desc: "+10% снабжение", fx: [["mod","supply",.10]] },
  armor: { name: "Лёгкая бронетехника", days: 165, desc: "+8% атака танков", fx: [["mod","tankAtk",.08]] },
  radio: { name: "Армейское радио", days: 110, desc: "+8% организация", fx: [["mod","org",.08]] },
};

function f(id, title, days, req, desc, fx, cond = {}) { return { id, title, days, req, desc, fx, cond }; }

let S = null;
let selectedCountry = null;
let selectMode = "standard";
let timer = null;
let pauseBeforeNews = [];

function poly(x,y,w,h){ return `${x},${y+6} ${x+w-8},${y} ${x+w},${y+h-6} ${x+8},${y+h}`; }
function flagMark(id){ return { nordwald:"✦", aurelia:"A", wardian:"V", seigan:"◉", mireya:"M", caldora:"♔", ostromar:"O", argenta:"◆" }[id] || "•"; }
function flagHtml(id){ const c = S?.countries?.[id] || COUNTRIES[id]; return c ? `<span class="flag ${esc(c.flag)}">${flagMark(id)}</span>` : ""; }
function C(id){ return S?.countries?.[id]; }
function R(id){ return S?.regions?.[id]; }
function D(id){ return S?.divisions?.[id]; }

function newGame(mode="standard"){
  const countries = {};
  Object.entries(COUNTRIES).forEach(([id,c]) => {
    countries[id] = {
      id, ...clone(c), faction:null, completed:[], focus:null, research:[], tech:[],
      mods:{ prod:0, build:0, defense:0, infAtk:0, tankAtk:0, supply:0, org:0 },
      stock:{ infantry_equipment:6000, support_equipment:600, artillery:180, trucks:260, light_tanks:100, medium_tanks:35, fighters: id==="nordwald"?900:id==="aurelia"?700:id==="wardian"?500:250, convoys:70 },
      production:[], buildQueue:[], training:[], relations:{}, wargoals:[], wars:[], defeated:false
    };
  });

  const regions = {};
  REGION_SPECS.forEach((a) => {
    const [id,name,owner,continent,x,y,w,h,terrain,vp,civ,mil,dock,infra,fort,supply,steel,oil,aluminium,rubber,chromium,crystals] = a;
    regions[id] = { id,name,owner,controller:owner,continent,x:x+w/2,y:y+h/2,w,h,polygon:poly(x,y,w,h),terrain,vp,
      buildings:{ civilian:civ,military:mil,dockyard:dock,infrastructure:infra,fort,supply,airbase:0 },
      resources:{ steel,oil,aluminium,rubber,chromium,crystals }, resistance:0, compliance:100, neighbors:[] };
  });

  S = {
    version:VERSION, mode, date:"1931-01-01", speed:0, player:null, selectedRegion:null, selectedDivisions:[],
    tab:"overview", mapMode:"political", wt:4, countries, regions, divisions:{}, movements:[], battles:[], wars:[],
    defeated:[], messages:[], newsQueue:[], modal:false, hist:{}, nextDiv:1, nextBattle:1, nextWar:1, autosave:0, settings:{pauseNews:true}
  };

  buildNeighbors();
  Object.keys(S.countries).forEach(id => Object.keys(S.countries).forEach(o => { if(id!==o) S.countries[id].relations[o]=baseRel(id,o); }));
  Object.keys(S.countries).forEach(id => { syncCountry(id); initProduction(id); spawnArmy(id); });
  return S;
}

function baseRel(a,b){
  const ia=COUNTRIES[a].ideology, ib=COUNTRIES[b].ideology;
  if(ia===ib) return 18;
  if((ia==="grey"&&ib==="parliamentary")||(ib==="grey"&&ia==="parliamentary")) return -30;
  if((ia==="crown"&&ib==="syndicate")||(ib==="crown"&&ia==="syndicate")) return -18;
  return 0;
}

function buildNeighbors(){
  const list = Object.values(S.regions);
  list.forEach(a => list.forEach(b => {
    if(a.id===b.id || a.continent!==b.continent) return;
    const dx=Math.abs(a.x-b.x), dy=Math.abs(a.y-b.y);
    if(dx <= (a.w+b.w)/2+34 && dy <= (a.h+b.h)/2+34) a.neighbors.push(b.id);
  }));
  [["holmgrad","westhaven"],["westhaven","silverport"],["east_ports","hakuro"],["east_ports","naval_yards"],["south_mandate","lumin_bases"],["silverport","lumin_bases"]].forEach(([a,b])=>{
    if(R(a)&&R(b)){ R(a).neighbors.push(b); R(b).neighbors.push(a); }
  });
  list.forEach(r => r.neighbors=[...new Set(r.neighbors)]);
}

function syncCountry(id){
  const f = factories(id);
  const c = C(id);
  c.civ = f.civilian; c.mil = f.military; c.dock = f.dockyard; c.industry = f.civilian+f.military+f.dockyard;
}

function factories(id){
  return controlled(id).reduce((o,r)=>{ o.civilian+=r.buildings.civilian||0; o.military+=r.buildings.military||0; o.dockyard+=r.buildings.dockyard||0; return o; }, {civilian:0,military:0,dockyard:0});
}
function resources(id){
  return controlled(id).reduce((o,r)=>{ Object.keys(RES).forEach(k=>o[k]+=(r.resources[k]||0)); return o; }, {steel:0,oil:0,aluminium:0,rubber:0,chromium:0,crystals:0});
}
function controlled(id){ return Object.values(S.regions).filter(r=>r.controller===id); }
function owned(id){ return Object.values(S.regions).filter(r=>r.owner===id); }
function divisionsOf(id){ return Object.values(S.divisions).filter(d=>d.owner===id); }
function divisionsIn(region, owner=null){ return Object.values(S.divisions).filter(d=>d.location===region && (!owner || d.owner===owner)); }
function defeated(id){ return S.defeated.includes(id) || C(id)?.defeated; }

function initProduction(id){
  const c=C(id), f=factories(id); let mil=f.military, dock=f.dockyard;
  const add=(eq,n)=>{ const cat=EQ[eq].cat, used=c.production.filter(l=>EQ[l.eq].cat===cat).reduce((s,l)=>s+l.factories,0); const cap=cat==="dock"?dock:mil; const x=Math.max(0,Math.min(n,cap-used)); if(x>0)c.production.push({eq,factories:x,eff:.35}); };
  add("infantry_equipment",Math.ceil(mil*.35)); add("support_equipment",Math.ceil(mil*.12)); add("artillery",Math.ceil(mil*.13));
  add("trucks",Math.ceil(mil*.12)); add("light_tanks",Math.ceil(mil*.12)); add("fighters",Math.ceil(mil*.12)); add("convoys",Math.ceil(dock*.7));
}

function spawnArmy(id){
  const regs=owned(id); let i=0;
  Object.entries(C(id).army).forEach(([tpl,n]) => { for(let k=0;k<n;k++){ addDivision(id,tpl,regs[i++%regs.length].id); }});
}

function addDivision(owner,tpl,region,name=null){
  const t=TPL[tpl], c=C(owner); if(!t||!R(region)) return null;
  const id=`D${S.nextDiv++}`, org=Math.round(t.s.org*(1+(c.mods.org||0)));
  S.divisions[id]={id,owner,name:name||`${t.name} ${id}`,template:tpl,location:region,destination:null,hp:t.s.hp,maxHp:t.s.hp,org,maxOrg:org,xp:0,status:"idle",battle:null,entrench:0};
  return S.divisions[id];
}

function dateText(){ return new Date(S.date).toLocaleDateString("ru-RU",{day:"2-digit",month:"long",year:"numeric"}); }
function addDay(){ const d=new Date(S.date); d.setUTCDate(d.getUTCDate()+1); S.date=d.toISOString().slice(0,10); }

function moneyIncome(id){
  const c=C(id), f=factories(id), r=resources(id), i=IDEO[c.ideology];
  const res=Object.entries(r).reduce((s,[k,v])=>s+v*(k==="oil"||k==="crystals"?.065:.035),0);
  const maint=divisionsOf(id).reduce((s,d)=>s+TPL[d.template].money*.0012,0);
  return Math.max(.2,(f.civilian*.78+f.military*.28+f.dockyard*.25+res)*(0.75+c.stability/140)*(c.wars.length?1.08:1)*i.money-maint);
}
function ppGain(id){ const c=C(id); return Math.max(.25,c.ppGain*IDEO[c.ideology].pp+(c.wars.length?.15:0)+(c.stability<45?-.2:0)); }
function consumer(id){ const c=C(id); let x=.32; if(["grey","syndicate"].includes(c.ideology))x-=.04; if(c.stability<45)x+=.06; if(c.wars.length)x-=.08; return clamp(x,.12,.48); }
function buildCiv(id){ const f=factories(id).civilian; return Math.max(0,f-Math.ceil(f*consumer(id))); }
function freeCiv(id){ const c=C(id); return Math.max(0,buildCiv(id)-c.buildQueue.length); }
function supplyLimit(region){ const r=R(region), t=TERRAIN[r.terrain]; return (2+r.buildings.infrastructure*1.5+r.buildings.supply*4+r.buildings.dockyard*.5)*t.supply; }
function supplyUse(region,owner){ return divisionsIn(region,owner).reduce((s,d)=>s+TPL[d.template].s.supply,0); }
function supplyRatio(region,owner){ const lim=supplyLimit(region)*(1+(C(owner).mods.supply||0)), use=supplyUse(region,owner); return use?clamp(lim/use,.22,1.2):1; }
function fuelRatio(id,t){ if(!t.s.fuel)return 1; return C(id).fuel<=0?.35:clamp(C(id).fuel/120,.45,1); }

function divStats(d){
  const t=TPL[d.template], c=C(d.owner), terr=TERRAIN[R(d.location).terrain], sr=supplyRatio(d.location,d.owner), fr=fuelRatio(d.owner,t);
  let atk=t.s.atk*(t.family==="infantry"?1+(c.mods.infAtk||0):1)*(t.family==="tank"?1+(c.mods.tankAtk||0):1);
  atk*=clamp(d.hp/d.maxHp,.1,1)*(0.55+0.45*clamp(d.org/d.maxOrg,.15,1))*(.7+.3*sr)*(t.family==="tank"?fr:1);
  let def=t.s.def*(1+(c.mods.defense||0))*clamp(d.hp/d.maxHp,.1,1)*(.72+.28*sr);
  return { atk, def, brk:t.s.brk*fr, armor:t.s.armor, pierce:t.s.pierce, speed:t.s.speed*(.65+.35*sr)*fr/terr.move, supply:sr, fuel:fr };
}

function sameFaction(a,b){ return C(a)?.faction && C(a).faction===C(b)?.faction; }
function atWar(a,b){ return S.wars.some(w=>w.active && ((w.a.includes(a)&&w.d.includes(b))||(w.a.includes(b)&&w.d.includes(a)))); }
function hasGoal(a,b){ return C(a)?.wargoals.includes(b); }
function addGoal(a,b){ if(C(a)&&C(b)&&a!==b&&!C(a).wargoals.includes(b)) C(a).wargoals.push(b); }
function remGoal(a,b){ C(a).wargoals=C(a).wargoals.filter(x=>x!==b); }
function warCost(a,b){ const m=1-clamp(S.wt/200,0,.35), ide=IDEO[C(a).ideology].war; return {money:Math.round(120*ide*m), pp:Math.round(45*ide*m)}; }
function justCost(a,b){ const ide=IDEO[C(a).ideology].justify; return {money:Math.round(70*ide), pp:Math.round(45*ide)}; }

function warError(a,b,goal=true){
  if(!C(a)||!C(b))return"Страна не существует.";
  if(a===b)return"Нельзя воевать с собой.";
  if(defeated(a)||defeated(b))return"Нельзя воевать с капитулировавшей страной.";
  if(sameFaction(a,b))return"Нельзя объявить войну союзнику.";
  if(atWar(a,b))return"Война уже идёт.";
  if(goal&&!hasGoal(a,b))return"Нет цели войны.";
  return null;
}
function justifyError(a,b){
  if(!C(a)||!C(b))return"Страна не существует.";
  if(a===b)return"Нельзя оправдать войну против себя.";
  if(defeated(a)||defeated(b))return"Цель капитулировала.";
  if(sameFaction(a,b))return"Нельзя оправдывать войну против союзника.";
  if(atWar(a,b))return"Страны уже воюют.";
  if(hasGoal(a,b))return"Цель войны уже есть.";
  return null;
}
function justify(a,b,player=true){
  const e=justifyError(a,b); if(e){ if(player)note(e,"bad"); return false; }
  const c=C(a), cost=justCost(a,b); if(c.money<cost.money||c.pp<cost.pp){ if(player)note(`Нужно ${cost.money} денег и ${cost.pp} политвласти.`,"bad"); return false; }
  c.money-=cost.money; c.pp-=cost.pp; addGoal(a,b); S.wt=clamp(S.wt+4,0,100); note(`${c.short} получает цель войны против ${C(b).short}.`,"warn"); return true;
}
function declareWar(a,b,opt={}){
  const e=warError(a,b,!opt.freeGoal); if(e){ if(opt.player!==false)note(e,"bad"); return false; }
  const c=C(a), cost=warCost(a,b); if(!opt.free && (c.money<cost.money||c.pp<cost.pp)){ if(opt.player!==false)note(`Для войны нужно ${cost.money} денег и ${cost.pp} политвласти.`,"bad"); return false; }
  if(!opt.free){ c.money-=cost.money; c.pp-=cost.pp; } remGoal(a,b);
  const w={id:`W${S.nextWar++}`,name:`${C(a).short} против ${C(b).short}`,a:[a],d:[b],active:true,start:S.date};
  factionJoin(a,b,w); factionJoin(b,a,w); S.wars.push(w); w.a.forEach(id=>addWar(id,w.id)); w.d.forEach(id=>addWar(id,w.id));
  S.wt=clamp(S.wt+10,0,100); news("Началась война", `${esc(C(a).name)} объявляет войну против ${esc(C(b).name)}.`); return true;
}
function factionJoin(side,enemy,w){ if(!C(side).faction)return; Object.keys(S.countries).forEach(id=>{ if(id!==side&&C(id).faction===C(side).faction&&!defeated(id)&&!atWar(id,enemy)&&!sameFaction(id,enemy)){ const list=side===w.a[0]?w.a:w.d; if(!list.includes(id))list.push(id); } });}
function addWar(id,w){ if(!C(id).wars.includes(w))C(id).wars.push(w); }

function selectRegion(id){ if(!R(id))return; if(S.selectedDivisions.length){ orderTo(id); return; } S.selectedRegion=id; renderAll(); }
function selectDivision(id,add=false){ if(!D(id))return; if(!add)S.selectedDivisions=[]; S.selectedDivisions=S.selectedDivisions.includes(id)?S.selectedDivisions.filter(x=>x!==id):[...S.selectedDivisions,id]; S.selectedRegion=D(id).location; renderAll(); }
function clearSelection(){ S.selectedDivisions=[]; S.selectedRegion=null; renderAll(); }

function canMove(d,target){
  const r=R(d.location), t=R(target); if(!t)return"Нет региона.";
  if(d.status!=="idle")return"Дивизия занята.";
  if(!r.neighbors.includes(target))return"Можно двигаться только в соседний регион.";
  if(t.controller!==d.owner&&!atWar(d.owner,t.controller))return"Нельзя входить в чужой регион без войны.";
  if(defeated(d.owner))return"Страна капитулировала.";
  return null;
}
function orderTo(target){
  const units=S.selectedDivisions.map(D).filter(d=>d&&d.owner===S.player), r=R(target); if(!units.length)return note("Выберите свои дивизии.","bad");
  const attack=r.controller!==S.player, cost=units.reduce((s,d)=>s+(attack?TPL[d.template].attackMoney:TPL[d.template].moveMoney),0);
  if(C(S.player).money<cost)return note(`Недостаточно денег для приказа. Нужно ${cost}.`,"bad");
  const valid=units.filter(d=>!canMove(d,target)); if(!valid.length)return note(canMove(units[0],target),"bad");
  C(S.player).money-=cost;
  if(attack){ if(!atWar(S.player,r.controller))return note("Нужна война с владельцем региона.","bad"); startBattle(valid.map(d=>d.id),target); }
  else valid.forEach(d=>startMove(d.id,target));
  note(`${attack?"Атака":"Перемещение"}: ${valid.length} див. Стоимость ${cost} денег.`,"ok"); renderAll();
}
function startMove(id,target){
  const d=D(id), t=R(target), st=divStats(d); const days=clamp(Math.ceil(TERRAIN[t.terrain].move*4.5/Math.max(.35,st.speed)),2,14);
  d.status="moving"; d.destination=target; d.entrench=0; S.movements.push({id,from:d.location,to:target,left:days,total:days});
}
function startBattle(ids,region){
  const r=R(region), atk=ids.map(D).filter(d=>d&&d.status==="idle"&&atWar(d.owner,r.controller)); if(!atk.length)return false;
  const def=divisionsIn(region,r.controller).filter(d=>!defeated(d.owner)).map(d=>d.id);
  if(!def.length){ r.controller=atk[0].owner; atk.forEach(d=>startMove(d.id,region)); note(`${C(atk[0].owner).short} занимает ${r.name} без боя.`,"ok"); return true; }
  const id=`B${S.nextBattle++}`; atk.forEach(d=>{d.status="battle";d.destination=region;d.battle=id;d.entrench=0;}); def.forEach(x=>{D(x).status="battle";D(x).battle=id;});
  S.battles.push({id,region,attacker:atk[0].owner,defender:r.controller,atk:atk.map(d=>d.id),def,days:0}); note(`Началась битва за ${r.name}.`,"warn"); return true;
}

function movementTick(){
  [...S.movements].forEach(m=>{ const d=D(m.id); if(!d){S.movements=S.movements.filter(x=>x!==m);return;} m.left--; if(m.left>0)return;
    const t=R(m.to); S.movements=S.movements.filter(x=>x!==m); d.destination=null;
    if(t.controller!==d.owner&&atWar(d.owner,t.controller)){ d.status="idle"; startBattle([d.id],t.id); return; }
    if(t.controller===d.owner){ d.location=t.id; d.status="idle"; } else d.status="idle";
  });
}
function battleTick(){
  [...S.battles].forEach(b=>{
    b.atk=b.atk.filter(id=>D(id)&&D(id).hp>0&&!defeated(D(id).owner)); b.def=b.def.filter(id=>D(id)&&D(id).hp>0&&!defeated(D(id).owner));
    if(!b.atk.length)return endBattle(b,"def");
    if(!b.def.length)return winBattle(b);
    b.days++;
    const terr=TERRAIN[R(b.region).terrain], ap=b.atk.reduce((s,id)=>s+divStats(D(id)).atk,0)*terr.atk, dp=b.def.reduce((s,id)=>s+divStats(D(id)).def,0)*terr.def;
    damage(b.def,Math.max(1,ap*rnd(.09,.14)),true); damage(b.atk,Math.max(1,dp*rnd(.08,.13)),false);
    if(b.atk.every(id=>!D(id)||D(id).org<=0||D(id).hp<=0))endBattle(b,"def"); else if(b.def.every(id=>!D(id)||D(id).org<=0||D(id).hp<=0))winBattle(b);
  }); cleanArmies();
}
function damage(ids,dmg,attacking){ const a=ids.map(D).filter(Boolean), per=dmg/Math.max(1,a.length); a.forEach(d=>{d.hp=clamp(d.hp-per*(attacking?.18:.14),0,d.maxHp);d.org=clamp(d.org-per*(attacking?.65:.55),0,d.maxOrg);d.xp=clamp(d.xp+.18,0,100);}); }
function winBattle(b){
  const r=R(b.region), winner=b.attacker, loser=b.defender; r.controller=winner; r.resistance=r.owner===winner?0:clamp(r.resistance+8,0,100); r.compliance=r.owner===winner?100:clamp(r.compliance-8,0,100);
  b.atk.forEach(id=>{ const d=D(id); if(d){d.location=r.id;d.status="idle";d.destination=null;d.battle=null;d.org=Math.max(4,d.org);} });
  b.def.forEach(id=>{ const d=D(id); if(!d)return; const ret=retreat(d.owner,r.id); if(ret){d.location=ret;d.status="idle";d.battle=null;d.org=Math.max(2,d.org);} else d.hp=0; });
  S.battles=S.battles.filter(x=>x!==b); note(`${C(winner).short} захватывает ${r.name}.`,winner===S.player?"ok":"warn"); capitulationCheck(loser,winner);
}
function endBattle(b){ [...b.atk,...b.def].forEach(id=>{const d=D(id); if(d){d.status="idle";d.destination=null;d.battle=null;d.org=Math.max(2,d.org);}}); S.battles=S.battles.filter(x=>x!==b); note(`Атака на ${R(b.region).name} отбита.`,"warn"); }
function retreat(owner,from){ return R(from).neighbors.find(id=>R(id).controller===owner&&!S.battles.some(b=>b.region===id)); }
function capitulationCheck(id,winner){
  if(defeated(id))return; const regs=owned(id), total=regs.reduce((s,r)=>s+r.vp,0), ctrl=regs.filter(r=>r.controller===id).reduce((s,r)=>s+r.vp,0); if(total&&ctrl/total>(C(id).stability<45?.42:.32))return; capitulate(id,winner);
}
function capitulate(id,winner){
  const c=C(id); c.defeated=true; S.defeated.push(id); c.wars=[]; c.focus=null; c.research=[]; c.buildQueue=[]; c.training=[]; c.production=[];
  Object.values(S.regions).forEach(r=>{ if(r.owner===id||r.controller===id){r.controller=winner;r.resistance=r.owner===winner?0:clamp(r.resistance+18,0,100);} });
  Object.values(S.divisions).forEach(d=>{ if(d.owner===id)d.hp=0; }); cleanArmies();
  S.wars.forEach(w=>{w.a=w.a.filter(x=>x!==id);w.d=w.d.filter(x=>x!==id);if(!w.a.length||!w.d.length)w.active=false;}); S.wars=S.wars.filter(w=>w.active); Object.values(S.countries).forEach(o=>o.wars=o.wars.filter(wid=>S.wars.some(w=>w.id===wid)));
  news("Капитуляция", `${esc(c.name)} теряет ключевые центры и выходит из войны.`);
}
function cleanArmies(){ Object.values(S.divisions).forEach(d=>{ if(d.hp<=0)delete S.divisions[d.id]; }); S.selectedDivisions=S.selectedDivisions.filter(id=>S.divisions[id]); S.movements=S.movements.filter(m=>S.divisions[m.id]); S.battles=S.battles.filter(b=>b.atk.some(id=>S.divisions[id])&&b.def.some(id=>S.divisions[id])); }

function focusList(id){ return FOCUS[id] || []; }
function getFocus(id,fid){ return focusList(id).find(f=>f.id===fid); }
function focusErr(id,f){ const c=C(id); if(c.focus)return"Уже выбран фокус."; if(c.completed.includes(f.id))return"Завершён."; if(f.req.some(x=>!c.completed.includes(x)))return"Нужны предыдущие фокусы."; if(f.cond.wt&&S.wt<f.cond.wt)return`Нужно напряжение ${f.cond.wt}%.`; if(defeated(id))return"Страна капитулировала."; return null; }
function startFocus(id,fid){ const f=getFocus(id,fid), e=focusErr(id,f); if(e)return note(e,"bad"); C(id).focus={id:fid,left:f.days,total:f.days}; note(`Выбран фокус: ${f.title}.`,"ok"); renderAll(); }
function effect(id,fx){
  const c=C(id);
  fx.forEach(e=>{
    if(e[0]==="money")c.money+=e[1]; if(e[0]==="stability")c.stability=clamp(c.stability+e[1],0,100); if(e[0]==="warSupport")c.warSupport=clamp(c.warSupport+e[1],0,100);
    if(e[0]==="wt")S.wt=clamp(S.wt+e[1],0,100); if(e[0]==="wargoal")addGoal(id,e[1]); if(e[0]==="mod")c.mods[e[1]]=(c.mods[e[1]]||0)+e[2];
    if(e[0]==="faction"&&!c.faction)c.faction=e[1];
    if(e[0]==="building"){ const r=R(e[1]); if(r&&r.controller===id)r.buildings[e[2]]=clamp((r.buildings[e[2]]||0)+e[3],0,BUILD[e[2]].max); }
    if(e[0]==="res"){ const r=R(e[1]); if(r&&r.controller===id)r.resources[e[2]]=Math.max(0,(r.resources[e[2]]||0)+e[3]); }
    if(e[0]==="spawn"){ for(let i=0;i<e[2];i++){ const reg=spawnRegion(id); if(reg)addDivision(id,e[1],reg); } }
    if(e[0]==="news")news(e[1],e[2]);
  });
}
function techErr(id,tid){ const c=C(id); if(c.tech.includes(tid))return"Уже изучено."; if(c.research.some(r=>r.id===tid))return"Уже изучается."; if(c.research.length>=c.slots)return"Нет слота."; return null; }
function startTech(tid){ const e=techErr(S.player,tid); if(e)return note(e,"bad"); C(S.player).research.push({id:tid,left:TECH[tid].days,total:TECH[tid].days}); note(`Начато исследование: ${TECH[tid].name}.`,"ok"); renderAll(); }

function addBuild(building){
  const id=S.player,r=R(S.selectedRegion),c=C(id),b=BUILD[building]; if(!r)return note("Выберите регион.","bad"); if(r.controller!==id)return note("Строить можно только в своём регионе.","bad");
  const planned=c.buildQueue.filter(j=>j.region===r.id&&j.building===building).length; if((r.buildings[building]||0)+planned>=b.max)return note("Лимит здания.","bad"); if(c.money<b.money)return note(`Нужно ${b.money} денег.`,"bad");
  c.money-=b.money; c.buildQueue.push({region:r.id,building,progress:0,cost:b.cost}); note(`В очередь: ${b.name} в ${r.name}.`,"ok"); renderAll();
}
function train(tpl){
  const c=C(S.player),t=TPL[tpl]; if(c.money<t.money)return note(`Нужно ${t.money} денег.`,"bad"); if(c.manpower<t.manpower)return note("Недостаточно рекрутов.","bad"); if(!spawnRegion(S.player))return note("Нет контролируемой столицы/региона.","bad");
  c.money-=t.money; c.training.push({tpl,left:t.days,total:t.days}); note(`Начато обучение: ${t.name}.`,"ok"); renderAll();
}
function spawnRegion(id){ const c=C(id); if(R(c.capital)?.controller===id)return c.capital; return controlled(id).find(r=>r.owner===id)?.id || controlled(id)[0]?.id; }

function addLine(eq){ C(S.player).production.push({eq,factories:1,eff:.35}); normalizeProd(S.player); renderAll(); }
function lineDelta(i,d){ const c=C(S.player); c.production[i].factories+=d; if(c.production[i].factories<=0)c.production.splice(i,1); normalizeProd(S.player); renderAll(); }
function normalizeProd(id){ const c=C(id),f=factories(id),used={mil:0,dock:0}; c.production.forEach(l=>{ const cat=EQ[l.eq].cat,cap=cat==="dock"?f.dockyard:f.military,free=Math.max(0,cap-used[cat]); l.factories=Math.min(Math.max(0,l.factories),free); used[cat]+=l.factories; }); c.production=c.production.filter(l=>l.factories>0); }
function resRatio(id,eq,fac){ let ratio=1,r=resources(id); Object.entries(EQ[eq].res).forEach(([k,v])=>{ const need=v*fac; if(need)ratio=Math.min(ratio,(r[k]||0)/need); }); return clamp(ratio,.25,1); }

function day(){
  addDay(); Object.keys(S.countries).forEach(countryDay); movementTick(); battleTick(); aiTick(); histTick(); autosave(); renderAll();
}
function countryDay(id){
  const c=C(id); if(defeated(id))return;
  c.money+=moneyIncome(id); c.pp+=ppGain(id); c.fuel=clamp(c.fuel+resources(id).oil*.7-fuelUse(id),0,5000);
  if(c.focus){ c.focus.left--; if(c.focus.left<=0){ const f=getFocus(id,c.focus.id); c.completed.push(c.focus.id); c.focus=null; if(f){effect(id,f.fx); note(`${c.short}: завершён фокус «${f.title}».`,id===S.player?"ok":"muted");}}}
  c.research.forEach(r=>r.left--); c.research.filter(r=>r.left<=0).forEach(r=>{c.tech.push(r.id); effect(id,TECH[r.id].fx); note(`${c.short}: изучено «${TECH[r.id].name}».`,id===S.player?"ok":"muted");}); c.research=c.research.filter(r=>r.left>0);
  buildTick(id); prodTick(id); trainingTick(id); orgTick(id); resistanceTick(id);
}
function fuelUse(id){ return divisionsOf(id).reduce((s,d)=>s+TPL[d.template].s.fuel*(["moving","battle"].includes(d.status)?1:.15),0); }
function buildTick(id){ const c=C(id),usable=buildCiv(id); if(!c.buildQueue.length||usable<=0)return; c.buildQueue=c.buildQueue.filter(j=>R(j.region)?.controller===id); const per=usable*4.8*(1+(c.mods.build||0))/Math.max(1,c.buildQueue.length); [...c.buildQueue].forEach(j=>{ const r=R(j.region),b=BUILD[j.building]; if(!r||r.controller!==id)return; j.progress+=per; if(j.progress>=j.cost){r.buildings[j.building]=clamp((r.buildings[j.building]||0)+1,0,b.max); c.buildQueue=c.buildQueue.filter(x=>x!==j); note(`${c.short}: построено ${b.name} в ${r.name}.`,id===S.player?"ok":"muted");}}); }
function prodTick(id){ const c=C(id),f=factories(id),used={mil:0,dock:0}; c.production.forEach(l=>{ const cat=EQ[l.eq].cat,cap=cat==="dock"?f.dockyard:f.military,actual=Math.min(l.factories,Math.max(0,cap-used[cat])); used[cat]+=actual; if(actual<=0)return; const out=actual*EQ[l.eq].out*l.eff*resRatio(id,l.eq,actual)*(1+(c.mods.prod||0)); c.stock[l.eq]=(c.stock[l.eq]||0)+out; l.eff=clamp(l.eff+.002,.35,1); }); }
function trainingTick(id){ const c=C(id); [...c.training].forEach(t=>{ t.left--; if(t.left>0)return; const tpl=TPL[t.tpl]; if(c.manpower<tpl.manpower||!hasEq(id,t.tpl)){t.left=3;return;} const reg=spawnRegion(id); if(!reg){t.left=3;return;} c.manpower-=tpl.manpower; payEq(id,t.tpl); addDivision(id,t.tpl,reg); c.training=c.training.filter(x=>x!==t); note(`${c.short}: сформирована ${tpl.name}.`,id===S.player?"ok":"muted"); });}
function hasEq(id,tpl){ const c=C(id),t=TPL[tpl]; return Object.entries(t.eq).every(([eq,n])=>(c.stock[eq]||0)>=n); }
function payEq(id,tpl){ const c=C(id),t=TPL[tpl]; Object.entries(t.eq).forEach(([eq,n])=>c.stock[eq]-=n); }
function orgTick(id){ divisionsOf(id).forEach(d=>{ if(d.status==="idle"){d.org=clamp(d.org+1.1*supplyRatio(d.location,id),0,d.maxOrg); d.entrench=clamp((d.entrench||0)+.35,0,15);}}); }
function resistanceTick(id){ controlled(id).forEach(r=>{ if(r.owner===id)return; r.resistance=clamp(r.resistance+.025+S.wt/6000,0,100); if(r.resistance>70&&Math.random()<.003)r.buildings.infrastructure=Math.max(0,r.buildings.infrastructure-1);}); }

function aiTick(){ const d=new Date(S.date).getUTCDate(); if(![1,7,14,21,28].includes(d))return; Object.keys(S.countries).forEach(id=>{ if(id===S.player||defeated(id))return; aiFocus(id); aiResearch(id); aiBuild(id); aiTrain(id); aiDiplomacy(id); aiOrders(id); });}
function aiFocus(id){ const c=C(id); if(c.focus)return; const a=focusList(id).filter(f=>!focusErr(id,f)); const p=S.mode==="random"?a[Math.floor(Math.random()*a.length)]:a[0]; if(p)c.focus={id:p.id,left:p.days,total:p.days};}
function aiResearch(id){ const c=C(id); if(c.research.length>=c.slots)return; const t=Object.keys(TECH).find(k=>!techErr(id,k)); if(t)c.research.push({id:t,left:TECH[t].days,total:TECH[t].days});}
function aiBuild(id){ const c=C(id); if(c.buildQueue.length>=3)return; const r=controlled(id).filter(x=>x.owner===id).sort((a,b)=>b.buildings.infrastructure-a.buildings.infrastructure)[0]; if(!r)return; const b=c.ai==="aggressor"?"military":c.ai==="naval"?"dockyard":"civilian"; if(c.money>=BUILD[b].money){c.money-=BUILD[b].money;c.buildQueue.push({region:r.id,building:b,progress:0,cost:BUILD[b].cost});}}
function aiTrain(id){ const c=C(id); if(c.training.length>=2)return; const t=c.ai==="aggressor"&&c.stock.light_tanks>80?"light_tank":c.ai==="defender"?"infantry_basic":"militia"; if(c.money>=TPL[t].money&&c.manpower>=TPL[t].manpower){c.money-=TPL[t].money;c.training.push({tpl:t,left:TPL[t].days,total:TPL[t].days});}}
function aiDiplomacy(id){ const c=C(id); if(c.ai!=="aggressor")return; const t=["caldora","aurelia","ostromar"].find(x=>x!==id&&C(x)&&!sameFaction(id,x)&&!atWar(id,x)&&!defeated(x)); if(!t)return; if(S.wt>28&&!hasGoal(id,t)&&c.money>=justCost(id,t).money&&c.pp>=justCost(id,t).pp)justify(id,t,false); if(S.wt>38&&hasGoal(id,t))declareWar(id,t,{player:false});}
function aiOrders(id){ if(!C(id).wars.length)return; divisionsOf(id).filter(d=>d.status==="idle"&&d.org>d.maxOrg*.45).slice(0,5).forEach(d=>{ const r=R(d.location), enemy=r.neighbors.find(n=>R(n).controller!==id&&atWar(id,R(n).controller)); if(enemy&&Math.random()<.55)startBattle([d.id],enemy); else { const own=r.neighbors.find(n=>R(n).controller===id); if(own&&Math.random()<.2)startMove(d.id,own); }});}
function histTick(){ if(S.mode!=="historical")return; const events={"1932-03-01":()=>{addGoal("nordwald","caldora");S.wt+=6;news("Айзенбургский ультиматум","Нордвальд требует пересмотра северных границ.");},"1933-06-01":()=>{if(!warError("nordwald","caldora"))declareWar("nordwald","caldora",{player:false});},"1935-03-01":()=>{addGoal("seigan","ostromar");S.wt+=5;news("Сейганский инцидент","Флот Хакуро требует контроля восточных портов.");},"1935-09-01":()=>{if(!warError("seigan","ostromar"))declareWar("seigan","ostromar",{player:false});}}; if(events[S.date]&&!S.hist[S.date]){S.hist[S.date]=true;events[S.date]();}}
function autosave(){ const days=(new Date(S.date)-new Date("1931-01-01"))/86400000; if(days-S.autosave>=30){S.autosave=days;save(false);} }

function save(show=true){ try{localStorage.setItem(SAVE_KEY,JSON.stringify(S));if(show)note("Сохранение записано.","ok");}catch(e){note("Не удалось сохранить.","bad");}}
function load(){ const txt=localStorage.getItem(SAVE_KEY); if(!txt)return note("Сохранение не найдено.","bad"); const x=parseSave(txt); if(!x.ok)return note(x.error,"bad"); S=x.state; show("game"); note("Сохранение загружено.","ok"); renderAll(); startClock();}
function parseSave(txt){ try{ const s=JSON.parse(txt); if(!s||!s.countries||!s.regions||!s.divisions||!s.player)return{ok:false,error:"Некорректное сохранение."}; s.version=VERSION; return{ok:true,state:s}; }catch(e){return{ok:false,error:"Файл повреждён."};}}
function exportSave(){ const blob=new Blob([JSON.stringify(S,null,2)],{type:"application/json"}),a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`goi-1-save-${S.date}.json`; a.click(); URL.revokeObjectURL(a.href);}
function importSave(file){ if(!file)return; const r=new FileReader(); r.onload=()=>{const x=parseSave(String(r.result)); if(!x.ok)return note(x.error,"bad"); S=x.state; show("game"); note("Сохранение импортировано.","ok"); renderAll();}; r.readAsText(file);}

function note(text,type="muted"){ if(!S)return; S.messages.unshift({text:String(text),type,date:S.date}); S.messages=S.messages.slice(0,80); }
function news(title,body){ S.newsQueue.push({title,body}); showNews(); }
function showNews(){ if(S.modal||!S.newsQueue.length)return; const e=S.newsQueue.shift(); S.modal=true; if(S.settings.pauseNews){pauseBeforeNews.push(S.speed);S.speed=0;} $("#modal").classList.remove("hidden"); $("#modal").innerHTML=`<div class="modal-card"><div class="paper">Радиосводка</div><h2>${esc(e.title)}</h2><p>${e.body}</p><div class="modal-actions"><button id="closeNews" class="primary">Продолжить</button></div></div>`; $("#closeNews").onclick=()=>{$("#modal").classList.add("hidden");$("#modal").innerHTML="";S.modal=false;if(pauseBeforeNews.length)S.speed=pauseBeforeNews.pop();renderAll();showNews();}; renderTop(); }

function show(id){ $$(".screen").forEach(s=>s.classList.remove("active")); $("#"+id).classList.add("active"); }
function openSelect(mode){ selectMode=mode; selectedCountry=null; newGame(mode); $("#selectModeLabel").textContent=mode==="sandbox"?"Песочница":mode==="random"?"Случайные фокусы":mode==="historical"?"Исторический сценарий":"Обычный режим"; show("select"); renderSelect(); }
function startCampaign(){ if(!selectedCountry)return; S.player=selectedCountry; S.speed=0; show("game"); renderAll(); startClock(); news("Кампания начинается", `${esc(C(S.player).name)} вступает в 1931 год. Договоры ещё держатся, но заводы уже гудят.`); }
function startClock(){ if(timer)clearInterval(timer); timer=setInterval(()=>{ if(!S||S.speed<=0||S.modal)return; const n=S.speed>=4?2:1; for(let i=0;i<n;i++)day(); }, 900/Math.max(1,S?.speed||1));}

function renderSelect(){ drawMap("selectMap",true); renderCountryList(); renderCountryCard(); $("#startSelected").disabled=!selectedCountry; }
function renderCountryList(){ $("#countryList").innerHTML=Object.values(S.countries).map(c=>`<button class="country-btn" data-country="${c.id}"><span>${flagHtml(c.id)} ${esc(c.short)}</span><span class="muted">${esc(IDEO[c.ideology].short)}</span></button>`).join(""); $$("[data-country]").forEach(b=>b.onclick=()=>{selectedCountry=b.dataset.country;renderSelect();});}
function renderCountryCard(){ const box=$("#countryCard"); if(!selectedCountry){box.innerHTML=`<h2>Выберите страну</h2><p class="muted">Кликните по региону или стране в списке.</p>`;return;} const c=C(selectedCountry),f=factories(c.id),army=Object.values(c.army).reduce((a,b)=>a+b,0); box.innerHTML=`${flagHtml(c.id)}<h2>${esc(c.name)}</h2><p><span class="tag">${esc(IDEO[c.ideology].name)}</span> <span class="tag">${esc(c.diff)}</span></p><p><b>Лидер:</b> ${esc(c.leader)}</p><div class="metrics"><div class="metric"><span>Промышленность</span><strong>${f.civilian+f.military+f.dockyard}</strong></div><div class="metric"><span>Армия</span><strong>${army}</strong></div><div class="metric"><span>Деньги</span><strong>${fmt(c.money)}</strong></div><div class="metric"><span>Стабильность</span><strong>${fmt(c.stability)}%</strong></div></div><p><b>Проблема:</b> ${esc(c.problem)}</p><p><b>Стиль:</b> ${esc(c.style)}</p><p><b>История:</b> ${esc(c.history)}</p><p>${c.spirits.map(s=>`<span class="tag">${esc(s)}</span>`).join(" ")}</p>`;}

function renderAll(){ if(!S)return; Object.keys(S.countries).forEach(syncCountry); renderTop(); renderTabs(); renderTab(); renderRegionPanel(); renderNotes(); drawMap("worldMap",false); renderHint(); }
function renderTop(){ if(!S.player)return; const c=C(S.player),f=factories(S.player); $("#dateBox").innerHTML=`<b>${new Date(S.date).toLocaleDateString("ru-RU",{day:"2-digit",month:"long",year:"numeric"})}</b>`; $("#topStats").innerHTML=`<span class="stat-pill">💰 ${fmt(c.money,1)} <span class="muted">+${fmt(moneyIncome(S.player),1)}/д</span></span><span class="stat-pill">★ ${fmt(c.pp,1)} <span class="muted">+${fmt(ppGain(S.player),1)}/д</span></span><span class="stat-pill">🛠 ${f.civilian}/${f.military}/${f.dockyard}</span><span class="stat-pill">👥 ${fmt(c.manpower)}</span><span class="stat-pill">⛽ ${fmt(c.fuel)}</span><span class="stat-pill">🔥 ${fmt(S.wt)}%</span><span class="stat-pill">Выбрано: ${S.selectedDivisions.length}</span>`; $$(".speed button").forEach(b=>b.classList.toggle("active",Number(b.dataset.speed)===S.speed));}
function renderTabs(){ $$("#tabs button").forEach(b=>b.classList.toggle("active",b.dataset.tab===S.tab)); $$(".map-toolbar [data-map]").forEach(b=>b.classList.toggle("active",b.dataset.map===S.mapMode));}
function renderTab(){ const map={overview:tabOverview,politics:tabPolitics,focus:tabFocus,research:tabResearch,build:tabBuild,prod:tabProd,army:tabArmy,recruit:tabRecruit,diplo:tabDiplo,help:tabHelp}; $("#tabPanel").innerHTML=(map[S.tab]||tabOverview)(); bindTab(); }

function tabOverview(){ const c=C(S.player),f=factories(S.player),r=resources(S.player),d=divisionsOf(S.player); return `<h2>${esc(c.short)}</h2><p>${flagHtml(c.id)} ${esc(c.leader)}</p><div class="metrics"><div class="metric"><span>Деньги</span><strong>${fmt(c.money,1)}</strong></div><div class="metric"><span>Промышленность</span><strong>${f.civilian+f.military+f.dockyard}</strong></div><div class="metric"><span>Армия</span><strong>${d.length}</strong></div><div class="metric"><span>Войны</span><strong>${c.wars.length}</strong></div></div><div class="section-title">Ресурсы</div><p>${Object.entries(r).map(([k,v])=>`<span class="tag">${RES[k]}: ${fmt(v)}</span>`).join(" ")}</p><p>${esc(c.problem)}</p>`;}
function tabPolitics(){ const c=C(S.player),p=Object.entries(c.pop).sort((a,b)=>b[1]-a[1]); return `<h2>Политика</h2><p>${flagHtml(c.id)} <b>${esc(c.name)}</b></p><p><b>Лидер:</b> ${esc(c.leader)}</p><p><b>Идеология:</b> ${esc(IDEO[c.ideology].name)}</p><div class="metrics"><div class="metric"><span>Стабильность</span><strong>${fmt(c.stability)}%</strong></div><div class="metric"><span>Военная поддержка</span><strong>${fmt(c.warSupport)}%</strong></div><div class="metric"><span>Политвласть</span><strong>${fmt(c.pp,1)}</strong></div><div class="metric"><span>Фракция</span><strong>${esc(c.faction||"нет")}</strong></div></div>${p.map(([id,v])=>`<div class="item"><b>${esc(IDEO[id].name)}</b><div class="progress"><span style="width:${v}%"></span></div><span class="muted">${v}%</span></div>`).join("")}<p>${c.spirits.map(s=>`<span class="tag">${esc(s)}</span>`).join(" ")}</p>`;}
function tabFocus(){ const c=C(S.player),cur=c.focus?getFocus(S.player,c.focus.id):null; return `<h2>Фокусы</h2>${cur?`<div class="item selected"><b>${esc(cur.title)}</b><div class="progress"><span style="width:${100-c.focus.left/c.focus.total*100}%"></span></div><span class="muted">Осталось ${c.focus.left} дн.</span></div>`:`<p class="warn">Фокус не выбран.</p>`}${focusList(S.player).filter(f=>!c.focus||f.id!==c.focus.id).map(f=>{const e=focusErr(S.player,f),done=c.completed.includes(f.id);return `<div class="item ${done?"good":""}"><b>${esc(f.title)}</b><p class="muted">${esc(f.desc)}</p><span class="tag">${f.days} дн.</span> ${done?`<span class="tag ok">Завершён</span>`:`<button data-focus="${f.id}" ${e?"disabled":""}>Выбрать</button>`}${e&&!done?`<p class="small muted">${esc(e)}</p>`:""}</div>`}).join("")}`;}
function tabResearch(){ const c=C(S.player); return `<h2>Технологии</h2><p>Слоты: ${c.research.length}/${c.slots}</p>${c.research.map(r=>`<div class="item selected"><b>${esc(TECH[r.id].name)}</b><div class="progress"><span style="width:${100-r.left/r.total*100}%"></span></div><span class="muted">${r.left} дн.</span></div>`).join("")}<div class="section-title">Доступно</div>${Object.entries(TECH).map(([id,t])=>{const e=techErr(S.player,id);return `<div class="item"><b>${esc(t.name)}</b><p class="muted">${esc(t.desc)}</p><button data-tech="${id}" ${e?"disabled":""}>Исследовать</button>${e?`<p class="small muted">${esc(e)}</p>`:""}</div>`}).join("")}`;}
function tabBuild(){ const r=R(S.selectedRegion),c=C(S.player); return `<h2>Строительство</h2><p><b>Регион:</b> ${r?esc(r.name):"выберите на карте"}</p><p class="muted">Свободные гражданские фабрики: ${freeCiv(S.player)} / ${buildCiv(S.player)}</p><div class="two-col">${Object.entries(BUILD).map(([id,b])=>`<button data-build="${id}" ${!r||r.controller!==S.player||c.money<b.money?"disabled":""}>${esc(b.name)}<br><span class="small">${b.money}💰</span></button>`).join("")}</div><div class="section-title">Очередь</div>${c.buildQueue.map(j=>`<div class="item"><b>${esc(BUILD[j.building].name)}</b><p class="muted">${esc(R(j.region)?.name||j.region)}</p><div class="progress"><span style="width:${clamp(j.progress/j.cost*100,0,100)}%"></span></div></div>`).join("")||`<p class="muted">Очередь пуста.</p>`}`;}
function tabProd(){ const c=C(S.player),f=factories(S.player),usedMil=c.production.filter(l=>EQ[l.eq].cat==="mil").reduce((s,l)=>s+l.factories,0),usedDock=c.production.filter(l=>EQ[l.eq].cat==="dock").reduce((s,l)=>s+l.factories,0); return `<h2>Производство</h2><p>Заводы: ${usedMil}/${f.military} • Верфи: ${usedDock}/${f.dockyard}</p><p>${Object.entries(EQ).map(([id,e])=>`<span class="tag">${e.name}: ${fmt(c.stock[id]||0)}</span>`).join(" ")}</p>${c.production.map((l,i)=>`<div class="item"><b>${esc(EQ[l.eq].name)}</b><p class="muted">Заводы: ${l.factories} • Эфф: ${fmt(l.eff*100)}% • Ресурсы: ${fmt(resRatio(S.player,l.eq,l.factories)*100)}%</p><button data-line="${i}" data-delta="-1">-</button> <button data-line="${i}" data-delta="1">+</button></div>`).join("")}<div class="section-title">Добавить линию</div><div class="two-col">${Object.entries(EQ).map(([id,e])=>`<button data-add-line="${id}">${esc(e.name)}</button>`).join("")}</div>`;}
function tabArmy(){ const d=divisionsOf(S.player); return `<h2>Армия</h2><p class="muted">Выберите дивизии и кликните по соседнему региону. Перемещение и атаки стоят деньги.</p><div class="metrics"><div class="metric"><span>Всего</span><strong>${d.length}</strong></div><div class="metric"><span>Выбрано</span><strong>${S.selectedDivisions.length}</strong></div></div>${d.map(divCard).join("")||"<p class='muted'>Нет дивизий.</p>"}`;}
function divCard(d){ const t=TPL[d.template],s=divStats(d),sel=S.selectedDivisions.includes(d.id); return `<div class="item ${sel?"selected":""}"><b>${esc(d.name)}</b><p class="muted">${esc(t.kind)} • ${esc(R(d.location)?.name)} • ${esc({idle:"ожидает",moving:"движется",battle:"в бою"}[d.status])}</p><div class="progress green"><span style="width:${clamp(d.hp/d.maxHp*100,0,100)}%"></span></div><div class="progress"><span style="width:${clamp(d.org/d.maxOrg*100,0,100)}%"></span></div><p class="small">Атака ${fmt(s.atk,1)} • Защита ${fmt(s.def,1)} • Снабж. ${fmt(s.supply*100)}%</p><button data-div="${d.id}">${sel?"Снять":"Выбрать"}</button></div>`;}
function tabRecruit(){ const c=C(S.player); return `<h2>Обучение</h2><p>Рекруты: ${fmt(c.manpower)} • Деньги: ${fmt(c.money,1)}</p>${c.training.map(t=>`<div class="item"><b>${esc(TPL[t.tpl].name)}</b><div class="progress"><span style="width:${100-t.left/t.total*100}%"></span></div><span class="muted">${t.left} дн.</span></div>`).join("")}<div class="section-title">Шаблоны</div>${Object.entries(TPL).map(([id,t])=>`<div class="item"><b>${esc(t.name)}</b><p class="muted">${esc(t.desc)}</p><p class="small">Класс: ${esc(t.kind)} • ${t.money}💰 • ${fmt(t.manpower)} людей • ${t.days} дн.</p><button data-train="${id}" ${c.money<t.money||c.manpower<t.manpower?"disabled":""}>Обучить</button></div>`).join("")}`;}
function tabDiplo(){ const c=C(S.player); return `<h2>Дипломатия</h2><p>Мировое напряжение: ${fmt(S.wt)}%</p>${Object.values(S.countries).filter(o=>o.id!==S.player).map(o=>{const je=justifyError(S.player,o.id),we=warError(S.player,o.id),jc=justCost(S.player,o.id),wc=warCost(S.player,o.id);return `<div class="item ${atWar(S.player,o.id)?"danger":""}"><b>${flagHtml(o.id)} ${esc(o.name)}</b><p class="muted">${esc(IDEO[o.ideology].name)} • Отношения: ${c.relations[o.id]||0} • Фракция: ${esc(o.faction||"нет")}</p><p class="small">Цель войны: ${hasGoal(S.player,o.id)?"есть":"нет"} • Война: ${atWar(S.player,o.id)?"да":"нет"}</p><button data-justify="${o.id}" ${je?"disabled":""}>Оправдать ${jc.money}💰 ${jc.pp}★</button> <button class="danger" data-war="${o.id}" ${we?"disabled":""}>Война ${wc.money}💰 ${wc.pp}★</button>${we?`<p class="small muted">${esc(we)}</p>`:""}</div>`}).join("")}`;}
function tabHelp(){ return `<h2>Энциклопедия</h2><div class="item"><b>Движение дивизий</b><p>Во вкладке «Армия» выберите части и кликните по соседнему региону. Приказы стоят деньги.</p></div><div class="item"><b>Классы войск</b><p>Пехота: ополчение, базовая, элитная. Танки: лёгкие и средние. Танки сильны в атаке, но требуют топливо и снабжение.</p></div><div class="item"><b>Война</b><p>Нужна цель войны, деньги и политическая власть. Цель можно получить через дипломатию или фокусы.</p></div><div class="item"><b>Клавиши</b><p>Space — пауза, 1–4 — скорость, F/R/B/P/A/D — вкладки, Esc — снять выбор.</p></div>`;}

function bindTab(){ $$("[data-focus]").forEach(b=>b.onclick=()=>startFocus(S.player,b.dataset.focus)); $$("[data-tech]").forEach(b=>b.onclick=()=>startTech(b.dataset.tech)); $$("[data-build]").forEach(b=>b.onclick=()=>addBuild(b.dataset.build)); $$("[data-line]").forEach(b=>b.onclick=()=>lineDelta(+b.dataset.line,+b.dataset.delta)); $$("[data-add-line]").forEach(b=>b.onclick=()=>addLine(b.dataset.addLine)); $$("[data-div]").forEach(b=>b.onclick=e=>selectDivision(b.dataset.div,e.shiftKey)); $$("[data-train]").forEach(b=>b.onclick=()=>train(b.dataset.train)); $$("[data-justify]").forEach(b=>b.onclick=()=>{justify(S.player,b.dataset.justify);renderAll();}); $$("[data-war]").forEach(b=>b.onclick=()=>{declareWar(S.player,b.dataset.war);renderAll();});}

function renderRegionPanel(){ const r=R(S.selectedRegion); if(!r){$("#regionPanel").innerHTML=`<h3>Регион</h3><p class="muted">Выберите регион или дивизию.</p>`;return;} const divs=divisionsIn(r.id); $("#regionPanel").innerHTML=`<h3>${esc(r.name)}</h3><p>${esc(r.continent)} • ${esc(TERRAIN[r.terrain].name)}</p><p><b>Владелец:</b> ${flagHtml(r.owner)} ${esc(C(r.owner).short)}<br><b>Контроль:</b> ${flagHtml(r.controller)} ${esc(C(r.controller).short)}</p><div class="metrics"><div class="metric"><span>ПО</span><strong>${r.vp}</strong></div><div class="metric"><span>Снабжение</span><strong>${fmt(supplyLimit(r.id),1)}</strong></div><div class="metric"><span>Сопротивление</span><strong>${fmt(r.resistance)}%</strong></div><div class="metric"><span>Дивизии</span><strong>${divs.length}</strong></div></div><div class="section-title">Здания</div><p>${Object.entries(BUILD).map(([id,b])=>`<span class="tag">${esc(b.name)}: ${r.buildings[id]||0}</span>`).join(" ")}</p><div class="section-title">Ресурсы</div><p>${Object.entries(RES).map(([id,n])=>`<span class="tag">${esc(n)}: ${r.resources[id]||0}</span>`).join(" ")}</p><div class="section-title">Дивизии</div>${divs.map(d=>`<button data-panel-div="${d.id}">${flagHtml(d.owner)} ${esc(TPL[d.template].short)} ${esc(d.name)}</button>`).join(" ")||"<p class='muted'>Нет дивизий.</p>"}`; $$("[data-panel-div]").forEach(b=>b.onclick=e=>selectDivision(b.dataset.panelDiv,e.shiftKey));}
function renderNotes(){ $("#notes").innerHTML=S.messages.slice(0,12).map(m=>`<div class="log-line ${esc(m.type)}"><span class="muted">${esc(m.date)}</span> ${esc(m.text)}</div>`).join(""); }
function renderHint(){ $("#orderHint").textContent=S.selectedDivisions.length?"Кликните по соседнему региону: движение или атака за деньги.":"Выберите дивизию на карте или во вкладке «Армия»."; }

function color(r){ if(S.mapMode==="ideology")return IDEO[C(r.controller).ideology].color; if(S.mapMode==="resources"){const t=Object.values(r.resources).reduce((a,b)=>a+b,0);return t>35?"#d0a94e":t>15?"#8aa956":"#355c6c";} if(S.mapMode==="supply"){const s=supplyLimit(r.id);return s>18?"#60a875":s>10?"#b6a856":"#b45b55";} if(S.mapMode==="vp")return r.vp>=25?"#e0c257":r.vp>=12?"#8aa0c8":"#44556d"; return IDEO[C(r.controller).ideology].color; }
function drawMap(svgId,select){ const svg=$("#"+svgId); if(!svg||!S)return; const regs=Object.values(S.regions).map(r=>{const cls=["region"]; if(S.selectedRegion===r.id||select&&selectedCountry===r.owner)cls.push("selected"); if(!select&&S.selectedDivisions.length){const can=S.selectedDivisions.map(D).filter(Boolean).some(d=>R(d.location).neighbors.includes(r.id)); if(can&&r.controller===S.player)cls.push("move-target"); if(can&&r.controller!==S.player&&atWar(S.player,r.controller))cls.push("enemy-target");} if(S.battles.some(b=>b.region===r.id))cls.push("battle"); return `<polygon class="${cls.join(" ")}" data-region="${r.id}" points="${r.polygon}" fill="${color(r)}"><title>${esc(r.name)}</title></polygon>${r.vp>=18?`<circle class="capital-dot" cx="${r.x}" cy="${r.y}" r="${r.vp>=30?6:4}"></circle>`:""}${!select&&r.vp>=12?`<text class="region-label" x="${r.x}" y="${r.y+18}">${esc(r.name)}</text>`:""}`;}).join(""); const paths=!select?S.movements.map(m=>{const a=R(m.from),b=R(m.to);return a&&b?`<line class="path-line" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"></line>`:"";}).join(""):""; const battles=!select?S.battles.map(b=>{const r=R(b.region);return r?`<text class="battle-flash" x="${r.x}" y="${r.y-14}" font-size="26" text-anchor="middle">⚔</text>`:"";}).join(""):""; svg.innerHTML=`<rect x="0" y="0" width="1200" height="720" fill="rgba(4,16,29,.45)"></rect>${paths}${regs}${battles}${select?"":unitMarkup()}`; svg.querySelectorAll("[data-region]").forEach(el=>el.onclick=e=>{ if(select){selectedCountry=R(el.dataset.region).owner;renderSelect();} else selectRegion(el.dataset.region); e.stopPropagation(); }); svg.querySelectorAll("[data-unit]").forEach(el=>el.onclick=e=>{selectDivision(el.dataset.unit,e.shiftKey);e.stopPropagation();});}
function unitMarkup(){ const by={}; Object.values(S.divisions).forEach(d=>{(by[d.location] ||= []).push(d);}); return Object.entries(by).map(([rid,ds])=>{const r=R(rid); return ds.slice(0,6).map((d,i)=>{const x=r.x-24+(i%3)*24,y=r.y-9+Math.floor(i/3)*24,t=TPL[d.template],sel=S.selectedDivisions.includes(d.id),own=d.owner===S.player?"player":atWar(S.player,d.owner)?"enemy":""; return `<g class="unit ${own} ${sel?"selected":""}" data-unit="${d.id}" transform="translate(${x},${y})"><rect x="-10" y="-8" width="22" height="18" rx="3"></rect><text x="1" y="1">${esc(t.short)}</text><rect class="bar-bg" x="-10" y="12" width="22" height="3"></rect><rect class="bar-hp" x="-10" y="12" width="${22*clamp(d.hp/d.maxHp,0,1)}" height="3"></rect><rect class="bar-bg" x="-10" y="16" width="22" height="3"></rect><rect class="bar-org" x="-10" y="16" width="${22*clamp(d.org/d.maxOrg,0,1)}" height="3"></rect></g>`;}).join("");}).join("");}

function bindStatic(){
  $("#newGame").onclick=()=>openSelect("standard"); $("#sandboxMode").onclick=()=>openSelect("sandbox"); $("#historicalMode").onclick=()=>openSelect("historical"); $("#randomFocusMode").onclick=()=>openSelect("random"); $("#loadGame").onclick=load;
  $("#backMenu").onclick=()=>show("menu"); $("#mainMenuBtn").onclick=()=>show("menu"); $("#startSelected").onclick=startCampaign; $("#saveBtn").onclick=()=>save(true); $("#exportBtn").onclick=exportSave; $("#importFile").onchange=e=>importSave(e.target.files[0]);
  $("#settingsBtn").onclick=()=>info("Настройки","Автопауза новостей включена. Скорости, импорт и экспорт доступны в верхней панели."); $("#encyclopediaBtn").onclick=()=>info("Энциклопедия","В кампании откройте вкладку «Энциклопедия»."); $("#creditsBtn").onclick=()=>info("Авторы","GOI 1 — оригинальный браузерный прототип на HTML, CSS и JavaScript.");
  $$(".speed button").forEach(b=>b.onclick=()=>{S.speed=+b.dataset.speed;startClock();renderTop();}); $$("#tabs button").forEach(b=>b.onclick=()=>{S.tab=b.dataset.tab;renderAll();}); $$(".map-toolbar [data-map]").forEach(b=>b.onclick=()=>{S.mapMode=b.dataset.map;renderAll();}); $("#clearSelection").onclick=clearSelection;
  document.addEventListener("keydown",e=>{ if(!S)return; if(e.key===" "){e.preventDefault();S.speed=S.speed?0:1;startClock();renderAll();} if(["1","2","3","4"].includes(e.key)){S.speed=+e.key;startClock();renderAll();} const tabs={f:"focus",r:"research",b:"build",p:"prod",a:"army",d:"diplo",m:"overview"}; if(tabs[e.key.toLowerCase()]){S.tab=tabs[e.key.toLowerCase()];renderAll();} if(e.key==="Escape"){ if(!$("#modal").classList.contains("hidden")){$("#modal").classList.add("hidden");$("#modal").innerHTML="";S.modal=false;} else clearSelection(); }});
}
function info(title,body){ $("#modal").classList.remove("hidden"); $("#modal").innerHTML=`<div class="modal-card"><h2>${esc(title)}</h2><p>${esc(body)}</p><div class="modal-actions"><button id="closeInfo" class="primary">Закрыть</button></div></div>`; $("#closeInfo").onclick=()=>{$("#modal").classList.add("hidden");$("#modal").innerHTML="";};}
document.addEventListener("DOMContentLoaded",()=>{ bindStatic(); newGame("standard"); });
